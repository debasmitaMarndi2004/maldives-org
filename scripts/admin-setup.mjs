import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { hashPassword } from "better-auth/crypto";
import { Client } from "pg";
import { z } from "zod";

const [staffEmail, option, ...extra] = process.argv.slice(2);
const email = z.string().trim().toLowerCase().max(254).pipe(z.email()).safeParse(staffEmail);
const databaseUrl = process.env.ADMIN_DATABASE_URL;
if (!email.success || !databaseUrl || extra.length || (option && option !== "--password")) {
  console.error("Set ADMIN_DATABASE_URL and run npm run admin:setup -- staff@example.com [--password]");
  process.exit(1);
}

const configurePassword = option === "--password";
if (configurePassword && process.stdin.isTTY) {
  console.error("Read the password with a hidden terminal prompt, then pipe it to this command.");
  process.exit(1);
}
const password = configurePassword ? readFileSync(0, "utf8").replace(/\r?\n$/, "") : null;
if (password !== null && (password.length < 12 || password.length > 128 || /[\r\n]/.test(password))) {
  console.error("Enter a single password of 12 to 128 characters.");
  process.exit(1);
}

const existingOwnerMessage = "Use the Team tab of the existing owner to grant further access.";
const missingMemberMessage = "Grant active staff access to this email before setting its password.";

async function setStaffPassword(db, emailAddress, passwordHash) {
  const member = await db.query(
    `SELECT m.user_id FROM maldives_admin_member m JOIN maldives_admin_user u ON u.id = m.user_id
     WHERE u.email = $1 AND m.active FOR UPDATE OF m`, [emailAddress],
  );
  if (!member.rowCount) throw new Error(missingMemberMessage);
  const id = member.rows[0].user_id;
  const account = await db.query(
    `UPDATE maldives_admin_account SET password = $2, "updatedAt" = now()
     WHERE "userId" = $1 AND "accountId" = $1 AND "providerId" = 'credential'`, [id, passwordHash],
  );
  if (!account.rowCount) {
    await db.query(
      `INSERT INTO maldives_admin_account (id, "userId", "accountId", "providerId", password)
       VALUES ($1, $2, $2, 'credential', $3)`, [randomUUID(), id, passwordHash],
    );
  }
  await db.query("UPDATE maldives_admin_member SET auth_version = auth_version + 1 WHERE user_id = $1", [id]);
  await db.query('DELETE FROM maldives_admin_session WHERE "userId" = $1', [id]);
}

let db;
try {
  const passwordHash = password === null ? null : await hashPassword(password);
  const url = new URL(databaseUrl);
  if (!["postgresql:", "postgres:"].includes(url.protocol)) throw new Error("Invalid database URL");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (!local) {
    for (const key of ["ssl", "sslmode", "sslcert", "sslkey", "sslrootcert", "useLibpqCompat"]) url.searchParams.delete(key);
  }
  db = new Client({ connectionString: url.href, ssl: local ? undefined : { rejectUnauthorized: true } });
  await db.connect();
  await db.query("BEGIN");
  await db.query("SELECT pg_advisory_xact_lock(785221)");
  await db.query(await readFile(new URL("./admin-schema.sql", import.meta.url), "utf8"));
  if (passwordHash !== null) {
    await setStaffPassword(db, email.data, passwordHash);
  } else {
    const owners = await db.query(
      `SELECT u.email FROM maldives_admin_member m JOIN maldives_admin_user u ON u.id = m.user_id WHERE m.role = 'owner'`,
    );
    if (owners.rowCount && !owners.rows.some(row => row.email === email.data)) throw new Error(existingOwnerMessage);
    if (!owners.rowCount) {
      const id = randomUUID();
      await db.query("INSERT INTO maldives_admin_user (id, name, email) VALUES ($1, $2, $2)", [id, email.data]);
      await db.query("INSERT INTO maldives_admin_member (user_id, role) VALUES ($1, 'owner')", [id]);
      await db.query("INSERT INTO maldives_admin_audit (scope, actor_id, action) VALUES ('team', $1, 'Owner configured')", [id]);
    }
  }
  await db.query("COMMIT");
  console.log(configurePassword ? "Staff password configured." : "Admin schema and owner are ready.");
} catch (error) {
  if (db) await db.query("ROLLBACK").catch(() => undefined);
  console.error(error instanceof Error && [existingOwnerMessage, missingMemberMessage].includes(error.message)
    ? error.message : "Admin setup failed. Check the database connection and migration permissions.");
  process.exitCode = 1;
} finally {
  await db?.end();
}
