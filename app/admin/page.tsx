import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { adminAuthConfig, getAdminActor, otpLength, type AdminActor, type AdminAuthMode } from "@/lib/admin/auth";
import { getGitHubStatus } from "@/lib/admin/github";
import { activity, listMembers, readDraft, revisions, type Scope } from "@/lib/admin/store";
import { requestCode, signInWithPassword, signOut, verifyCode } from "./actions";
import { AffiliateEditor, ContentEditor, GitHubView, HistoryView, TeamView, statusMessages } from "./views";
import { Submit } from "./fields";
import styles from "./admin.module.css";

const views = ["content", "history", "affiliates", "github", "team"] as const;
type View = typeof views[number];

const navigation: Record<View, { label: string; icon: React.ReactNode }> = {
  content: { label: "Content", icon: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 12h6m-6 4h6" /></> },
  history: { label: "History", icon: <><path d="M3 12a9 9 0 1 1 2.64 6.36M3 12V6m0 6h6" /><path d="M12 7v5l3 2" /></> },
  affiliates: { label: "Affiliates", icon: <><path d="m10 13 4-4m-6 6-1 1a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0m2 10a3.5 3.5 0 0 0 5 0l4-4a3.5 3.5 0 0 0-5-5l-1 1" /></> },
  github: { label: "GitHub", icon: <><circle cx="6" cy="5" r="2" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="7" r="2" /><path d="M6 7v10m0-3h5a7 7 0 0 0 7-5" /></> },
  team: { label: "Team", icon: <><circle cx="9" cy="7" r="3" /><path d="M3 21v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2M17 5a3 3 0 1 1 0 6m1 3a4 4 0 0 1 4 4v3" /></> },
};

function Wordmark() {
  return <Link className={styles.wordmark} href="/admin">Maldives<span>.org</span></Link>;
}

function Login({ mode, step, notice }: { mode: AdminAuthMode | null; step?: string | string[]; notice?: string | string[] }) {
  const verify = mode === "otp" && step === "verify";
  return <div className={styles.app}>
    <header className={styles.topbar}>
      <Wordmark />
      <Link className={styles.button} href="/">Public site <ArrowUpRight size={15} /></Link>
    </header>
    <main className={styles.login}>
      <div className={styles.loginLayout}>
        <div className={styles.loginPhoto} aria-hidden="true" />
        <div className={styles.loginPanel}>
          <span className={styles.lock} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></svg>
          </span>
          <h1>{mode ? verify ? "Enter your sign-in code" : "Staff sign in" : "Staff access unavailable"}</h1>
          {!mode ? <p>Contact the site owner for access to the staff workspace.</p> : mode === "password" ? <>
            <p>Enter your staff email and password.</p>
            {notice === "credentials" && <p className={styles.alert} role="alert">Sign-in failed. Check your details and try again.</p>}
            <form className={styles.loginForm} action={signInWithPassword}>
              <label>Staff email<input type="email" name="email" autoComplete="username" maxLength={254} required /></label>
              <label>Password<input type="password" name="password" autoComplete="current-password" maxLength={128} required /></label>
              <Submit className={`${styles.button} ${styles.primary}`}>Sign in</Submit>
            </form>
          </> : verify ? <>
            <p>If your email has access, you’ll receive a code valid for five minutes.</p>
            {notice === "code" && <p className={styles.alert} role="alert">The code could not be verified. Check the latest email or request a new code.</p>}
            <form className={styles.loginForm} action={verifyCode}>
              <label>Staff email<input type="email" name="email" autoComplete="email" maxLength={254} required /></label>
              <label>One-time code<input className={styles.codeInput} type="text" name="code" autoComplete="one-time-code" inputMode="numeric" pattern={`[0-9]{${otpLength}}`} maxLength={otpLength} placeholder="00000000" required /></label>
              <Submit className={`${styles.button} ${styles.primary}`}>Sign in</Submit>
            </form>
            <Link className={styles.textLink} href="/admin">Request another code</Link>
          </> : <>
            <p>Enter your staff email to receive a one-time sign-in code.</p>
            <form className={styles.loginForm} action={requestCode}>
              <label>Staff email<input type="email" autoComplete="email" name="email" maxLength={254} required /></label>
              <Submit className={`${styles.button} ${styles.primary}`}>Email me a code</Submit>
            </form>
          </>}
        </div>
      </div>
    </main>
  </div>;
}

function Dashboard({ actor, view, notice, children }: { actor: AdminActor; view: View; notice: string; children: React.ReactNode }) {
  const message = Object.hasOwn(statusMessages, notice) ? statusMessages[notice as keyof typeof statusMessages] : null;
  return <div className={styles.app}>
    <header className={styles.topbar}>
      <Wordmark />
      <div className={styles.topActions}>
        <span className={styles.account} title={actor.email}>{actor.role}</span>
        <Link className={styles.button} href="/">Public site <ArrowUpRight size={15} /></Link>
        <form action={signOut}><Submit>Sign out</Submit></form>
      </div>
    </header>
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        <nav aria-label="Staff workspace">
          {views.filter(item => item !== "team" || actor.role === "owner").map(item => <Link key={item} prefetch={false}
            href={item === "content" ? "/admin" : `/admin?view=${item}`} aria-current={item === view ? "page" : undefined}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{navigation[item].icon}</svg>
            {navigation[item].label}
          </Link>)}
        </nav>
      </aside>
      <main className={styles.main}>
        {message && <p className={notice === "ok" ? styles.success : styles.alert} role={notice === "ok" ? "status" : "alert"}>{message}</p>}
        {children}
      </main>
    </div>
  </div>;
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const params = await searchParams;
  const config = adminAuthConfig();
  const session = await getAdminActor().then(actor => ({ actor, mode: config?.mode ?? null })).catch(() => ({ actor: null, mode: null }));
  if (!session.actor) return <Login mode={session.mode} step={params.step} notice={params.notice} />;
  const actor = session.actor;
  const requested = typeof params.view === "string" && views.includes(params.view as View) ? params.view as View : "content";
  const view = requested === "team" && actor.role !== "owner" ? "content" : requested;
  const pageText = typeof params.page === "string" && /^\d{1,5}$/.test(params.page) ? params.page : "1";
  const page = Math.max(1, Number(pageText));
  const notice = typeof params.notice === "string" ? params.notice : "";
  let screen: React.ReactNode;

  if (view === "history") {
    const scope = params.scope === "affiliates" ? "affiliates" : params.scope === "audit" && actor.role === "owner" ? "audit" : "site";
    const currentScope: Scope = scope === "affiliates" ? "affiliates" : "site";
    const [events, versions, draft] = await Promise.all([
      activity(scope === "audit" ? ["auth", "team"] : [scope], 26, (page - 1) * 25),
      scope === "audit" ? Promise.resolve([]) : revisions(scope, (page - 1) * 25),
      readDraft(currentScope),
    ]);
    screen = <HistoryView scope={scope} actor={actor} events={events} revisions={versions} draft={draft} page={page} />;
  } else if (view === "affiliates") {
    screen = <AffiliateEditor actor={actor} draft={await readDraft("affiliates")} />;
  } else if (view === "github") {
    screen = <GitHubView result={await getGitHubStatus(page)} page={page} />;
  } else if (view === "team") {
    screen = <TeamView members={await listMembers()} />;
  } else {
    const [draft, events] = await Promise.all([readDraft("site"), activity(["site"], 4)]);
    screen = <ContentEditor key={draft.version} actor={actor} draft={draft} events={events} />;
  }
  return <Dashboard actor={actor} view={view} notice={notice}>{screen}</Dashboard>;
}
