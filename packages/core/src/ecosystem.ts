import type { ReviewStory, ReviewThread } from "./schema.js";

export interface ProviderPlugin { id: string; name: string; capabilities: string[]; }
export interface ReviewerAgentPlugin { id: string; name: string; persona: string; defaultBudget: number; }
export interface RearviewBundle { format: "rearview.bundle.v1"; story: ReviewStory; threads: ReviewThread[]; providers: ProviderPlugin[]; exportedAt: string; }
export interface BrowserOverlayMessage { provider: "github" | "gitlab"; pullOrMergeRequest: string; storySectionIds: string[]; localServerUrl: string; }

export function exportBundle(story: ReviewStory, threads: ReviewThread[] = [], providers: ProviderPlugin[] = []): string {
  const bundle: RearviewBundle = { format: "rearview.bundle.v1", story, threads, providers, exportedAt: new Date().toISOString() };
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function importBundle(serialized: string): RearviewBundle {
  const bundle = JSON.parse(serialized) as RearviewBundle;
  if (bundle.format !== "rearview.bundle.v1") throw new Error(`Unsupported Rearview bundle format: ${String(bundle.format)}`);
  return bundle;
}

export function createBrowserOverlayMessage(story: ReviewStory, provider: "github" | "gitlab", pullOrMergeRequest: string, localServerUrl = "http://localhost:4173"): BrowserOverlayMessage {
  return { provider, pullOrMergeRequest, storySectionIds: story.sections.map((section) => section.id), localServerUrl };
}

export const publicProviderInterface = ["importReview", "renderComment", "postComment", "replyToThread", "exportSummary"] as const;
export const localAgentMarketplace: ReviewerAgentPlugin[] = [
  { id: "maintainer", name: "Maintainer", persona: "Repository maintainer", defaultBudget: 8 },
  { id: "time-traveler", name: "Time traveler", persona: "Future debugging and extension reviewer", defaultBudget: 6 },
  { id: "on-call-engineer", name: "On-call engineer", persona: "Operations, observability, and performance reviewer", defaultBudget: 6 }
];
