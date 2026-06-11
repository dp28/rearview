import { createComment, type NewCommentInput } from "./comments.js";
import type { ReviewComment, ReviewFile, ReviewSection, ReviewStory } from "./schema.js";

export type ReviewerPersona = "maintainer" | "time-traveler" | "on-call-engineer";
export interface ReviewerAgentConfig { persona: ReviewerPersona; name: string; priorities: string[]; commentBudget: number; }
export interface AgentDraftComment extends ReviewComment { confidence: "low" | "medium" | "high"; approved: false; agentName: string; }
export interface AgentReviewSummary { agentName: string; sectionId?: string; summary: string; drafts: AgentDraftComment[]; }

export const reviewerAgentPresets: Record<ReviewerPersona, ReviewerAgentConfig> = {
  maintainer: { persona: "maintainer", name: "Maintainer", priorities: ["reuse existing patterns", "simple vocabulary", "edge cases", "test coverage"], commentBudget: 8 },
  "time-traveler": { persona: "time-traveler", name: "Time traveler", priorities: ["decision context", "future extension", "complete migrations", "why not just what"], commentBudget: 6 },
  "on-call-engineer": { persona: "on-call-engineer", name: "On-call engineer", priorities: ["observability", "performance", "failure modes", "operational recovery"], commentBudget: 6 }
};

export function runReviewerAgent(story: ReviewStory, config: ReviewerAgentConfig, selected: { sectionIds?: string[]; filePaths?: string[] } = {}): AgentReviewSummary[] {
  const sections = story.sections.filter((section) => !selected.sectionIds || selected.sectionIds.includes(section.id));
  let remaining = config.commentBudget;
  return sections.map((section) => {
    const files = section.files.filter((file) => !selected.filePaths || selected.filePaths.includes(file.path));
    const drafts: AgentDraftComment[] = [];
    for (const file of files) {
      if (remaining <= 0) break;
      const draft = draftForFile(config, section, file);
      if (draft && !isDuplicateDraft(drafts, draft)) { drafts.push(draft); remaining--; }
    }
    return { agentName: config.name, sectionId: section.id, summary: summarizeAgentFindings(config, section, drafts), drafts };
  });
}

export function approveAgentDraft(draft: AgentDraftComment): ReviewComment {
  const { confidence: _confidence, approved: _approved, agentName: _agentName, ...comment } = draft;
  return comment;
}

export function isDuplicateDraft(existing: ReviewComment[], draft: ReviewComment): boolean {
  return existing.some((comment) => comment.filePath === draft.filePath && comment.intent === draft.intent && comment.body === draft.body);
}

function draftForFile(config: ReviewerAgentConfig, section: ReviewSection, file: ReviewFile): AgentDraftComment | undefined {
  let input: NewCommentInput | undefined;
  if (file.risk === "high") {
    input = { body: `${config.name} draft: verify ${file.path} because this section is marked high risk.`, intent: "question", severity: "high", sectionId: section.id, filePath: file.path, author: config.name };
  } else if (config.persona === "on-call-engineer" && file.role !== "Tests") {
    input = { body: `${config.name} draft: consider whether this change needs logs, metrics, or clearer failure handling.`, intent: "suggestion", severity: "medium", sectionId: section.id, filePath: file.path, author: config.name };
  }
  if (!input) return undefined;
  return { ...createComment(input), confidence: "low", approved: false, agentName: config.name };
}


function summarizeAgentFindings(config: ReviewerAgentConfig, section: ReviewSection, drafts: AgentDraftComment[]): string {
  return `${config.name} reviewed ${section.title} for ${config.priorities.join(", ")}. ${drafts.length} draft comment${drafts.length === 1 ? "" : "s"} require human approval before posting.`;
}
