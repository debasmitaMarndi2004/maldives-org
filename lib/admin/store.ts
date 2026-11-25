import "server-only";

import { randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { originalSite, type SiteContent } from "@/lib/site-content";
import { siteContentSchema } from "./content-schema";
import { adminDatabase, inTransaction } from "./database";
import { assertActiveActor, type AdminActor } from "./auth";
import { affiliatesSchema, originalAffiliates, roles, type Affiliate, type Role } from "./model";

export type Scope = "site" | "affiliates";
export type AuditScope = Scope | "team" | "auth";
type Snapshot = { site: SiteContent; affiliates: Affiliate[] };
const baselines: Snapshot = { site: originalSite, affiliates: originalAffiliates };
const schemas = { site: siteContentSchema, affiliates: affiliatesSchema };
const publishers = ["owner", "publisher"] as const;

type Workspace = { draft_id: string | null; published_id: string | null; redo_ids: string[]; version: number };
export type Revision = { id: string; actor: string; createdAt: Date };
export type AuditEvent = { id: string; scope: AuditScope; action: string; actor: string; subject: string | null; revisionId: string | null; createdAt: Date };

type Action<T> =
  | { kind: "save"; description: string; transform: (content: T) => unknown }
  | { kind: "undo" | "redo" | "publish" }
  | { kind: "restore"; id: string | null };

export async function writeAudit(db: PoolClient | Pool, scope: AuditScope, actorId: string, action: string, revisionId: string | null = null, subjectId: string | null = null) {
  await db.query("INSERT INTO maldives_admin_audit (scope, actor_id, action, revision_id, subject_id) VALUES ($1, $2, $3, $4, $5)",
    [scope, actorId, action, revisionId, subjectId]);
}

async function readSnapshot<S extends Scope>(db: Pool | PoolClient, scope: S, id: string | null) {
  if (!id) return baselines[scope];
  const result = await db.query<{ content: unknown }>("SELECT content FROM maldives_admin_revision WHERE scope = $1 AND id = $2", [scope, id]);
  return schemas[scope].parse(result.rows[0]?.content) as Snapshot[S];
}

export async function readSiteRevision(id: string) {
  return readSnapshot(adminDatabase(), "site", id);
}

export async function readDraft<S extends Scope>(scope: S) {
  const result = await adminDatabase().query<Workspace & { content: unknown }>(
    `SELECT w.*, r.content FROM maldives_admin_workspace w LEFT JOIN maldives_admin_revision r ON r.id = w.draft_id AND r.scope = w.scope WHERE w.scope = $1`, [scope],
  );
  const row = result.rows[0];
  if (!row) throw new Error("Admin workspace is unavailable");
  const content = row.draft_id ? schemas[scope].parse(row.content) as Snapshot[S] : baselines[scope];
  return { content, draftId: row.draft_id, publishedId: row.published_id, canRedo: row.redo_ids.length > 0, version: row.version };
}

export async function revisions(scope: Scope, offset: number) {
  const result = await adminDatabase().query<Revision>(
    `SELECT r.id, u.email AS actor, r.created_at AS "createdAt" FROM maldives_admin_revision r
     JOIN maldives_admin_user u ON u.id = r.actor_id WHERE r.scope = $1 ORDER BY r.created_at DESC, r.id DESC LIMIT 26 OFFSET $2`, [scope, offset],
  );
  return result.rows;
}

export async function activity(scopes: AuditScope[], limit: number, offset = 0) {
  const result = await adminDatabase().query<AuditEvent>(
    `SELECT a.id, a.scope, a.action, u.email AS actor, t.email AS subject, a.revision_id AS "revisionId", a.created_at AS "createdAt"
     FROM maldives_admin_audit a JOIN maldives_admin_user u ON u.id = a.actor_id
     LEFT JOIN maldives_admin_user t ON t.id = a.subject_id WHERE a.scope = ANY($1)
     ORDER BY a.id DESC LIMIT $2 OFFSET $3`, [scopes, limit, offset],
  );
  return result.rows;
}

export async function changeWorkspace<S extends Scope>(actor: AdminActor, scope: S, version: number, action: Action<Snapshot[S]>) {
  return inTransaction(async db => {
    await assertActiveActor(db, actor, scope === "affiliates" || action.kind === "publish" ? publishers : roles);
    const result = await db.query<Workspace>("SELECT * FROM maldives_admin_workspace WHERE scope = $1 FOR UPDATE", [scope]);
    const row = result.rows[0];
    if (!row || row.version !== version) throw new Error("admin:stale");
    const { draft_id: previous, published_id: lastRelease } = row;
    let draft = previous;
    let release = lastRelease;
    const redo = row.redo_ids;
    let label: string;
    switch (action.kind) {
      case "save":
      case "restore": {
        const content = schemas[scope].parse(action.kind === "save"
          ? action.transform(await readSnapshot(db, scope, previous))
          : await readSnapshot(db, scope, action.id));
        draft = randomUUID();
        await db.query("INSERT INTO maldives_admin_revision (id, scope, parent_id, actor_id, content) VALUES ($1, $2, $3, $4, $5::jsonb)",
          [draft, scope, previous, actor.id, JSON.stringify(content)]);
        redo.length = 0;
        label = action.kind === "restore" ? "Revision restored" : action.description;
        break;
      }
      case "undo": {
        if (!previous) return;
        const parent = await db.query<{ parent_id: string | null }>("SELECT parent_id FROM maldives_admin_revision WHERE scope = $1 AND id = $2", [scope, previous]);
        draft = parent.rows[0].parent_id;
        redo.push(previous);
        label = "Change undone";
        break;
      }
      case "redo": {
        const next = redo.pop();
        if (!next) return;
        draft = next;
        label = "Change redone";
        break;
      }
      case "publish": {
        if (scope !== "site" || previous === lastRelease) return;
        await readSnapshot(db, scope, previous);
        release = previous;
        label = "Site published";
        break;
      }
    }
    await db.query("UPDATE maldives_admin_workspace SET draft_id = $2, published_id = $3, redo_ids = $4, version = version + 1 WHERE scope = $1", [scope, draft, release, redo]);
    await writeAudit(db, scope, actor.id, label, draft);
  });
}

export async function listMembers() {
  const result = await adminDatabase().query<{ id: string; email: string; role: Role; active: boolean }>(
    `SELECT u.id, u.email, m.role, m.active FROM maldives_admin_member m JOIN maldives_admin_user u ON u.id = m.user_id ORDER BY (m.role = 'owner') DESC, u.email`,
  );
  return result.rows;
}

export async function setMember(actor: AdminActor, email: string, role: Exclude<Role, "owner">, active: boolean) {
  return inTransaction(async db => {
    await assertActiveActor(db, actor, ["owner"]);
    const existing = await db.query<{ id: string; role: Role; active: boolean }>(
      `SELECT u.id, m.role, m.active FROM maldives_admin_user u JOIN maldives_admin_member m ON m.user_id = u.id WHERE u.email = $1 FOR UPDATE OF m`, [email],
    );
    const member = existing.rows[0];
    if (!member) {
      if (!active) throw new Error("admin:invalid");
      const id = randomUUID();
      await db.query("INSERT INTO maldives_admin_user (id, name, email) VALUES ($1, $2, $2)", [id, email]);
      await db.query("INSERT INTO maldives_admin_member (user_id, role) VALUES ($1, $2)", [id, role]);
      await writeAudit(db, "team", actor.id, `Granted ${role} access`, null, id);
      return;
    }
    if (member.role === "owner") throw new Error("admin:forbidden");
    if (member.role === role && member.active === active) return;
    await db.query("UPDATE maldives_admin_member SET role = $2, active = $3, auth_version = auth_version + 1 WHERE user_id = $1", [member.id, role, active]);
    await db.query('DELETE FROM maldives_admin_session WHERE "userId" = $1', [member.id]);
    await db.query("DELETE FROM maldives_admin_verification WHERE identifier = $1", [`sign-in-otp-${email}`]);
    await writeAudit(db, "team", actor.id, active ? `Set ${role} access` : "Revoked access", null, member.id);
  });
}
