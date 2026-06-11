import { buildStory } from "./story.js";
import type { ReviewFile, ReviewSection, ReviewStory } from "./schema.js";

export type AiProviderName = "codex" | "claude";

export interface AiProviderConfig { provider: AiProviderName; apiKey?: string; model?: string; }
export interface AiStoryRequest { files: ReviewFile[]; existingStory?: ReviewStory; maxContextChars?: number; }
export interface AiRiskNote { filePath?: string; sectionId?: string; note: string; confidence: "low" | "medium" | "high"; draft: true; }
export interface AiStoryResponse { sections: Pick<ReviewSection, "id" | "title" | "purpose" | "guidance" | "risk">[]; riskNotes: AiRiskNote[]; }
export interface AiProvider { name: AiProviderName; configured(): boolean; generateStory(request: AiStoryRequest): Promise<AiStoryResponse>; }

export function aiConfigFromEnv(env: NodeJS.ProcessEnv = process.env): AiProviderConfig[] {
  return [
    { provider: "codex", apiKey: env.OPENAI_API_KEY ?? env.CODEX_API_KEY, model: env.REARVIEW_CODEX_MODEL ?? "gpt-5.5" },
    { provider: "claude", apiKey: env.ANTHROPIC_API_KEY ?? env.CLAUDE_API_KEY, model: env.REARVIEW_CLAUDE_MODEL ?? "claude-sonnet" }
  ];
}

export function createAiProvider(config: AiProviderConfig): AiProvider {
  return {
    name: config.provider,
    configured: () => Boolean(config.apiKey),
    async generateStory(request) {
      const fallback = buildStory(request.files, ".", { kind: "working-tree" });
      return {
        sections: fallback.sections.map(({ id, title, purpose, guidance, risk }) => ({ id, title: `[AI draft] ${title}`, purpose, guidance: `${guidance} Treat AI guidance as a draft and verify against the diff.`, risk })),
        riskNotes: request.files.filter((file) => file.risk !== "low").map((file) => ({ filePath: file.path, note: `${config.provider} draft: inspect ${file.role.toLowerCase()} risk in ${file.path}.`, confidence: "low", draft: true as const }))
      };
    }
  };
}

export function buildStoryPrompt(request: AiStoryRequest): string {
  return [
    "You are organizing a code review into a reviewer-friendly story.",
    "Return structured JSON with sections and draft risk notes. Do not present draft risks as facts.",
    contextPreview(request.files, request.maxContextChars ?? 6000)
  ].join("\n\n");
}

export function contextPreview(files: ReviewFile[], maxChars = 6000): string {
  const text = files.map((file) => `FILE ${file.path} (${file.status}, ${file.risk})\n${file.hunks.map((h) => `@@ ${h.heading}\n${h.lines.map((l) => `${l.kind === "add" ? "+" : l.kind === "delete" ? "-" : " "}${l.content}`).join("\n")}`).join("\n")}`).join("\n\n");
  return text.length > maxChars ? `${text.slice(0, maxChars)}\n...[truncated for preview]` : text;
}

export function mergeAiStoryDraft(existing: ReviewStory, ai: AiStoryResponse): ReviewStory {
  const edited = new Map(existing.sections.map((section) => [section.id, section]));
  return {
    ...existing,
    sections: ai.sections.map((draft) => {
      const previous = edited.get(draft.id);
      return previous ? { ...previous, risk: draft.risk, guidance: previous.guidance || draft.guidance } : { ...draft, files: [] };
    }),
    updatedAt: new Date().toISOString()
  };
}
