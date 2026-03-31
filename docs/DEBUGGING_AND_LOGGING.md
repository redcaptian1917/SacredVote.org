# Debugging and Logging Guide — Sacred Vote CMS

This document catalogs the various debugging and feedback mechanisms integrated into the Sacred Vote CMS platform (`sacredvote.org`).

---

## 1. Application-Level Logging (Console)

The CMS tier has been enhanced with detailed console logging for both server and client operations.

### Server-Side (Node.js)
The backend logs detailed information about every administrative and content management operation.

| Log Prefix | Meaning | Example Data |
|------------|---------|--------------|
| `[DEBUG]` | General operational trace | `[DEBUG] [POST /api/admin/content] Upserting content for section: landing` |
| `[SECURITY]` | High-importance security event | `[SECURITY] [LOCKOUT_TRIGGER] Brute-force threshold breached for IP: 1.2.3.4` |
| `[CRITICAL]` | System-level failure | `[CRITICAL] [POST /api/polls] Exception: [Error details]` |

**Viewing Backend Logs:**
```bash
journalctl -u sacredvote-org.service -f
```

### Client-Side (Browser)
The admin panel frontend logs all authentication steps and API interactions to the browser console.

- **`[DEBUG]` Tags:** Track login attempts (`[DEBUG] [AdminLoginForm] Attempting login...`), content updates, and media deletions.
- **Error Capture:** Detailed error objects are logged for all failed mutation attempts (create/update/delete).

---

## 2. Security & Session Monitoring

- **Hard Lockout Tracking:** The server console logs the precise number of recent failures per IP and explicitly flags when a hard lockout is triggered.
- **Session Lifecycle:** Refreshes and expirations of administrative tokens are logged to the backend console.
- **Email Alerts:** Brute-force detections trigger high-priority emails to `william@plausiden.com` with forensic IP and User-Agent data.

---

## 3. Infrastructure Visibility

- **Nginx Access/Error Logs:** `/var/log/nginx/`
- **Fail2ban Jail Status:** `fail2ban-client status nginx-http-auth`
- **Daily Backups:** `/var/log/sacredvote-backup.log`
