import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";

// Queries via HTTP fetch em vez de WebSocket persistente.
// Em Cloudflare Workers o WS não sobrevive fora de um request —
// Pool em escopo de módulo derrubava todo /api/auth/* com
// "Connection closed". Com fetch, cada query é um HTTPS stateless.
neonConfig.poolQueryViaFetch = true;

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  // Secrets do wrangler chegam como bindings, nem sempre em process.env.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare") as typeof import("@opennextjs/cloudflare");
    const url = (getCloudflareContext().env as Record<string, string | undefined>).DATABASE_URL;
    if (url) return url;
  } catch {
    // Fora do runtime Cloudflare (dev local): ignora, cai no erro abaixo.
  }
  throw new Error("DATABASE_URL não configurada");
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const pool = new Pool({ connectionString: getDatabaseUrl() });
    const adapter = new PrismaNeon(pool);
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

// Proxy lazy: não cria Pool no import (boot do Worker tem env
// incompleto e nenhuma request ativa). Instancia no primeiro uso
// dentro do request e reutiliza no mesmo isolate.
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
