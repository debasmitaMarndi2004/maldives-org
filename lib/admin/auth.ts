import "server-only";

import { createHmac } from "node:crypto";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins/email-otp";
import { headers } from "next/headers";
import type { PoolClient } from "pg";
import { adminDatabase } from "./database";
import type { Role } from "./model";

export const otpLength = 8;
const otpLifetime = 5 * 60;
export type AdminAuthMode = "otp" | "password";
type AuthConfig = { origin: string; secure: boolean; secret: string } & (
  { mode: "password" } | { mode: "otp"; mailKey: string; from: string }
);

export function adminAuthConfig(): AuthConfig | null {
  const { ADMIN_DATABASE_URL, ADMIN_ORIGIN, ADMIN_AUTH_SECRET, ADMIN_OTP_RESEND_KEY, ADMIN_OTP_FROM } = process.env;
  const mode = process.env.ADMIN_AUTH_MODE ?? "otp";
  if (mode !== "otp" && mode !== "password") return null;
  if (!ADMIN_DATABASE_URL || !ADMIN_ORIGIN || !ADMIN_AUTH_SECRET || ADMIN_AUTH_SECRET.length < 32) return null;
  try {
    const url = new URL(ADMIN_ORIGIN);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.origin !== ADMIN_ORIGIN || (url.protocol !== "https:" && !(loopback && url.protocol === "http:" && !process.env.VERCEL))) return null;
    const connection = { origin: url.origin, secure: url.protocol === "https:" };
    if (mode === "password") {
      const secret = createHmac("sha256", ADMIN_AUTH_SECRET).update("maldives-admin password sessions").digest("base64url");
      return { ...connection, mode, secret };
    }
    if (!ADMIN_OTP_RESEND_KEY || !ADMIN_OTP_FROM) return null;
    return { ...connection, mode, secret: ADMIN_AUTH_SECRET, mailKey: ADMIN_OTP_RESEND_KEY, from: ADMIN_OTP_FROM };
  } catch {
    return null;
  }
}

function createAdminAuth(config: AuthConfig) {
  return betterAuth({
    appName: "Maldives.org Admin",
    baseURL: config.origin,
    basePath: "/api/admin-auth",
    trustedOrigins: [config.origin],
    secret: config.secret,
    database: adminDatabase(),
    user: { modelName: "maldives_admin_user" },
    account: { modelName: "maldives_admin_account" },
    verification: { modelName: "maldives_admin_verification" },
    emailAndPassword: { enabled: config.mode === "password", disableSignUp: true, maxPasswordLength: 128 },
    session: {
      modelName: "maldives_admin_session",
      expiresIn: 4 * 60 * 60,
      disableSessionRefresh: true,
      cookieCache: { enabled: false },
    },
    advanced: {
      cookiePrefix: config.mode === "password" ? "maldives-admin-password" : "maldives-admin",
      useSecureCookies: config.secure,
      defaultCookieAttributes: { sameSite: "strict", httpOnly: true },
      ipAddress: { disableIpTracking: true },
    },
    logger: { disabled: true },
    plugins: [emailOTP({
      otpLength,
      expiresIn: otpLifetime,
      disableSignUp: true,
      allowedAttempts: 3,
      storeOTP: { hash: async (otp) => createHmac("sha256", config.secret).update(`admin-otp:${otp}`).digest("hex") },
      async sendVerificationOTP({ email, otp, type }) {
        if (config.mode !== "otp" || type !== "sign-in") throw new Error("Unsupported mail type");
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${config.mailKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: config.from,
            to: [email],
            subject: "Your Maldives.org admin sign-in code",
            text: `Your Maldives.org admin sign-in code is ${otp}. It expires in 5 minutes. Never share this code. If you did not request it, you can ignore this email.`,
          }),
          cache: "no-store",
          redirect: "error",
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) throw new Error("Admin mail delivery failed");
      },
    }), nextCookies()],
  });
}

let auth: ReturnType<typeof createAdminAuth> | undefined;
export function adminAuth() {
  const config = adminAuthConfig();
  if (!config) throw new Error("Admin sign-in is unavailable");
  auth ??= createAdminAuth(config);
  return auth;
}

export type AdminMember = { id: string; email: string; role: Role; active: boolean; authVersion: number };
export type AdminActor = AdminMember & { sessionId: string };

export async function memberByEmail(email: string, db = adminDatabase()) {
  const result = await db.query<AdminMember>(
    `SELECT u.id, u.email, m.role, m.active, m.auth_version AS "authVersion"
     FROM maldives_admin_user u JOIN maldives_admin_member m ON m.user_id = u.id WHERE u.email = $1`, [email],
  );
  return result.rows[0] ?? null;
}

export async function getAdminActor(): Promise<AdminActor | null> {
  const config = adminAuthConfig();
  if (!config) return null;
  const session = await adminAuth().api.getSession({ headers: await headers() });
  if (!session || (config.mode === "otp" && !session.user.emailVerified)) return null;
  const member = await memberByEmail(session.user.email);
  if (!member?.active || member.id !== session.user.id) return null;
  return { ...member, sessionId: session.session.id };
}

export async function assertActiveActor(client: PoolClient, actor: AdminActor, permitted: readonly Role[]) {
  const result = await client.query<{ role: Role }>(
    `SELECT m.role FROM maldives_admin_member m JOIN maldives_admin_session s ON s."userId" = m.user_id
     WHERE m.user_id = $1 AND m.active AND m.auth_version = $2 AND s.id = $3 AND s."expiresAt" > now() FOR SHARE OF m, s`,
    [actor.id, actor.authVersion, actor.sessionId],
  );
  if (!result.rows[0] || !permitted.includes(result.rows[0].role)) throw new Error("admin:forbidden");
}

export async function assertAdminOrigin() {
  const config = adminAuthConfig();
  const requestHeaders = await headers();
  if (!config || requestHeaders.get("origin") !== config.origin) throw new Error("admin:forbidden");
  return { config, requestHeaders };
}

export async function takeAuthQuota(operation: "request" | "verify" | "password", email: string, secret: string) {
  const fingerprint = createHmac("sha256", secret).update(`admin-rate:${email}`).digest("hex");
  const quotas = operation === "request"
    ? [{ key: `request-minute:${fingerprint}`, seconds: 60, limit: 1 }, { key: `request-hour:${fingerprint}`, seconds: 3600, limit: 6 }]
    : [{ key: `${operation}:${fingerprint}`, seconds: 900, limit: operation === "password" ? 6 : 12 }];
  for (const { key, seconds, limit } of quotas) {
    const result = await adminDatabase().query(
      `INSERT INTO maldives_admin_rate_limit (key, hits, expires_at) VALUES ($1, 1, now() + make_interval(secs => $2))
       ON CONFLICT (key) DO UPDATE SET
       hits = CASE WHEN maldives_admin_rate_limit.expires_at <= now() THEN 1 ELSE maldives_admin_rate_limit.hits + 1 END,
       expires_at = CASE WHEN maldives_admin_rate_limit.expires_at <= now() THEN excluded.expires_at ELSE maldives_admin_rate_limit.expires_at END
       WHERE maldives_admin_rate_limit.expires_at <= now() OR maldives_admin_rate_limit.hits < $3
       RETURNING hits`, [key, seconds, limit],
    );
    if (!result.rowCount) return false;
  }
  return true;
}
