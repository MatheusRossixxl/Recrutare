import { PrismaClient } from "@prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";
import { neon, neonConfig, type NeonQueryFunction } from "@neondatabase/serverless";

// Driver HTTP puro (fetch stateless por query), sem Pool/sockets.
//
// Por que o Pool quebrava o /dashboard no Workers (erro 1101):
// - `PrismaNeon(pool)` exige `Pool.connect()` para transações e mantém
//   maquinaria pg (EventEmitter, timers, filas) criada no escopo de um
//   request e tocada em outro → "Cannot perform I/O on behalf of a
//   different request (I/O type: Native)" + hang.
// - O Proxy de `db` criava um Pool NOVO a cada acesso de propriedade:
//   o dashboard dispara ~8 queries em Promise.all + ~18 no trend +
//   layout + session callback, ou seja, dezenas de Pools por request.
// - `poolQueryViaFetch=true` só desvia `Pool.query` para fetch; o
//   `Pool.connect()` usado por `$transaction` continua abrindo socket/WS,
//   que não existe no workerd.
// Com `neon()` + `PrismaNeonHTTP` cada query é um POST HTTPS stateless,
// sem nenhum handle de I/O persistente: o cliente pode ser compartilhado
// com segurança entre requests do mesmo isolate.
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

// Singleton seguro em qualquer ambiente: o adapter HTTP não guarda
// nenhum objeto de I/O (só a connection string); o fetch acontece por
// query, dentro do request que a disparou. Criação lazy para não exigir
// DATABASE_URL no import (boot do Worker/build tem env incompleto).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// O endpoint /sql do Neon devolve timestamptz/timestamp já desserializados
// como objetos `Date` do JS. O PrismaNeonHTTP repassa o valor cru ao engine,
// que exige string em coluna DateTime ("expected a string, found {}").
// Normaliza recursivamente Date → ISO em todo resultado: vale para todas
// as colunas DateTime de todos os modelos, sem tocar nas queries.
function dateToIso(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(dateToIso);
  if (value !== null && typeof value === "object") {
    if ("rows" in value && "fields" in value) {
      const res = value as { rows: unknown; fields: unknown };
      return { ...res, rows: dateToIso(res.rows) };
    }
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>)) {
      out[k] = dateToIso((value as Record<string, unknown>)[k]);
    }
    return out;
  }
  return value;
}

function getNeonSql(): NeonQueryFunction<false, false> {
  const raw = neon(getDatabaseUrl());
  const sql = ((...args: Parameters<typeof raw>) =>
    (raw(...args) as unknown as Promise<unknown>).then(dateToIso)) as unknown as NeonQueryFunction<false, false>;
  sql.transaction = raw.transaction;
  return sql;
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaNeonHTTP(getNeonSql());
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

// Proxy lazy: instancia no primeiro uso dentro do request.
// Ao contrário da versão com Pool, retorna sempre o MESMO cliente
// (stateless), em vez de um Pool novo por acesso de propriedade.
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
