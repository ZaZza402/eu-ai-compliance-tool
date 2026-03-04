import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma client singleton — Prisma 7 with @prisma/adapter-pg.
 *
 * In Prisma 7, the database URL is supplied via a driver adapter rather than
 * in schema.prisma. We use @prisma/adapter-pg backed by the standard pg Pool.
 *
 * The globalThis pattern prevents multiple PrismaClient instances during
 * Next.js hot module replacement in development (which would exhaust the pool).
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local before starting the server.",
    );
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
