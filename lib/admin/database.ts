import "server-only";

import { Pool, type PoolClient } from "pg";

let pool: Pool | undefined;

export function adminDatabase() {
  if (pool) return pool;
  if (!process.env.ADMIN_DATABASE_URL) throw new Error("Admin database is unavailable");
  const url = new URL(process.env.ADMIN_DATABASE_URL);
  if (!["postgresql:", "postgres:"].includes(url.protocol)) throw new Error("Invalid admin database URL");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (!local) {
    for (const key of ["ssl", "sslmode", "sslcert", "sslkey", "sslrootcert", "useLibpqCompat"]) url.searchParams.delete(key);
  }
  pool = new Pool({
    connectionString: url.href,
    ssl: local ? undefined : { rejectUnauthorized: true },
    max: 5,
    connectionTimeoutMillis: 3500,
    statement_timeout: 8000,
    idleTimeoutMillis: 10000,
  });
  pool.on("error", () => console.error("Idle admin database connection failed"));
  return pool;
}

export async function inTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await adminDatabase().connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
