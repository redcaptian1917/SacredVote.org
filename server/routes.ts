/**
 * @module server/routes
 *
 * Registers all HTTP routes on the Express app. Routes are grouped into:
 *   1. Public API — polls, voter verification, vote casting, contact form
 *   2. Admin auth — login/logout/verify with in-memory token Map and brute-force protection
 *   3. Admin CMS  — CRUD for site content, links, and images (behind requireAdmin)
 *   4. Database seeding — creates demo data on first run
 *
 * Every public endpoint references the shared API contract (`shared/routes.ts`)
 * for path strings and input schemas. Admin routes are not in the shared
 * contract because they are not consumed by typed frontend hooks.
 */

import express, { type Express } from "express";
import type { Server } from "http";
import { randomBytes, timingSafeEqual } from "crypto";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertSiteContentSchema, insertSiteLinkSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { recordAdminLoginAttempt, clearAdminLoginAttempts, verifyAdminReset, getClientIp } from "./security";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif)$/i;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, _file, cb) => {
    const uniqueName = randomBytes(24).toString("hex");
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 4 },
  fileFilter: (_req, file, cb) => {
    const extOk = ALLOWED_IMAGE_EXTENSIONS.test(path.extname(file.originalname));
    const mimeOk = ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype);
    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, or GIF images are allowed."));
    }
  },
});

function zodError(err: z.ZodError): string {
  return err.errors[0]?.message ?? "Invalid input";
}

function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (token.length !== 64 || !/^[0-9a-f]+$/.test(token)) return null;
  return token;
}

