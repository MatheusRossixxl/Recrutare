import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

// Neon Serverless Driver via Driver Adapter (Prisma 5.20 + preview
// `driverAdapters`). Queries via HTTP/WebSocket — compatível com o
// runtime edge do Cloudflare Workers (sem TCP direto).
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);

// Evita múltiplas instâncias do Prisma Client em dev (hot reload do Next.js)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
