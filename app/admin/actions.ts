"use server";

import { randomUUID } from "node:crypto";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminAuth, assertAdminOrigin, getAdminActor, memberByEmail, takeAuthQuota, otpLength, type AdminMember } from "@/lib/admin/auth";
import { adminDatabase, inTransaction } from "@/lib/admin/database";
import { affiliateSchema, emailSchema } from "@/lib/admin/model";
import { changeWorkspace, setMember, writeAudit, type Scope } from "@/lib/admin/store";
import { publishedSiteTag } from "@/lib/public-content";
import { legalKeys } from "@/lib/site-content";
import { pageSlug } from "@/lib/admin/content-schema";

async function recordError(work: () => Promise<void>, fallback = "unavailable") {
  try {
    await work();
    return "ok";
  } catch (error) {
    if (error instanceof z.ZodError) return "invalid";
    if (error instanceof Error && ["admin:forbidden", "admin:stale", "admin:invalid"].includes(error.message)) return error.message.slice(6);
    return fallback;
  }
}

export async function requestCode(form: FormData) {
  const email = emailSchema.safeParse(form.get("email"));
  const result = await recordError(async () => {
    const { config, requestHeaders } = await assertAdminOrigin();
    if (config.mode !== "otp") throw new Error("admin:forbidden");
    if (!email.success || await getAdminActor()) return;
    const member = await memberByEmail(email.data);
    if (member?.active && await takeAuthQuota("request", email.data, config.secret)) {
      await adminAuth().api.sendVerificationOTP({ headers: requestHeaders, body: { email: email.data, type: "sign-in" } });
    }
  });
  // The same response covers approved addresses, unknown addresses, throttling and mail delivery errors.
  redirect(result === "forbidden" ? "/admin" : "/admin?step=verify");
}

async function finishSignIn(member: AdminMember, session: { token: string; user: { id: string } }, auditAction: string) {
  try {
    await inTransaction(async db => {
      const current = await db.query("SELECT 1 FROM maldives_admin_member WHERE user_id = $1 AND active AND auth_version = $2 FOR SHARE", [member.id, member.authVersion]);
      if (session.user.id !== member.id || !current.rowCount) throw new Error("admin:invalid");
      await writeAudit(db, "auth", member.id, auditAction);
    });
  } catch (error) {
    await adminDatabase().query("DELETE FROM maldives_admin_session WHERE token = $1", [session.token]).catch(() => undefined);
    throw error;
  }
}

export async function verifyCode(form: FormData) {
  const result = await recordError(async () => {
    const { config, requestHeaders } = await assertAdminOrigin();
    if (config.mode !== "otp") throw new Error("admin:forbidden");
    const email = emailSchema.parse(form.get("email"));
    const otp = z.string().regex(new RegExp(`^\\d{${otpLength}}$`)).parse(form.get("code"));
    const member = await memberByEmail(email);
    if (!member?.active || !await takeAuthQuota("verify", email, config.secret)) throw new Error("admin:invalid");
    const session = await adminAuth().api.signInEmailOTP({ headers: requestHeaders, body: { email, otp } });
    await finishSignIn(member, session, "Signed in with email OTP");
  }, "invalid");
  redirect(result === "ok" ? "/admin" : "/admin?step=verify&notice=code");
}

export async function signInWithPassword(form: FormData) {
  const result = await recordError(async () => {
    const { config, requestHeaders } = await assertAdminOrigin();
    if (config.mode !== "password") throw new Error("admin:forbidden");
    const email = emailSchema.parse(form.get("email"));
    const password = z.string().min(1).max(128).parse(form.get("password"));
    const member = await memberByEmail(email);
    if (!member?.active || !await takeAuthQuota("password", email, config.secret)) throw new Error("admin:invalid");
    const session = await adminAuth().api.signInEmail({ headers: requestHeaders, body: { email, password } });
    await finishSignIn(member, session, "Signed in with password");
  }, "invalid");
  redirect(result === "ok" ? "/admin" : "/admin?notice=credentials");
}

export async function signOut() {
  const result = await recordError(async () => {
    const { requestHeaders } = await assertAdminOrigin();
    const actor = await getAdminActor();
    await adminAuth().api.signOut({ headers: requestHeaders });
    if (actor) await writeAudit(adminDatabase(), "auth", actor.id, "Signed out");
  });
  redirect(result === "ok" ? "/admin" : "/admin?notice=unavailable");
}

const formVersion = z.string().regex(/^\d{1,10}$/).transform(Number).pipe(z.number().int().max(2147483647));

async function runAdminMutation(work: (actor: NonNullable<Awaited<ReturnType<typeof getAdminActor>>>) => Promise<void>, view: string) {
  const notice = await recordError(async () => {
    await assertAdminOrigin();
    const actor = await getAdminActor();
    if (!actor) throw new Error("admin:forbidden");
    await work(actor);
  });
  redirect(`/admin?view=${view}&notice=${notice}`);
}

