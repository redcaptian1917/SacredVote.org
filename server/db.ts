
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log(`[DEBUG] [DATABASE] Initializing CMS PostgreSQL connection pool...`);
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.on('error', (err) => {
  console.error('[CRITICAL] [DATABASE_IDLE_CLIENT_ERROR] Unexpected error on idle client:', err);
});

pool.on('connect', () => {
  console.log('[DEBUG] [DATABASE] New CMS client connected to the pool.');
});

console.log(`[DEBUG] [DATABASE] Initializing Drizzle CMS wrapper...`);
export const db = drizzle(pool, { schema });
console.log(`[DEBUG] [DATABASE] SUCCESS: CMS DB layer ready.`);
