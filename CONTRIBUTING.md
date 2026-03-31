# Contributing to SacredVote

Thank you for contributing! This guide covers the conventions and workflows you need to know.

## Code Conventions

- **Language**: TypeScript everywhere (`.ts` for server/shared, `.tsx` for React components).
- **Formatting**: Use consistent indentation (2 spaces). Follow the existing style in each file.
- **Imports**: Use the `@shared/` alias for shared code and `@/` for client-side code.
- **Naming**: camelCase for variables/functions, PascalCase for components/types, UPPER_SNAKE_CASE for constants.
- **Validation**: Always validate API input with Zod schemas before processing.
- **Types**: Define all data types in `shared/schema.ts` so both client and server share a single source of truth.

## How to Add a New Poll

1. Polls are stored in the `polls` table (defined in `shared/schema.ts`).
2. To seed a new poll in development, add it to the `seedDatabase()` function at the bottom of `server/routes.ts`.
3. To add a poll via the API, send a `POST /api/polls` request with a body matching `insertPollSchema` (title, description, options array, isOpen flag).
4. If you need to add new fields to polls, update the `polls` table in `shared/schema.ts`, regenerate the insert schema, update `IStorage` and `DatabaseStorage` in `server/storage.ts`, and run `npm run db:push`.

## How to Add a CMS Content Key

The CMS stores three kinds of managed content: text blocks, links, and images.

### Adding a text content block

1. Log into the admin panel at `/admin`.
2. Use the "Add Content Block" button.
3. Provide a unique `key` (e.g., `hero-subtitle`), a human-readable `label`, a `section` for grouping, and the content `value`.
4. On the frontend, fetch content by key or section using the admin API endpoints (`GET /api/admin/content` or `GET /api/admin/content/:section`).

### Adding a new content type

If you need a content type beyond text/links/images:

1. Add a new table definition in `shared/schema.ts`.
2. Create the insert schema and types.
3. Add CRUD methods to `IStorage` and `DatabaseStorage` in `server/storage.ts`.
4. Register new API routes in `server/routes.ts` behind `requireAdmin`.
5. Run `npm run db:push` to update the database.

## How to Add a New API Endpoint

SacredVote uses a shared routes contract in `shared/routes.ts` so that the client and server agree on paths, methods, and schemas.

### Steps

1. **Define the contract** in `shared/routes.ts`:
   ```ts
   export const api = {
     // ... existing routes ...
     myFeature: {
       doSomething: {
         method: 'POST' as const,
         path: '/api/my-feature' as const,
         input: z.object({ /* request body schema */ }),
         responses: {
           200: z.object({ /* success response schema */ }),
           400: errorSchemas.validation,
         },
       },
     },
   };
   ```

2. **Add storage methods** in `server/storage.ts`:
   - Add the method signature to the `IStorage` interface.
   - Implement it in `DatabaseStorage`.

3. **Register the route** in `server/routes.ts`:
   ```ts
   app.post(api.myFeature.doSomething.path, async (req, res) => {
     const input = api.myFeature.doSomething.input.parse(req.body);
     // ... call storage, return response ...
   });
   ```

4. **Call from the frontend** using TanStack Query:
   ```ts
   const mutation = useMutation({
     mutationFn: async (data) => {
       const res = await apiRequest('POST', api.myFeature.doSomething.path, data);
       return res.json();
     },
   });
   ```

## Security Rules

These invariants must **never** be violated. Breaking any of them compromises voter privacy or system integrity.

### 1. Never persist voter IDs on the client

Voter IDs and vote receipts are stored **only** in volatile React state (`VoterProvider`). They are deliberately lost on page refresh. Never write them to `localStorage`, `sessionStorage`, cookies, or IndexedDB.

### 2. Never log or expose voter identity alongside vote choice

The `votes` table intentionally does **not** store `voterId`. The receipt hash is a one-way SHA-256 digest that includes a random salt, making it impossible to reverse. Never add a foreign key from votes to voters.

### 3. Keep the contact email address server-side only

The contact notification email (`taxporter@gmail.com`) is used only in `server/routes.ts` console output. It must never appear in frontend code or client-accessible API responses.

### 4. Always validate input with Zod

Every `POST`/`PATCH` endpoint must parse the request body through its Zod schema before touching the database. Never trust raw `req.body`.

### 5. Protect admin routes with `requireAdmin`

All CMS endpoints must use the `requireAdmin` middleware. Admin tokens are generated server-side and stored in an in-memory `Set`; they are never sent to the client except via the login response.

### 6. Preserve security headers

The HTTP security headers in `server/index.ts` (CSP, X-Frame-Options, HSTS, etc.) must not be weakened or removed without a documented reason.

### 7. Maintain rate limiting

The API rate limiter (100 req/min per IP) in `server/index.ts` protects against abuse. Do not disable or significantly raise the limit without justification.
