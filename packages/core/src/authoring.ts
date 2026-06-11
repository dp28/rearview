import type { ReviewFile, ReviewSection, ReviewStory } from "./schema.js";

export interface AuthorNote { id: string; sectionId?: string; filePath?: string; body: string; kind: "tradeoff" | "risk" | "migration" | "decision" | "callout"; }
export interface CommitRewriteStep { sectionId: string; title: string; files: string[]; commands: string[]; safetyChecks: string[]; }

export function moveSection(story: ReviewStory, sectionId: string, toIndex: number): ReviewStory {
  const sections = [...story.sections];
  const from = sections.findIndex((s) => s.id === sectionId);
  if (from === -1) return story;
  const [section] = sections.splice(from, 1);
  sections.splice(toIndex, 0, section);
  return { ...story, sections, updatedAt: new Date().toISOString() };
}

export function moveFile(story: ReviewStory, filePath: string, toSectionId: string, toIndex = 0): ReviewStory {
  let moved: ReviewFile | undefined;
  const sections = story.sections.map((section) => ({ ...section, files: section.files.filter((file) => {
    if (file.path === filePath) { moved = file; return false; }
    return true;
  }) }));
  if (!moved) return story;
  return { ...story, sections: sections.map((section) => section.id === toSectionId ? { ...section, files: [...section.files.slice(0, toIndex), moved!, ...section.files.slice(toIndex)] } : section), updatedAt: new Date().toISOString() };
}

export function editSection(story: ReviewStory, sectionId: string, patch: Partial<Pick<ReviewSection, "title" | "purpose" | "guidance" | "risk">>): ReviewStory {
  return { ...story, sections: story.sections.map((section) => section.id === sectionId ? { ...section, ...patch } : section), updatedAt: new Date().toISOString() };
}

export function generatePullRequestBody(story: ReviewStory, notes: AuthorNote[] = []): string {
  const lines = ["## Review story", "", story.summary, ""];
  for (const section of story.sections) {
    lines.push(`### ${section.title}`, "", section.purpose, "", `Reviewer focus: ${section.guidance}`, "", ...section.files.map((file) => `- ${file.path}`));
    const sectionNotes = notes.filter((note) => note.sectionId === section.id || section.files.some((file) => file.path === note.filePath));
    if (sectionNotes.length) lines.push("", "Author notes:", ...sectionNotes.map((note) => `- **${note.kind}:** ${note.body}`));
    lines.push("");
  }
  return lines.join("\n").trim() + "\n";
}

export function detectStoryTrailers(message: string): Record<string, string> {
  return Object.fromEntries([...message.matchAll(/^Rearview-([A-Za-z-]+):\s*(.+)$/gm)].map(([, key, value]) => [key.toLowerCase(), value]));
}

export function generateCommitRewritePlan(story: ReviewStory): CommitRewriteStep[] {
  return story.sections.map((section) => ({
    sectionId: section.id,
    title: section.title,
    files: section.files.map((file) => file.path),
    commands: ["git status --short", `git add ${section.files.map((file) => JSON.stringify(file.path)).join(" ")}`, `git commit -m ${JSON.stringify(section.title)} -m ${JSON.stringify(section.purpose)}`],
    safetyChecks: ["Confirm the branch is not shared or coordinate before force-pushing.", "Run tests before and after the rewrite.", "Create a backup branch with git branch backup/rearview-rewrite."]
  }));
}
