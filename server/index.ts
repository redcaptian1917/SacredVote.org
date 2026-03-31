import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { getClientIp, cleanupAdminAttempts } from "./security";
import { pool } from "./db";

const app = express();
app.disable("x-powered-by");
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

const isProd = process.env.NODE_ENV === "production";

// === Security Headers — applied to every response ===
app.use((_req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");

  if (isProd) {
    res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "media-src 'none'",
      "worker-src 'none'",
      "manifest-src 'self'",
    ].join("; ")
  );

  next();
});

// === No-cache headers for all API responses ===
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// === General API rate limiter: 120 requests/min per IP ===
const apiRequestCounts = new Map<string, number[]>();
const API_WINDOW_MS = 60_000;
const API_MAX = 120;

app.use("/api", (req, res, next) => {
  const ip = getClientIp(req);
  const now = Date.now();
  const timestamps = (apiRequestCounts.get(ip) ?? []).filter((t: number) => now - t < API_WINDOW_MS);
  if (timestamps.length >= API_MAX) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ message: "Too many requests. Try again later." });
  }
  timestamps.push(now);
  apiRequestCounts.set(ip, timestamps);
  next();
});

// === Periodic cleanup of in-memory rate limit state ===
setInterval(() => {
  const now = Date.now();
  Array.from(apiRequestCounts.entries()).forEach(([ip, ts]) => {
    const fresh = ts.filter((t: number) => now - t < API_WINDOW_MS);
    fresh.length === 0 ? apiRequestCounts.delete(ip) : apiRequestCounts.set(ip, fresh);
  });
  cleanupAdminAttempts();
}, 5 * 60_000);

// === Body parsers — tight limits to prevent DoS ===
app.use(
  express.json({
    verify: (req, _res, buf) => { req.rawBody = buf; },
    limit: "64kb",
  })
);
app.use(express.urlencoded({ extended: false, limit: "64kb" }));

// === Request logging — method, path, status, duration only (no response bodies) ===
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`[${formattedTime}] [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  const clientIp = getClientIp(req);
  console.log(`[DEBUG] [REQUEST_START] ${req.method} ${reqPath} from IP: ${clientIp}`);

  res.on("finish", () => {
    if (reqPath.startsWith("/api")) {
      const logLine = `${req.method} ${reqPath} ${res.statusCode} in ${Date.now() - start}ms`;
      console.log(`[DEBUG] [REQUEST_FINISH] ${logLine}`);
      log(logLine);
    }
  });
  next();
});

(async () => {
  console.log(`[DEBUG] [STARTUP] Initializing Sacred Vote CMS server...`);

  /**
   * Database connectivity check — verify PostgreSQL is reachable.
   */
  try {
    console.log(`[DEBUG] [DATABASE] Verifying PostgreSQL connectivity...`);
    await pool.query("SELECT 1");
    console.log(`[DEBUG] [DATABASE] PostgreSQL connection verified successfully.`);
    log("[DATABASE] PostgreSQL connection verified", "startup");
  } catch (dbErr: any) {
    console.error(`[FATAL] [DATABASE_FAIL] PostgreSQL connection failed:`, dbErr);
    log(`[FATAL] Cannot connect to PostgreSQL: ${dbErr.message}`, "startup");
    process.exit(1);
  }

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    if (res.headersSent) return next(err);
    if (status >= 500) {
      console.error(`[CRITICAL] [EXPRESS_ERROR] Status ${status}: ${err.message}`, err);
    }
    return res.status(status).json({
      message: status >= 500 ? "Internal server error" : (err.message ?? "Request error"),
    });
  });

  if (isProd) {
    console.log(`[DEBUG] [STARTUP] Running in PRODUCTION mode. Serving static assets.`);
    serveStatic(app);
  } else {
    console.log(`[DEBUG] [STARTUP] Running in DEVELOPMENT mode. Initializing Vite HMR.`);
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    console.log(`[DEBUG] [STARTUP] Server bound successfully. Listening on port ${port}.`);
    log(`serving on port ${port}`);
  });
})();