function safePasswordCompare(input: string, stored: string): boolean {
  try {
    const a = Buffer.from(input.padEnd(128).slice(0, 128));
    const b = Buffer.from(stored.padEnd(128).slice(0, 128));
    return timingSafeEqual(a, b) && input.length === stored.length;
  } catch {
    return false;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === Poll Routes (read-only public) ===
  app.get(api.polls.list.path, async (_req, res) => {
    try {
      const polls = await storage.getPolls();
      res.json(polls);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.polls.get.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ message: "Invalid poll ID" });
      }
      const poll = await storage.getPoll(id);
      if (!poll) return res.status(404).json({ message: "Poll not found" });
      res.json(poll);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Voter Verification ===
  app.post(api.voters.verify.path, async (req, res) => {
    try {
      const input = api.voters.verify.input.parse(req.body);
      const voter = await storage.getVoter(input.voterId);
      if (!voter) return res.json({ valid: false, hasVoted: false });
      res.json({ valid: true, hasVoted: voter.hasVoted });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: zodError(err) });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Cast Vote ===
  app.post(api.votes.cast.path, async (req, res) => {
    try {
      const input = api.votes.cast.input.parse(req.body);
      const voter = await storage.getVoter(input.voterId);
      if (!voter) return res.status(401).json({ message: "Invalid voter credential" });
      if (voter.hasVoted) return res.status(409).json({ message: "Ballot already submitted" });

      const poll = await storage.getPoll(input.pollId);
      const vote = await storage.castVote(input);
      await storage.markVoterAsVoted(input.voterId);

      res.status(201).json({
        success: true,
        pollId: vote.pollId,
        pollTitle: poll?.title || "Unknown Poll",
        optionSelected: vote.optionSelected,
        receiptHash: vote.receiptHash,
        timestamp: vote.timestamp?.toISOString() ?? new Date().toISOString(),
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: zodError(err) });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Contact Route ===
  app.post(api.contact.submit.path, async (req, res) => {
    try {
      const input = api.contact.submit.input.parse(req.body);
      await storage.createContactMessage(input);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: zodError(err) });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  /**
   * Admin Authentication — token-based, in-memory session store with brute-force
   * protection. Tokens are random 32-byte hex strings stored in a Map with TTL.
   * They live only in server memory and are lost on restart (intentional: admin
   * sessions are short-lived). Requires ADMIN_PASSWORD env var (>=16 chars in production).
   */
  const rawPassword = process.env.ADMIN_PASSWORD;
  if (!rawPassword || rawPassword.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_PASSWORD environment variable must be set and at least 16 characters in production.");
    }
    console.warn("[SECURITY WARNING] ADMIN_PASSWORD not set or too short. Admin panel is disabled.");
  }
  const ADMIN_PASSWORD = rawPassword ?? "";

  const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
  const adminSessions = new Map<string, number>();

  setInterval(() => {
    const now = Date.now();
    Array.from(adminSessions.entries()).forEach(([token, expiry]) => {
      if (now > expiry) adminSessions.delete(token);
    });
  }, 15 * 60_000);

  app.post("/api/admin/login", (req, res) => {
    const ip = getClientIp(req);

    if (!ADMIN_PASSWORD) {
      return res.status(503).json({ message: "Admin access not configured" });
    }

    if (!recordAdminLoginAttempt(ip, req.get('User-Agent') || 'Unknown')) {
      res.setHeader("Retry-After", "600");
      return res.status(429).json({ message: "Admin panel locked. Check your email for recovery instructions." });
    }

    const { password } = req.body ?? {};
    if (typeof password !== "string" || !safePasswordCompare(password, ADMIN_PASSWORD)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    clearAdminLoginAttempts(ip);
    const token = randomBytes(32).toString("hex");
    adminSessions.set(token, Date.now() + SESSION_TTL_MS);
    res.json({ success: true, token });
  });

  app.post("/api/admin/reset/:token", (req, res) => {
    const ip = getClientIp(req);
    const { token } = req.params;
    const { recoveryPassword } = req.body ?? {};
    console.log(`[DEBUG] [POST /api/admin/reset] Reset attempt for token ${token.substring(0, 8)}... from IP: ${ip}`);

    if (typeof recoveryPassword !== "string") {
      console.log(`[DEBUG] [RESET_FAIL] IP ${ip}: Missing recoveryPassword.`);
      return res.status(400).json({ message: "Recovery password required" });
    }

    if (verifyAdminReset(ip, token, recoveryPassword)) {
      console.log(`[DEBUG] [RESET_SUCCESS] IP ${ip}: Recovery verified. Clearing all CMS sessions.`);
      adminSessions.clear(); // Boot all logged-in users upon reset
      
      const { newAdminPassword, newRecoveryPassword } = req.body;
      if (newAdminPassword && newRecoveryPassword) {
        console.log(`[DEBUG] [RESET_UPGRADE] IP ${ip}: Rotating CMS credentials.`);
        try {
          const envPath = path.join(process.cwd(), ".env");
          let envContent = fs.readFileSync(envPath, "utf-8");
          envContent = envContent.replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD=${newAdminPassword}`);
          if (envContent.includes("RECOVERY_PASSWORD=")) {
            envContent = envContent.replace(/^RECOVERY_PASSWORD=.*$/m, `RECOVERY_PASSWORD=${newRecoveryPassword}`);
          } else {
            envContent += `\nRECOVERY_PASSWORD=${newRecoveryPassword}`;
          }
          fs.writeFileSync(envPath, envContent);
          console.log(`[SECURITY] [RESET_COMPLETE] CMS credentials updated. Restarting server...`);
          res.json({ success: true, message: "Admin passwords updated. Server is restarting..." });
          setTimeout(() => {
            console.log(`[DEBUG] [SERVER_EXIT] Process exiting for CMS restart.`);
            process.exit(0);
          }, 1000);
          return;
        } catch (err) {
          console.error(`[CRITICAL] [RESET_ERROR] IP ${ip}: Failed to update CMS .env:`, err);
          return res.status(500).json({ message: "Internal error while updating codes" });
        }
      }

      return res.json({ success: true, message: "Admin panel unlocked successfully" });
    } else {
      console.warn(`[SECURITY] [RESET_FAIL] IP ${ip}: Verification failed for token ${token.substring(0, 8)}...`);
      return res.status(401).json({ message: "Invalid reset token or recovery password" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    console.log(`[DEBUG] [POST /api/admin/logout] Terminating session for IP: ${getClientIp(req)}`);
    if (token) adminSessions.delete(token);
    res.json({ success: true });
  });

  app.get("/api/admin/verify", (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    const ip = getClientIp(req);
    if (token && adminSessions.has(token) && Date.now() < adminSessions.get(token)!) {
      console.log(`[DEBUG] [GET /api/admin/verify] Session VALID for IP: ${ip}`);
      return res.json({ authenticated: true });
    }
    console.log(`[DEBUG] [GET /api/admin/verify] Session INVALID for IP: ${ip}`);
    res.status(401).json({ authenticated: false });
  });

  const requireAdmin = (req: any, res: any, next: any) => {
    const token = extractBearerToken(req.headers.authorization);
    if (token && adminSessions.has(token) && Date.now() < adminSessions.get(token)!) {
      console.log(`[DEBUG] [requireAdmin] Admin authorized for ${req.method} ${req.path} from IP: ${getClientIp(req)}`);
      adminSessions.set(token, Date.now() + SESSION_TTL_MS);
      return next();
    }
    console.warn(`[SECURITY] [requireAdmin] Unauthorized access attempt to ${req.method} ${req.path} from IP: ${getClientIp(req)}`);
    res.status(401).json({ message: "Unauthorized" });
  };

  // === Uploads — served with strict security headers ===
  app.use("/uploads", (req, res, next) => {
    console.log(`[DEBUG] [GET /uploads] Request for ${req.path} from IP: ${getClientIp(req)}`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    const ext = path.extname(req.path).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
      console.warn(`[SECURITY] [GET /uploads] Blocked request for non-image extension: ${ext} from IP: ${getClientIp(req)}`);
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  }, express.static(uploadsDir, { dotfiles: "deny", index: false, fallthrough: false }));

  // === Poll creation — admin only ===
  app.post(api.polls.create.path, requireAdmin, async (req, res) => {
    try {
      console.log(`[DEBUG] [POST /api/polls] Creating new poll: "${req.body.title}" from IP: ${getClientIp(req)}`);
      const input = api.polls.create.input.parse(req.body);
      const poll = await storage.createPoll(input);
      console.log(`[DEBUG] [POST /api/polls] Successfully created poll ID: ${poll.id}`);
      res.status(201).json(poll);
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.warn(`[DEBUG] [POST /api/polls] Validation error:`, err.errors);
        return res.status(400).json({ message: zodError(err) });
      }
      console.error(`[CRITICAL] [POST /api/polls] Exception:`, err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Public CMS Routes (read-only) ===
  app.get("/api/content", async (_req, res) => {
    console.log(`[DEBUG] [GET /api/content] Fetching all site content.`);
    const content = await storage.getAllContent();
    res.json(content);
  });

  app.get("/api/content/:section", async (req, res) => {
    console.log(`[DEBUG] [GET /api/content/${req.params.section}] Fetching section content.`);
    const content = await storage.getContentBySection(req.params.section);
    res.json(content);
  });

  app.get("/api/images", async (_req, res) => {
    console.log(`[DEBUG] [GET /api/images] Listing all uploaded images.`);
    const images = await storage.getAllImages();
    res.json(images);
  });

  // === Admin CMS Routes ===

  app.get("/api/admin/content", requireAdmin, async (_req, res) => {
    try {
      res.json(await storage.getAllContent());
    } catch (err) {
      console.error(`[DEBUG] [GET /api/admin/content] Error:`, err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/content/:section", requireAdmin, async (req, res) => {
    try {
      const section = req.params.section.replace(/[^a-z0-9_-]/gi, "");
      console.log(`[DEBUG] [GET /api/admin/content/${section}] Admin fetching section.`);
      res.json(await storage.getContentBySection(section));
    } catch (err) {
      console.error(`[DEBUG] [GET /api/admin/content/${req.params.section}] Error:`, err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/content", requireAdmin, async (req, res) => {
    try {
      console.log(`[DEBUG] [POST /api/admin/content] Upserting content for section: ${req.body.section} from IP: ${getClientIp(req)}`);
      const input = insertSiteContentSchema.parse(req.body);
      const result = await storage.upsertContent(input);
      console.log(`[DEBUG] [POST /api/admin/content] Successfully updated ${input.section}/${input.key}`);
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: zodError(err) });
      console.error(`[DEBUG] [POST /api/admin/content] Error:`, err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/content/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const clientIp = getClientIp(req);
    console.log(`[DEBUG] [PUT /api/admin/content/${id}] Admin update request from IP: ${clientIp}`);
    try {
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid ID" });
      const input = insertSiteContentSchema.partial().parse(req.body);
      const updated = await storage.updateContentById(id, input);
      if (!updated) {
        console.warn(`[DEBUG] [PUT /api/admin/content/${id}] Content not found.`);
        return res.status(404).json({ message: "Content not found" });
      }
      console.log(`[DEBUG] [PUT /api/admin/content/${id}] SUCCESS: Updated block "${updated.key}"`);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: zodError(err) });
      console.error(`[CRITICAL] [PUT /api/admin/content/${id}] Exception:`, err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/content/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const clientIp = getClientIp(req);
    console.log(`[DEBUG] [DELETE /api/admin/content/${id}] Admin delete request from IP: ${clientIp}`);
    try {
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteContent(id);
      console.log(`[DEBUG] [DELETE /api/admin/content/${id}] SUCCESS: Block purged.`);
      res.json({ success: true });
    } catch (err) {
      console.error(`[CRITICAL] [DELETE /api/admin/content/${id}] Exception:`, err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/links", requireAdmin, async (req, res) => {
    console.log(`[DEBUG] [GET /api/admin/links] Admin fetching all links.`);
    try {
      const links = await storage.getAllLinks();
      res.json(links);
    } catch (err) {
      console.error(`[CRITICAL] [GET /api/admin/links] Exception:`, err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/links", requireAdmin, async (req, res) => {
    const clientIp = getClientIp(req);
    console.log(`[DEBUG] [POST /api/admin/links] Admin creating link: "${req.body.label}" from IP: ${clientIp}`);
    try {
      const input = insertSiteLinkSchema.parse(req.body);
      const link = await storage.createLink(input);
      console.log(`[DEBUG] [POST /api/admin/links] SUCCESS: Link ID #${link.id}`);
      res.json(link);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: zodError(err) });
      console.error(`[CRITICAL] [POST /api/admin/links] Exception:`, err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/links/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const clientIp = getClientIp(req);
    console.log(`[DEBUG] [PATCH /api/admin/links/${id}] Admin updating link from IP: ${clientIp}`);
    try {
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid ID" });
      const updated = await storage.updateLink(id, req.body);
      if (!updated) {
        console.warn(`[DEBUG] [PATCH /api/admin/links/${id}] Link not found.`);
        return res.status(404).json({ message: "Link not found" });
      }
      console.log(`[DEBUG] [PATCH /api/admin/links/${id}] SUCCESS: Link updated.`);
      res.json(updated);
    } catch (err) {
      console.error(`[CRITICAL] [PATCH /api/admin/links/${id}] Exception:`, err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/links/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const clientIp = getClientIp(req);
    console.log(`[DEBUG] [DELETE /api/admin/links/${id}] Admin delete link request from IP: ${clientIp}`);
    try {
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteLink(id);
      console.log(`[DEBUG] [DELETE /api/admin/links/${id}] SUCCESS: Link purged.`);
      res.json({ success: true });
    } catch (err) {
      console.error(`[CRITICAL] [DELETE /api/admin/links/${id}] Exception:`, err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/images", requireAdmin, async (req, res) => {
    console.log(`[DEBUG] [GET /api/admin/images] Admin fetching gallery.`);
    try {
      res.json(await storage.getAllImages());
    } catch (err) {
      console.error(`[CRITICAL] [GET /api/admin/images] Exception:`, err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/images", requireAdmin, upload.single("image"), async (req, res) => {
    const clientIp = getClientIp(req);
    console.log(`[DEBUG] [POST /api/admin/images] Admin image upload attempt from IP: ${clientIp}`);
    try {
      if (!req.file) {
        console.warn(`[DEBUG] [POST /api/admin/images] No file provided.`);
        return res.status(400).json({ message: "No image file provided" });
      }
      const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");
      const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "bin";
      const imageUrl = `/uploads/${req.file.filename}.${safeExt}`;
      fs.renameSync(req.file.path, path.join(uploadsDir, `${req.file.filename}.${safeExt}`));

      const safeName = (req.body.name ?? req.file.originalname).replace(/[<>"'&]/g, "").slice(0, 120);
      const safeAlt = (req.body.altText ?? "").replace(/[<>"'&]/g, "").slice(0, 200);
      const safeSection = (req.body.section ?? "general").replace(/[^a-z0-9_-]/gi, "").slice(0, 50);

      const image = await storage.createImage({
        name: safeName,
        url: imageUrl,
        altText: safeAlt,
        section: safeSection,
      });
      console.log(`[DEBUG] [POST /api/admin/images] SUCCESS: Image ID #${image.id} stored at ${imageUrl}`);
      res.json(image);
    } catch (err) {
      console.error(`[CRITICAL] [POST /api/admin/images] Exception:`, err);
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  app.delete("/api/admin/images/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const clientIp = getClientIp(req);
    console.log(`[DEBUG] [DELETE /api/admin/images/${id}] Admin delete image from IP: ${clientIp}`);
    try {
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteImage(id);
      console.log(`[DEBUG] [DELETE /api/admin/images/${id}] SUCCESS: Image metadata purged.`);
      res.json({ success: true });
    } catch (err) {
      console.error(`[CRITICAL] [DELETE /api/admin/images/${id}] Exception:`, err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/messages", requireAdmin, async (_req, res) => {
    console.log(`[DEBUG] [GET /api/admin/messages] Admin fetching contact log.`);
    try {
      res.json(await storage.getContactMessages());
    } catch (err) {
      console.error(`[CRITICAL] [GET /api/admin/messages] Exception:`, err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/messages/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const clientIp = getClientIp(req);
    console.log(`[DEBUG] [DELETE /api/admin/messages/${id}] Admin purge message from IP: ${clientIp}`);
    try {
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteContactMessage(id);
      console.log(`[DEBUG] [DELETE /api/admin/messages/${id}] SUCCESS: Message purged.`);
      res.json({ success: true });
    } catch (err) {
      console.error(`[CRITICAL] [DELETE /api/admin/messages/${id}] Exception:`, err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Catch-all 404 for unhandled API routes
  app.use("/api", (_req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
  });

  await seedDatabase();

  return httpServer;
}

/**
 * Seeds the database with a demo poll and test voter IDs on first run.
 * Only runs when the polls table is empty, so it is safe to call on every boot.
 */
async function seedDatabase() {
  try {
    const existingPolls = await storage.getPolls();
    if (existingPolls.length === 0) {
      await storage.createPoll({
        title: "Community Initiative 2026-A",
        description: "Should the community allocate budget for the new Green Park renovation project?",
        options: ["Yes, approve funding", "No, reject funding", "Abstain"],
        isOpen: true,
      });

      const demoVoters = ["VOTE-1234-5678", "VOTE-8888-9999", "SACRED-2024-TEST"];
      for (const vid of demoVoters) {
        const existing = await storage.getVoter(vid);
        if (!existing) await storage.createVoter(vid);
      }
    }
  } catch (err) {
    console.error("[SEED] Database seed failed:", err);
  }
}
