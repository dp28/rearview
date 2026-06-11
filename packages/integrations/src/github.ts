import { renderCommentMarkdown, type ReviewComment } from "../../core/src/index.js";

export interface GitHubConfig { token?: string; apiBaseUrl?: string; owner: string; repo: string; pullNumber: number; }
export interface GitHubPullRequest { number: number; title: string; body: string; headRef: string; baseRef: string; state: string; }
export interface GitHubCheck { name: string; status: string; conclusion?: string; }
export interface GitHubReviewImport { pullRequest: GitHubPullRequest; diff: string; commits: string[]; comments: unknown[]; checks: GitHubCheck[]; reviewStatus: string; }
export interface GitHubLinePosition { path: string; line: number; side: "LEFT" | "RIGHT"; positionHint: number; }

export function githubConfigFromEnv(env: NodeJS.ProcessEnv = process.env): Pick<GitHubConfig, "token" | "apiBaseUrl"> {
  return { token: env.GITHUB_TOKEN, apiBaseUrl: env.GITHUB_API_URL ?? "https://api.github.com" };
}

export function renderGitHubReviewComment(comment: ReviewComment): string {
  return renderCommentMarkdown(comment);
}

export function mapRearviewLineToGitHubPosition(path: string, line: number, diff: string): GitHubLinePosition | undefined {
  let currentPath = "";
  let newLine = 0;
  let oldLine = 0;
  let position = 0;
  for (const raw of diff.split(/\r?\n/)) {
    const file = raw.match(/^diff --git a\/(.*) b\/(.*)$/);
    if (file) { currentPath = file[2]; position = 0; continue; }
    const hunk = raw.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) { oldLine = Number(hunk[1]); newLine = Number(hunk[2]); position++; continue; }
    if (!currentPath) continue;
    position++;
    if (raw.startsWith("+")) { if (currentPath === path && newLine === line) return { path, line, side: "RIGHT", positionHint: position }; newLine++; }
    else if (raw.startsWith("-")) { if (currentPath === path && oldLine === line) return { path, line, side: "LEFT", positionHint: position }; oldLine++; }
    else if (raw.startsWith(" ")) { if (currentPath === path && newLine === line) return { path, line, side: "RIGHT", positionHint: position }; oldLine++; newLine++; }
  }
  return undefined;
}

export async function importGitHubPullRequest(config: GitHubConfig, fetcher: typeof fetch = fetch): Promise<GitHubReviewImport> {
  if (!config.token) throw new Error("GITHUB_TOKEN is required for GitHub import");
  const base = config.apiBaseUrl ?? "https://api.github.com";
  const headers = { authorization: `Bearer ${config.token}`, accept: "application/vnd.github+json" };
  const prUrl = `${base}/repos/${config.owner}/${config.repo}/pulls/${config.pullNumber}`;
  const [pullRequest, diff, commits, comments, checks] = await Promise.all([
    fetcher(prUrl, { headers }).then((r) => r.json()),
    fetcher(prUrl, { headers: { ...headers, accept: "application/vnd.github.v3.diff" } }).then((r) => r.text()),
    fetcher(`${prUrl}/commits`, { headers }).then((r) => r.json()),
    fetcher(`${prUrl}/comments`, { headers }).then((r) => r.json()),
    fetcher(`${base}/repos/${config.owner}/${config.repo}/commits/${config.pullNumber}/check-runs`, { headers }).then((r) => r.json()).catch(() => ({ check_runs: [] }))
  ]);
  return { pullRequest, diff, commits: commits.map((c: { sha: string }) => c.sha), comments, checks: checks.check_runs ?? [], reviewStatus: pullRequest.state ?? "unknown" };
}
