# SacredVote

A secure, cryptographically-verifiable digital polling and consensus platform designed for municipalities, community organizations, and institutions. SacredVote emphasizes zero-trust architecture, cryptographic anonymity, forensic auditability, and vote immutability.

## Prerequisites

- **Node.js** v18 or later
- **PostgreSQL** 14 or later (a `DATABASE_URL` connection string is required)
- **npm** (ships with Node.js)

## Local Setup

```bash
# 1. Clone the repository
git clone <repo-url> && cd sacredvote

# 2. Install dependencies
npm install

# 3. Create a .env file from the template
cp .env.example .env
# Then fill in the values — see .env.example for descriptions

# 4. Push the database schema (creates/updates tables)
npm run db:push

# 5. Start the development server
npm run dev
```

The app will be available at `http://localhost:5000`. Both the API and the frontend are served from the same port.

## Environment Variables

See [`.env.example`](.env.example) for a complete list with descriptions. The required variables are:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ADMIN_PASSWORD` | Recommended | Password for the CMS admin panel |
| `SESSION_SECRET` | Recommended | Fallback secret used for admin auth when `ADMIN_PASSWORD` is not set |

## NPM Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server with hot-module reloading |
| `npm run build` | Build the production bundle (client via Vite, server via esbuild) |
| `npm start` | Run the production server from `dist/` |
| `npm run check` | Run the TypeScript compiler for type checking |
| `npm run db:push` | Push the Drizzle schema to the database (create/update tables) |

## Project Structure

```
client/          React frontend (Vite SPA)
server/          Express backend API
shared/          Shared TypeScript types, schemas, and API contracts
script/          Build scripts
attached_assets/ Branding guidelines and design references
```

## Further Documentation

- [`CONTRIBUTING.md`](CONTRIBUTING.md) — Contributor guide covering conventions, how-tos, and security rules

## Demo Voter IDs

In development, the database is seeded with these test voter IDs:

- `VOTE-1234-5678`
- `VOTE-8888-9999`
- `SACRED-2024-TEST`

## Production Checklist

Before deploying to production, ensure:

1. **`ADMIN_PASSWORD`** is set to a strong, unique value. If unset, the admin panel falls back to `SESSION_SECRET` and then the insecure default `"admin"`.
2. **`NODE_ENV=production`** is set so HSTS and other production security headers are enabled.
3. **`DATABASE_URL`** points to a production PostgreSQL instance with proper access controls.
4. Run `npm run build` and start with `npm start` (not `npm run dev`).

## License

MIT
