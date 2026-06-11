import { renderCommentMarkdown, type ReviewComment } from "../../core/src/index.js";

export interface GitLabConfig { token?: string; apiBaseUrl?: string; projectId: string; mergeRequestIid: number; }
export interface GitLabMergeRequest { iid: number; title: string; description: string; source_branch: string; target_branch: string; state: string; }
export interface GitLabPipeline { id: number; status: string; ref: string; }
export interface GitLabReviewImport { mergeRequest: GitLabMergeRequest; diff: string; commits: string[]; discussions: unknown[]; pipelines: GitLabPipeline[]; }
export interface ProviderCapability { provider: "github" | "gitlab"; importsDiffs: boolean; lineComments: boolean; replies: boolean; reviewSummary: string; }

export function gitLabConfigFromEnv(env: NodeJS.ProcessEnv = process.env): Pick<GitLabConfig, "token" | "apiBaseUrl"> {
  return { token: env.GITLAB_TOKEN, apiBaseUrl: env.GITLAB_API_URL ?? "https://gitlab.com/api/v4" };
}

export function renderGitLabDiscussionComment(comment: ReviewComment): string {
  return renderCommentMarkdown(comment);
}

export async function importGitLabMergeRequest(config: GitLabConfig, fetcher: typeof fetch = fetch): Promise<GitLabReviewImport> {
  if (!config.token) throw new Error("GITLAB_TOKEN is required for GitLab import");
  const base = config.apiBaseUrl ?? "https://gitlab.com/api/v4";
  const project = encodeURIComponent(config.projectId);
  const mr = `${base}/projects/${project}/merge_requests/${config.mergeRequestIid}`;
  const headers = { "PRIVATE-TOKEN": config.token };
  const [mergeRequest, changes, commits, discussions, pipelines] = await Promise.all([
    fetcher(mr, { headers }).then((r) => r.json()),
    fetcher(`${mr}/changes`, { headers }).then((r) => r.json()),
    fetcher(`${mr}/commits`, { headers }).then((r) => r.json()),
    fetcher(`${mr}/discussions`, { headers }).then((r) => r.json()),
    fetcher(`${mr}/pipelines`, { headers }).then((r) => r.json())
  ]);
  const diff = (changes.changes ?? []).map((change: { old_path: string; new_path: string; diff: string }) => `diff --git a/${change.old_path} b/${change.new_path}\n${change.diff}`).join("\n");
  return { mergeRequest, diff, commits: commits.map((c: { id: string }) => c.id), discussions, pipelines };
}

export const providerCapabilityMatrix: ProviderCapability[] = [
  { provider: "github", importsDiffs: true, lineComments: true, replies: true, reviewSummary: "Pull request review summaries" },
  { provider: "gitlab", importsDiffs: true, lineComments: true, replies: true, reviewSummary: "Merge request notes/discussions" }
];
