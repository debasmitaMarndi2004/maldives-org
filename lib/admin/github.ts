import "server-only";

import { z } from "zod";

const sha = z.string().regex(/^[0-9a-f]{40}$/i);
const timestamp = z.iso.datetime({ offset: true });
const commitsSchema = z.array(z.object({
  sha,
  commit: z.object({ message: z.string(), author: z.object({ name: z.string(), date: timestamp }).nullable() }),
}));
const pushesSchema = z.array(z.object({
  after: sha,
  timestamp,
  activity_type: z.string(),
  actor: z.object({ login: z.string() }).nullable(),
}));
const statusSchema = z.object({ state: z.enum(["success", "pending", "failure", "error"]), total_count: z.number() });
const checksSchema = z.object({ check_runs: z.array(z.object({ name: z.string(), status: z.string(), conclusion: z.string().nullable() })) });

export async function getGitHubStatus(page: number) {
  const repo = process.env.ADMIN_GITHUB_REPO || "debasmitaMarndi2004/maldives-org";
  const branch = process.env.ADMIN_GITHUB_BRANCH || "master";
  if (!/^[a-z\d](?:[a-z\d-]{0,38})\/[a-z\d_.-]{1,100}$/i.test(repo) || !/^[a-z\d][a-z\d/_.-]{0,120}$/i.test(branch)) return null;
  const token = process.env.ADMIN_GITHUB_READ_TOKEN;
  const api = `https://api.github.com/repos/${repo}`;
  const github = `https://github.com/${repo}`;
  const perPage = 20;
  const query = new URLSearchParams({ per_page: String(perPage), page: String(page) });

  async function githubJson<T>(path: string, schema: z.ZodType<T>) {
    try {
      const response = await fetch(`${api}${path}`, {
        headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(5500),
      });
      if (!response.ok) return null;
      const parsed = schema.safeParse(await response.json());
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }

  const [commits, pushes, head] = await Promise.all([
    githubJson(`/commits?${query}&sha=${encodeURIComponent(branch)}`, commitsSchema),
    githubJson(`/activity?${query}&ref=${encodeURIComponent(`refs/heads/${branch}`)}`, pushesSchema),
    page === 1 ? Promise.resolve(null) : githubJson(`/commits?per_page=1&sha=${encodeURIComponent(branch)}`, commitsSchema),
  ]);
  const headSha = (page === 1 ? commits : head)?.[0]?.sha;
  const [status, checks] = headSha ? await Promise.all([
    githubJson(`/commits/${headSha}/status`, statusSchema),
    githubJson(`/commits/${headSha}/check-runs?per_page=10`, checksSchema),
  ]) : [null, null];
  const deployedSha = sha.safeParse(process.env.VERCEL_GIT_COMMIT_SHA);
  return {
    repo, branch, github, commits, pushes, headSha, status, checks: checks?.check_runs,
    deployedSha: deployedSha.success ? deployedSha.data : null,
    hasMore: commits?.length === perPage || pushes?.length === perPage,
  };
}