export async function saveContent(form: FormData) {
  await runAdminMutation(async actor => {
    const version = formVersion.parse(form.get("version"));
    const area = z.enum(["homepage", "footer"]).parse(form.get("area"));
    const fields = Object.fromEntries(form);
    await changeWorkspace(actor, "site", version, { kind: "save", description: area === "homepage" ? "Homepage draft saved" : "Footer and policies draft saved", transform(content) {
      if (area === "footer") return {
        ...content,
        footer: { firstLine: fields.footerFirst, secondLine: fields.footerSecond, newsletter: fields.footerNewsletter },
        legalNotes: Object.fromEntries(legalKeys.map(key => [key, fields[`legal-${key}`]])),
      };
      const order = z.string().max(60).parse(form.get("sectionOrder")).split(",");
      return {
        ...content,
        hero: { firstLine: fields.firstLine, secondLine: fields.secondLine, intro: fields.intro, staysLabel: fields.staysLabel,
          experiencesLabel: fields.experiencesLabel, image: fields.image, accent: fields.accent },
        homeSections: order.map(key => ({ key, visible: fields[`show-${key}`] === "on" })),
        serviceDescriptions: { flights: fields.serviceFlights, stays: fields.serviceStays, tours: fields.serviceTours },
      };
    } });
  }, "content");
}


export async function saveInfoPage(form: FormData) {
  await runAdminMutation(async actor => {
    const version = formVersion.parse(form.get("version"));
    const existingSlug = z.union([z.literal(""), pageSlug]).parse(form.get("existingSlug"));
    const remove = form.get("mode") === "remove";
    if (remove && !existingSlug) throw new Error("admin:invalid");
    const slug = remove ? existingSlug : pageSlug.parse(form.get("slug"));
    const sections = Array.from({ length: 4 }, (_, index) => ({ title: form.get(`title-${index}`), body: form.get(`body-${index}`) }))
      .filter(section => section.title || section.body);
    const description = remove ? "Information page removed from draft" : existingSlug ? "Information page draft updated" : "Information page draft created";
    await changeWorkspace(actor, "site", version, { kind: "save", description, transform(content) {
      if (existingSlug && !content.pages.some(page => page.slug === existingSlug)) throw new Error("admin:invalid");
      const remaining = content.pages.filter(page => page.slug !== existingSlug);
      if (remove) return { ...content, pages: remaining };
      const page = { slug, title: form.get("title"), intro: form.get("intro"), sections, footerLink: form.get("footerLink") === "on" };
      const pages = existingSlug ? content.pages.map(item => item.slug === existingSlug ? page : item) : [...remaining, page];
      return { ...content, pages };
    } });
  }, "content");
}

export async function saveAffiliate(form: FormData) {
  await runAdminMutation(async actor => {
    const version = formVersion.parse(form.get("version"));
    const id = z.union([z.literal(""), z.uuid()]).parse(form.get("id"));
    const remove = form.get("mode") === "remove";
    if (remove && !id) throw new Error("admin:invalid");
    const record = remove ? null : affiliateSchema.parse({
      id: id || randomUUID(), name: form.get("name"), category: form.get("category"), status: form.get("status"), payment: form.get("payment"),
      commissionReviewed: form.get("commissionReviewed") === "on", supportReviewed: form.get("supportReviewed") === "on",
    });
    const description = remove ? "Affiliate record removed" : id ? "Affiliate record updated" : "Affiliate record added";
    await changeWorkspace(actor, "affiliates", version, { kind: "save", description, transform(affiliates) {
      if (id && !affiliates.some(affiliate => affiliate.id === id)) throw new Error("admin:invalid");
      const remaining = affiliates.filter(affiliate => affiliate.id !== id);
      if (!record) return remaining;
      if (remaining.some(affiliate => affiliate.name.toLowerCase() === record.name.toLowerCase())) throw new Error("admin:invalid");
      return id ? affiliates.map(affiliate => affiliate.id === id ? record : affiliate) : [...affiliates, record];
    } });
  }, "affiliates");
}

export async function manageRevision(scope: Scope, form: FormData) {
  const target = scope === "affiliates" ? "affiliates" : "content";
  await runAdminMutation(async actor => {
    const selectedScope = z.enum(["site", "affiliates"]).parse(scope);
    const version = formVersion.parse(form.get("version"));
    const kind = z.enum(["undo", "redo", "publish", "restore"]).parse(form.get("kind"));
    if (kind === "restore") {
      const id = z.union([z.literal("original"), z.uuid()]).parse(form.get("id"));
      await changeWorkspace(actor, selectedScope, version, { kind, id: id === "original" ? null : id });
      return;
    }
    await changeWorkspace(actor, selectedScope, version, { kind });
    if (kind === "publish" && selectedScope === "site") updateTag(publishedSiteTag);
  }, target);
}

export async function updateMember(form: FormData) {
  await runAdminMutation(async actor => {
    const email = emailSchema.parse(form.get("email"));
    const role = z.enum(["editor", "publisher"]).parse(form.get("role"));
    const active = z.enum(["yes", "no"]).parse(form.get("active")) === "yes";
    await setMember(actor, email, role, active);
  }, "team");
}
