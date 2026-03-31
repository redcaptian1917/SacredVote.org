# Changelog — Sacredvote.org

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] — 2026-03-19

### Added
- **Admin Panel Hard Lockout:** Implemented a stringent 3-attempt brute-force lockout for the CMS admin panel. Initiates a hard lockout, logs the IP and User-Agent, and dispatches an emergency recovery email to `william@plausiden.com` containing a secure, single-use reset link that requires a master recovery password.
- **Hard Lockout Session Booting:** Enhanced the recovery mechanism to automatically terminate all active administrative sessions upon a successful security reset.
- **Enhanced Session Security:** Implemented a dual-timeout session strategy: a 24-hour absolute TTL combined with a strict 10-minute inactivity timeout.
- **Dynamic Security Reconfiguration:** Re-engineered the lockout recovery flow to allow for dynamic rotation of the `ADMIN_PASSWORD` and `RECOVERY_PASSWORD` directly from the secure recovery interface.

### Changed
- **Express Catch-All Route:** Updated the `app.all("/api/*", ...)` route to `app.use("/api", ...)` in `server/routes.ts` to properly handle 404 API requests in Express 5. This prevents unhandled API calls (such as vulnerability scanner probes) from falling through to the React static server and returning a 200 OK.
- **Database Ownership:** Transferred all table ownership in the `sacredvote_db` database to the `sacredvote` user, allowing automated Drizzle ORM schema migrations.
- **Database Schema:** Synchronized the production schema with Drizzle models via `drizzle-kit push`, adding missing unique constraints.
