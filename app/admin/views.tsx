import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "@/components/icons";
import { affiliateStatuses, canPublish, categories, paymentModels, type Affiliate } from "@/lib/admin/model";
import type { AdminActor } from "@/lib/admin/auth";
import type { getGitHubStatus } from "@/lib/admin/github";
import type { AuditEvent, listMembers, readDraft, Revision, Scope } from "@/lib/admin/store";
import { legalPages } from "@/lib/legal-pages";
import { accents, legalKeys, type InfoPage } from "@/lib/site-content";
import { manageRevision, saveAffiliate, saveContent, saveInfoPage, updateMember } from "./actions";
import { HeroImageField, HomeSectionFields, Submit } from "./fields";
import styles from "./admin.module.css";

export const statusMessages = {
  ok: "Change saved.",
  invalid: "Check the required fields and try again.",
  stale: "Someone updated this workspace. Review the latest version before saving again.",
  forbidden: "Your current role or session could not authorize that action.",
  unavailable: "This action could not be completed. Try again shortly.",
} as const;

type Draft<S extends Scope> = Awaited<ReturnType<typeof readDraft<S>>>;
type GitHubData = Awaited<ReturnType<typeof getGitHubStatus>>;
const primary = `${styles.button} ${styles.primary}`;
const small = `${styles.button} ${styles.small}`;

function Version({ value }: { value: number }) {
  return <input type="hidden" name="version" value={value} />;
}

