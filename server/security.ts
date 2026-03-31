import type { Request } from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";

const isProd = process.env.NODE_ENV === "production";
const RECOVERY_PASSWORD = process.env.RECOVERY_PASSWORD;

// === IP Resolution ===
export function getClientIp(req: Request): string {
  if (isProd) {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      const first = forwarded.split(",")[0].trim();
      if (/^[\d.]+$/.test(first) || /^[a-f0-9:]+$/i.test(first)) {
        return first;
      }
    }
  }
  return req.socket.remoteAddress ?? "unknown";
}

// === Admin Login Brute-Force Protection ===
const adminLoginAttempts = new Map<string, { attempts: number[], lockedOut: boolean, resetToken?: string }>();
const ADMIN_WINDOW_MS = 10 * 60_000;
const ADMIN_MAX_ATTEMPTS = 3;

async function sendLockoutEmail(ip: string, userAgent: string, resetToken: string) {
  try {
    const transporter = nodemailer.createTransport({
      sendmail: true,
      newline: 'unix',
      path: '/usr/sbin/sendmail'
    });

    const resetUrl = `https://sacredvote.org/api/admin/reset/${resetToken}`;

    const mailOptions = {
      from: '"Sacred Vote CMS Security" <security@sacredvote.org>',
      to: 'william@plausiden.com',
      subject: 'URGENT: CMS Admin Panel Lockout Triggered',
      text: `CMS Admin Panel access has been locked due to 3 failed login attempts.

Security Details:
- IP Address: ${ip}
- User Agent: ${userAgent}
- Time: ${new Date().toISOString()}

To unlock the admin panel, use the following reset link and provide the recovery password:
${resetUrl}

If this was not you, please investigate immediately.`,
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      }
    };

    await transporter.sendMail(mailOptions);
    console.log(`[SECURITY] Lockout email sent to william@plausiden.com for IP: ${ip}`);
  } catch (error) {
    console.error("[SECURITY] Failed to send lockout email:", error);
  }
}

export function recordAdminLoginAttempt(ip: string, userAgent: string): boolean {
  const now = Date.now();
  console.log(`[DEBUG] [recordAdminLoginAttempt] Login failure from IP: ${ip} | User-Agent: ${userAgent}`);
  
  let record = adminLoginAttempts.get(ip);
  
  if (!record) {
    console.log(`[DEBUG] [recordAdminLoginAttempt] Creating new tracking record for IP: ${ip}`);
    record = { attempts: [], lockedOut: false };
    adminLoginAttempts.set(ip, record);
  }

  if (record.lockedOut) {
    console.warn(`[SECURITY] [recordAdminLoginAttempt] Blocked attempt from already locked-out IP: ${ip}`);
    return false;
  }

  record.attempts = record.attempts.filter(t => now - t < ADMIN_WINDOW_MS);
  console.log(`[DEBUG] [recordAdminLoginAttempt] IP: ${ip} has ${record.attempts.length} recent failures.`);
  
  if (record.attempts.length >= ADMIN_MAX_ATTEMPTS) {
    console.error(`[SECURITY] [LOCKOUT_TRIGGER] Brute-force threshold breached for IP: ${ip}. Initiating hard lockout.`);
    record.lockedOut = true;
    record.resetToken = crypto.randomBytes(32).toString('hex');
    sendLockoutEmail(ip, userAgent, record.resetToken);
    return false;
  }
  
  record.attempts.push(now);
  
  if (record.attempts.length >= ADMIN_MAX_ATTEMPTS && !record.lockedOut) {
     console.error(`[SECURITY] [LOCKOUT_TRIGGER] Brute-force threshold breached for IP: ${ip}. Initiating hard lockout.`);
     record.lockedOut = true;
     record.resetToken = crypto.randomBytes(32).toString('hex');
     sendLockoutEmail(ip, userAgent, record.resetToken);
     return false;
  }
  
  return true;
}

export function clearAdminLoginAttempts(ip: string): void {
  console.log(`[DEBUG] [clearAdminLoginAttempts] Clearing trackers for IP: ${ip}`);
  adminLoginAttempts.delete(ip);
}

export function verifyAdminReset(ip: string, token: string, password: string): boolean {
  console.log(`[DEBUG] [verifyAdminReset] Attempting lockout reset for token ${token.substring(0, 8)}... from IP: ${ip}`);
  if (!RECOVERY_PASSWORD || password !== RECOVERY_PASSWORD) {
    console.warn(`[SECURITY] [verifyAdminReset] Invalid recovery password from IP: ${ip}`);
    return false;
  }
  
  let foundIp: string | null = null;
  for (const [key, record] of adminLoginAttempts.entries()) {
    if (record.resetToken && crypto.timingSafeEqual(Buffer.from(record.resetToken), Buffer.from(token))) {
      foundIp = key;
      break;
    }
  }

  if (foundIp) {
    console.log(`[DEBUG] [verifyAdminReset] Reset successful for IP: ${foundIp}. Access restored.`);
    clearAdminLoginAttempts(foundIp);
    return true;
  }
  
  console.warn(`[SECURITY] [verifyAdminReset] Token ${token.substring(0, 8)}... not found or already used.`);
  return false;
}

export function cleanupAdminAttempts(): void {
  const now = Date.now();
  Array.from(adminLoginAttempts.entries()).forEach(([ip, record]) => {
    if (!record.lockedOut) {
      const fresh = record.attempts.filter((t: number) => now - t < ADMIN_WINDOW_MS);
      if (fresh.length === 0) {
        adminLoginAttempts.delete(ip);
      } else {
        record.attempts = fresh;
      }
    }
  });
}
