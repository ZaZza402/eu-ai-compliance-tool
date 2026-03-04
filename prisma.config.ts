/**
 * Prisma Configuration (Prisma 7)
 * ==================================
 * In Prisma 7, database URLs are configured here instead of schema.prisma.
 *
 * - `import "dotenv/config"` loads .env / .env.local for prisma CLI commands
 *   (Next.js does NOT load env files for CLI tools like `prisma migrate`).
 * - `datasource.url` is the connection string for migrations.
 * - Runtime connections use @prisma/adapter-pg in lib/db.ts.
 *
 * Docs: https://www.prisma.io/docs/orm/reference/prisma-config-reference
 */

// Load .env.local first (Next.js convention for local secrets — git-ignored),
// then .env for shared non-secret defaults. `override: false` means already-set
// vars are never overwritten.
import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: false });
dotenv.config({ path: ".env", override: false });
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    // Use DIRECT_URL for migrations (bypasses pgbouncer in Supabase).
    // Falls back to DATABASE_URL for local dev without a separate direct URL.
    // Using process.env directly (not env() helper) so `prisma generate`
    // works without DATABASE_URL set (e.g., in CI type-check pipelines).
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