function SectionHeading({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return <div className={styles.pageHeading}>
    <div><h1>{title}</h1><p>{description}</p></div>
    {children && <div className={styles.actions}>{children}</div>}
  </div>;
}

function TextField({ label, name, value = "", limit, area = false, optional = false }: {
  label: string; name: string; value?: string; limit: number; area?: boolean; optional?: boolean;
}) {
  return <label className={styles.field}>
    <span>{label}</span>
    {area ? <textarea name={name} defaultValue={value} rows={3} maxLength={limit} required={!optional} />
      : <input type="text" name={name} defaultValue={value} maxLength={limit} required={!optional} />}
  </label>;
}

function SelectField({ label, name, options, value }: { label: string; name: string; options: readonly string[]; value?: string }) {
  return <label className={styles.field}>
    <span>{label}</span>
    <select name={name} defaultValue={value}>{options.map(option => <option key={option}>{option}</option>)}</select>
  </label>;
}

function Disclosure({ title, children }: { title: string; children: React.ReactNode }) {
  return <details className={`${styles.card} ${styles.disclosure}`}>
    <summary><h2>{title}</h2><ChevronDown size={18} /></summary>
    <div className={styles.disclosureBody}>{children}</div>
  </details>;
}

const timeFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata", timeZoneName: "short" });
function Time({ value }: { value: Date | string }) {
  const date = new Date(value);
  return <time dateTime={date.toISOString()}>{timeFormat.format(date)}</time>;
}

function ActivityList({ events }: { events: AuditEvent[] }) {
  return events.length ? <ul className={styles.entries}>
    {events.map(event => <li key={event.id}>
      <div><strong>{event.action}</strong><small>{event.actor}{event.subject && ` · ${event.subject}`}{event.revisionId && <> · <code>{event.revisionId.slice(0, 8)}</code></>}</small></div>
      <Time value={event.createdAt} />
    </li>)}
  </ul> : <p className={styles.empty}>No activity recorded yet.</p>;
}

function RevisionControls({ scope, draft }: { scope: Scope; draft: Pick<Draft<Scope>, "draftId" | "canRedo" | "version"> }) {
  return <form className={styles.splitActions} action={manageRevision.bind(null, scope)}>
    <Version value={draft.version} />
    <Submit name="kind" value="undo" disabled={!draft.draftId}>↶ Undo</Submit>
    <Submit name="kind" value="redo" disabled={!draft.canRedo}>↷ Redo</Submit>
  </form>;
}

function InfoPageForm({ page, version }: { page?: InfoPage; version: number }) {
  return <form className={styles.form} action={saveInfoPage}>
    <Version value={version} />
    <input type="hidden" name="existingSlug" value={page?.slug ?? ""} />
    <label className={styles.field}><span>Page URL</span><span className={styles.urlField}>
      <span>/pages/</span><input name="slug" defaultValue={page?.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={48} required placeholder="island-travel-tips" />
    </span></label>
    <TextField label="Page title" name="title" limit={80} value={page?.title} />
    <TextField label="Introduction" name="intro" limit={240} value={page?.intro} area />
    {Array.from({ length: 4 }, (_, index) => <fieldset key={index} className={styles.fieldset}>
      <legend>Text section {index + 1}{index > 0 && " (optional)"}</legend>
      <TextField label="Section heading" name={`title-${index}`} limit={90} value={page?.sections[index]?.title} optional={index > 0} />
      <TextField label="Section text" name={`body-${index}`} limit={2000} value={page?.sections[index]?.body} optional={index > 0} area />
    </fieldset>)}
    <label className={styles.check}><input name="footerLink" type="checkbox" defaultChecked={page?.footerLink} /> Link in the public footer when published</label>
    <div className={styles.actions}>
      <Submit className={primary}>{page ? "Save page draft" : "Create page draft"}</Submit>
      {page && <Link className={styles.button} prefetch={false} href={`/admin/preview/${page.slug}`}>Preview page <ArrowUpRight size={14} /></Link>}
      {page && <Submit name="mode" value="remove" formNoValidate className={`${styles.button} ${styles.danger}`} confirm="Remove this page from the current draft?">Remove from draft</Submit>}
    </div>
  </form>;
}

export function ContentEditor({ actor, draft, events }: { actor: AdminActor; draft: Draft<"site">; events: AuditEvent[] }) {
  const { hero, serviceDescriptions, homeSections, footer, legalNotes, pages } = draft.content;
  const hasChanges = draft.draftId !== draft.publishedId;
  return <>
    <SectionHeading title="Website content" description="Save a draft, preview the site, then publish the changes.">
      <Link className={styles.button} href="/admin/preview" prefetch={false}>Preview draft <ArrowUpRight size={14} /></Link>
      {canPublish(actor.role) && <form action={manageRevision.bind(null, "site")}>
        <Version value={draft.version} /><input type="hidden" name="kind" value="publish" />
        <Submit className={primary} disabled={!hasChanges} confirm="Publish this draft to the public site?">Publish draft</Submit>
      </form>}
    </SectionHeading>
    <div className={styles.contentGrid}>
      <div className={styles.stack}>
        <form className={styles.stack} action={saveContent}>
          <Version value={draft.version} /><input type="hidden" name="area" value="homepage" />
          <section className={styles.card} aria-labelledby="hero-editor">
            <h2 id="hero-editor">Homepage hero</h2>
            <div className={styles.form}>
              <TextField label="Heading line 1" name="firstLine" value={hero.firstLine} limit={45} />
              <TextField label="Heading line 2" name="secondLine" value={hero.secondLine} limit={45} />
              <TextField label="Introduction" name="intro" value={hero.intro} limit={180} area />
              <HeroImageField image={hero.image} />
              <label className={styles.field}><span>Button accent</span><select name="accent" defaultValue={hero.accent}>
                {Object.entries(accents).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select></label>
              <TextField label="Resorts button" name="staysLabel" value={hero.staysLabel} limit={28} />
              <TextField label="Experiences button" name="experiencesLabel" value={hero.experiencesLabel} limit={28} />
            </div>
          </section>
          <section className={styles.card} aria-labelledby="sections-editor">
            <h2 id="sections-editor">Homepage sections</h2>
            <HomeSectionFields initial={homeSections} />
            <details className={styles.innerDetails}>
              <summary>Travel card descriptions</summary>
              <div className={styles.form}>
                <TextField label="Flights" name="serviceFlights" value={serviceDescriptions.flights} limit={90} />
                <TextField label="Stays" name="serviceStays" value={serviceDescriptions.stays} limit={90} />
                <TextField label="Tours" name="serviceTours" value={serviceDescriptions.tours} limit={90} />
              </div>
            </details>
            <div className={styles.actions}><Submit className={primary}>Save homepage draft</Submit></div>
          </section>
        </form>
        <Disclosure title="Site pages">
          <p className={styles.muted}>Build information pages with text sections and optional footer links.</p>
          {pages.map(page => <details key={page.slug} className={styles.innerDetails}>
            <summary>{page.title} <code>/pages/{page.slug}</code></summary>
            <InfoPageForm page={page} version={draft.version} />
          </details>)}
          {pages.length < 12 && <details className={styles.innerDetails}>
            <summary>Add information page</summary><InfoPageForm version={draft.version} />
          </details>}
        </Disclosure>
        <Disclosure title="Footer & policies">
          <form className={styles.form} action={saveContent}>
            <Version value={draft.version} /><input type="hidden" name="area" value="footer" />
            <TextField label="Footer line 1" name="footerFirst" limit={50} value={footer.firstLine} />
            <TextField label="Footer line 2" name="footerSecond" limit={50} value={footer.secondLine} />
            <TextField label="Newsletter text" name="footerNewsletter" limit={100} value={footer.newsletter} />
            <fieldset className={styles.fieldset}>
              <legend>Optional policy addenda</legend>
              {legalKeys.map(key => <TextField key={key} label={`${legalPages[key].title} note`} name={`legal-${key}`} limit={1200} value={legalNotes[key]} optional area />)}
            </fieldset>
            <div><Submit className={primary}>Save footer & policies draft</Submit></div>
          </form>
        </Disclosure>
      </div>
      <aside className={styles.card} aria-label="Publishing and activity">
        <h2>Publishing</h2>
        <dl className={styles.facts}>
          <div><dt>Draft</dt><dd><span className={hasChanges ? styles.pillWarm : styles.pill}>{hasChanges ? "Unpublished changes" : "Matches public site"}</span></dd></div>
          <div><dt>Public version</dt><dd>{draft.publishedId ? <code>{draft.publishedId.slice(0, 8)}</code> : "Original site"}</dd></div>
        </dl>
        <RevisionControls scope="site" draft={draft} />
        <div className={styles.activityHead}><h2>Recent activity</h2><Link className={styles.textLink} href="/admin?view=history" prefetch={false}>View history</Link></div>
        <ActivityList events={events} />
      </aside>
    </div>
  </>;
}

function AffiliateForm({ affiliate, version }: { affiliate?: Affiliate; version: number }) {
  return <form className={styles.form} action={saveAffiliate}>
    <Version value={version} /><input type="hidden" name="id" value={affiliate?.id ?? ""} />
    <TextField label="Partner name" name="name" limit={80} value={affiliate?.name} />
    <SelectField label="Category" name="category" options={categories} value={affiliate?.category} />
    <SelectField label="Approval stage" name="status" options={affiliateStatuses} value={affiliate?.status} />
    <SelectField label="Payment model" name="payment" options={paymentModels} value={affiliate?.payment} />
    <fieldset className={styles.fieldset}>
      <legend>Written terms reviewed</legend>
      <label className={styles.check}><input type="checkbox" name="commissionReviewed" defaultChecked={affiliate?.commissionReviewed} /> Commission and payout terms</label>
      <label className={styles.check}><input type="checkbox" name="supportReviewed" defaultChecked={affiliate?.supportReviewed} /> Refund, chargeback and traveller support responsibilities</label>
    </fieldset>
    <div className={styles.actions}>
      <Submit className={primary}>{affiliate ? "Save partner record" : "Add partner"}</Submit>
      {affiliate && <Submit name="mode" value="remove" formNoValidate className={`${styles.button} ${styles.danger}`} confirm="Remove this partner from the registry?">Remove partner</Submit>}
    </div>
  </form>;
}

export function AffiliateEditor({ actor, draft }: { actor: AdminActor; draft: Draft<"affiliates"> }) {
  const editable = canPublish(actor.role);
  return <>
    <SectionHeading title="Affiliate registry" description="Track partner approvals, payment models and written terms before integration.">
      <Link className={styles.button} href="/admin?view=history&scope=affiliates" prefetch={false}>Registry history</Link>
    </SectionHeading>
    <div className={styles.contentGrid}>
      <div className={styles.stack}>
        {draft.content.map(affiliate => <details className={`${styles.card} ${styles.disclosure}`} key={`${draft.version}-${affiliate.id}`}>
          <summary>
            <div><h2>{affiliate.name}</h2><p className={styles.muted}>{affiliate.category} · {affiliate.payment}</p></div>
            <span className={affiliate.status === "Approved" ? styles.pillGreen : styles.pill}>{affiliate.status}</span>
            <ChevronDown size={17} />
          </summary>
          <div className={styles.disclosureBody}>
            {editable ? <AffiliateForm affiliate={affiliate} version={draft.version} /> : <dl className={styles.facts}>
              <div><dt>Commission terms</dt><dd>{affiliate.commissionReviewed ? "Reviewed" : "Pending"}</dd></div>
              <div><dt>Support and refunds</dt><dd>{affiliate.supportReviewed ? "Reviewed" : "Pending"}</dd></div>
            </dl>}
          </div>
        </details>)}
        {editable && draft.content.length < 40 && <Disclosure title="Add a partner"><AffiliateForm key={draft.version} version={draft.version} /></Disclosure>}
        {!draft.content.length && <p className={styles.card}>The registry is empty.</p>}
      </div>
      <aside className={styles.card}>
        <h2>Registry at a glance</h2>
        <dl className={styles.facts}>
          <div><dt>Listed partners</dt><dd>{draft.content.length}</dd></div>
          <div><dt>Approved records</dt><dd>{draft.content.filter(partner => partner.status === "Approved").length}</dd></div>
          <div><dt>Connected integrations</dt><dd>0</dd></div>
        </dl>
        {editable && <RevisionControls scope="affiliates" draft={draft} />}
      </aside>
    </div>
  </>;
}

function Pagination({ page, more, path }: { page: number; more: boolean; path: string }) {
  return (page > 1 || more) && <nav className={styles.pagination} aria-label="History pages">
    {page > 1 && <Link className={small} href={`${path}&page=${page - 1}`} prefetch={false}>← Newer</Link>}
    <span>Page {page}</span>
    {more && <Link className={small} href={`${path}&page=${page + 1}`} prefetch={false}>Older →</Link>}
  </nav>;
}

export function HistoryView({ scope, actor, events, revisions, draft, page }: {
  scope: Scope | "audit"; actor: AdminActor; events: AuditEvent[]; revisions: Revision[]; draft: Draft<Scope>; page: number;
}) {
  const modes = [{ id: "site", text: "Website" }, { id: "affiliates", text: "Affiliates" }, { id: "audit", text: "Access audit" }] as const;
  return <>
    <SectionHeading title="Change history" description="Review saved versions and see who made each change." />
    <nav className={styles.tabs} aria-label="History categories">
      {modes.filter(item => item.id !== "audit" || actor.role === "owner").map(item => <Link key={item.id} href={`/admin?view=history&scope=${item.id}`} aria-current={scope === item.id ? "page" : undefined} prefetch={false}>{item.text}</Link>)}
    </nav>
    <div className={styles.stack}>
      {scope !== "audit" && <section className={styles.card}>
        <h2>Saved versions</h2>
        <ul className={styles.entries}>
          {[...revisions.slice(0, 25), ...(page === 1 ? [{ id: "original", actor: "", createdAt: null }] : [])].map(revision => <li key={revision.id}>
            <div><strong>{revision.id === "original" ? "Original version" : <code>{revision.id.slice(0, 8)}</code>}</strong>
              {revision.createdAt && <small>{revision.actor} · <Time value={revision.createdAt} /></small>}
            </div>
            <div className={styles.actions}>
              {(revision.id === draft.draftId || (revision.id === "original" && !draft.draftId)) && <span className={styles.pill}>Current</span>}
              {scope === "site" && (revision.id === draft.publishedId || (revision.id === "original" && !draft.publishedId)) && <span className={styles.pillGreen}>Published</span>}
              {scope === "site" && revision.id !== "original" && <Link className={small} href={`/admin/preview?revision=${revision.id}`} prefetch={false}>Preview</Link>}
              {(scope === "site" || canPublish(actor.role)) && <form action={manageRevision.bind(null, scope)}>
                <Version value={draft.version} /><input type="hidden" name="kind" value="restore" /><input type="hidden" name="id" value={revision.id} />
                <Submit className={small} confirm="Restore this version as the current working copy?" label={`Restore ${revision.id === "original" ? "original version" : revision.id.slice(0, 8)}`}>Restore</Submit>
              </form>}
            </div>
          </li>)}
        </ul>
      </section>}
      <section className={styles.card}>
        <h2>{scope === "audit" ? "Sign-ins and access changes" : "Activity log"}</h2>
        <ActivityList events={events.slice(0, 25)} />
      </section>
    </div>
    <Pagination page={page} more={events.length > 25 || revisions.length > 25} path={`/admin?view=history&scope=${scope}`} />
  </>;
}

export function GitHubView({ result, page }: { result: GitHubData; page: number }) {
  return <>
    <SectionHeading title="GitHub activity" description="Review the remote branch, recent pushes and checks reported by GitHub.">
      {result && <a className={styles.button} href={`${result.github}/tree/${result.branch}`} target="_blank" rel="noreferrer">Open branch <ArrowUpRight size={15} /></a>}
    </SectionHeading>
    {!result ? <p className={styles.card}>GitHub repository settings are unavailable.</p> : <>
      <div className={styles.summaryGrid}>
        <section className={styles.card}><h2>Remote branch</h2><p className={styles.metric}>{result.branch}</p><p className={styles.muted}>{result.headSha ? `Latest commit ${result.headSha.slice(0, 8)}` : "Branch status unavailable"}</p></section>
        <section className={styles.card}><h2>Commit checks</h2><p className={styles.metric}>{result.status?.total_count ? result.status.state : result.checks?.length ? `${result.checks.length} reported` : "No status reported"}</p><p className={styles.muted}>{result.repo}</p></section>
        <section className={styles.card}><h2>Deployment revision</h2><p className={styles.metric}>{result.deployedSha?.slice(0, 8) ?? "Unavailable"}</p><p className={styles.muted}>{result.deployedSha && result.headSha ? result.deployedSha === result.headSha ? "Matches remote head" : "Remote head has a different revision" : "Vercel build metadata"}</p></section>
      </div>
      <div className={styles.stack}>
        {Boolean(result.checks?.length) && <section className={styles.card}><h2>Latest commit checks</h2><ul className={styles.entries}>{result.checks?.map((check, index) => <li key={`${check.name}-${index}`}><strong>{check.name}</strong><span className={styles.pill}>{check.conclusion ?? check.status}</span></li>)}</ul></section>}
        <section className={styles.card} aria-labelledby="push-history">
          <h2 id="push-history">Push and branch activity</h2>
          {result.pushes?.length ? <ul className={styles.entries}>{result.pushes.map((push, index) => <li key={`${push.after}-${push.timestamp}-${index}`}>
            <div><strong className={styles.capitalize}>{push.activity_type.replaceAll("_", " ")}</strong><small>{push.actor?.login ?? "GitHub"} · <Time value={push.timestamp} /></small></div>
            <a className={styles.textLink} href={`${result.github}/commit/${push.after}`} target="_blank" rel="noreferrer"><code>{push.after.slice(0, 8)}</code> ↗</a>
          </li>)}</ul> : <p className={styles.empty}>{result.pushes ? "No branch activity on this page." : "GitHub could not return branch activity."}</p>}
        </section>
        <section className={styles.card} aria-labelledby="commit-history">
          <h2 id="commit-history">Commit history</h2>
          {result.commits?.length ? <ul className={styles.entries}>{result.commits.map(({ sha, commit }) => <li key={sha}>
            <div><strong>{commit.message.split("\n")[0].slice(0, 160)}</strong>{commit.author && <small>{commit.author.name} · <Time value={commit.author.date} /></small>}</div>
            <a className={styles.textLink} href={`${result.github}/commit/${sha}`} target="_blank" rel="noreferrer"><code>{sha.slice(0, 8)}</code> ↗</a>
          </li>)}</ul> : <p className={styles.empty}>{result.commits ? "No commits on this page." : "GitHub could not return commit history."}</p>}
        </section>
      </div>
      <Pagination page={page} more={result.hasMore} path="/admin?view=github" />
    </>}
  </>;
}

export function TeamView({ members }: { members: Awaited<ReturnType<typeof listMembers>> }) {
  return <>
    <SectionHeading title="Team access" description="Grant editor or publisher access to approved staff emails." />
    <div className={styles.contentGrid}>
      <div className={styles.stack}>
        <section className={styles.card}>
          <h2>Staff accounts</h2>
          {members.map(member => <div key={member.id} className={styles.member}>
            <div><strong>{member.email}</strong><small className={styles.capitalize}>{member.role} · {member.active ? "Active" : "Revoked"}</small></div>
            {member.role !== "owner" && <form key={`${member.role}-${member.active}`} className={styles.memberForm} action={updateMember}>
              <input type="hidden" name="email" value={member.email} />
              <select aria-label={`Role for ${member.email}`} name="role" defaultValue={member.role}><option value="editor">Editor</option><option value="publisher">Publisher</option></select>
              <Submit className={small} name="active" value="yes">Save access</Submit>
              {member.active && <Submit className={`${small} ${styles.danger}`} name="active" value="no" confirm={`Revoke access for ${member.email} and end their sessions?`}>Revoke</Submit>}
            </form>}
          </div>)}
        </section>
        <section className={styles.card}>
          <h2>Grant staff access</h2>
          <form className={styles.form} action={updateMember}>
            <input type="hidden" name="active" value="yes" />
            <label className={styles.field}><span>Email address</span><input type="email" name="email" maxLength={254} required /></label>
            <label className={styles.field}><span>Role</span><select name="role" defaultValue="editor"><option value="editor">Editor</option><option value="publisher">Publisher</option></select></label>
            <div className={styles.actions}><Submit className={primary}>Grant access</Submit></div>
          </form>
        </section>
      </div>
      <aside className={styles.card}>
        <h2>Permissions</h2>
        <dl className={styles.permissions}>
          <div><dt>Editor</dt><dd>Edit and preview website drafts. View affiliate and GitHub activity.</dd></div>
          <div><dt>Publisher</dt><dd>Publish website changes and manage the affiliate registry.</dd></div>
          <div><dt>Owner</dt><dd>Manage staff access and review sign-in activity.</dd></div>
        </dl>
        <Link className={styles.textLink} href="/admin?view=history&scope=audit" prefetch={false}>Open access audit</Link>
      </aside>
    </div>
  </>;
}
