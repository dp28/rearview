import type { ReviewFile, ReviewStory } from "./schema.js";

export interface SymbolHint { filePath: string; name: string; kind: "function" | "class" | "test" | "export"; line?: number; }
export interface RelationshipHint { from: string; to: string; kind: "calls" | "tests" | "mentions"; confidence: "low" | "medium" | "high"; }
export interface FatigueMetrics { changedFiles: number; changedLines: number; highRiskFiles: number; recommendedBreaks: number; }
export interface SearchResult { kind: "section" | "file" | "hunk"; path: string; excerpt: string; }

export function extractSymbols(file: ReviewFile): SymbolHint[] {
  const hints: SymbolHint[] = [];
  for (const hunk of file.hunks) for (const line of hunk.lines) {
    if (line.kind === "delete") continue;
    const match = line.content.match(/(?:export\s+)?(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z0-9_]+)/);
    const test = line.content.match(/\b(?:it|test|describe)\(["'`]([^"'`]+)/);
    if (match) hints.push({ filePath: file.path, name: match[1], kind: /class/.test(line.content) ? "class" : /export/.test(line.content) ? "export" : "function", line: line.newLine });
    if (test) hints.push({ filePath: file.path, name: test[1], kind: "test", line: line.newLine });
  }
  return hints;
}

export function relationshipHints(files: ReviewFile[]): RelationshipHint[] {
  const symbols = files.flatMap(extractSymbols);
  const hints: RelationshipHint[] = [];
  for (const symbol of symbols) {
    for (const file of files) {
      if (file.path === symbol.filePath) continue;
      const mentions = file.hunks.some((h) => h.lines.some((l) => l.content.includes(symbol.name)));
      if (mentions) hints.push({ from: file.path, to: symbol.filePath, kind: /test|spec/i.test(file.path) ? "tests" : "mentions", confidence: "medium" });
    }
  }
  return hints;
}

export function detectGeneratedFile(file: ReviewFile): boolean {
  return /(^|\/)(dist|build|generated|vendor)\//.test(file.path) || file.hunks.some((h) => h.lines.some((l) => /generated file|do not edit/i.test(l.content)));
}

export function invalidateReviewedState(story: ReviewStory, changedPaths: string[]): ReviewStory {
  return { ...story, sections: story.sections.map((section) => {
    const touched = section.files.some((file) => changedPaths.includes(file.path));
    return touched ? { ...section, reviewed: false, files: section.files.map((file) => changedPaths.includes(file.path) ? { ...file, reviewed: false } : file) } : section;
  }), updatedAt: new Date().toISOString() };
}

export function reviewFatigueMetrics(story: ReviewStory): FatigueMetrics {
  const files = story.sections.flatMap((s) => s.files);
  const changedLines = files.reduce((sum, file) => sum + file.hunks.reduce((h, hunk) => h + hunk.lines.filter((line) => line.kind !== "context").length, 0), 0);
  return { changedFiles: files.length, changedLines, highRiskFiles: files.filter((file) => file.risk === "high").length, recommendedBreaks: Math.floor(changedLines / 400) };
}

export function searchStory(story: ReviewStory, query: string): SearchResult[] {
  const q = query.toLowerCase();
  const results: SearchResult[] = [];
  for (const section of story.sections) {
    if (`${section.title} ${section.purpose} ${section.guidance}`.toLowerCase().includes(q)) results.push({ kind: "section", path: section.id, excerpt: section.title });
    for (const file of section.files) {
      if (file.path.toLowerCase().includes(q)) results.push({ kind: "file", path: file.path, excerpt: file.role });
      for (const hunk of file.hunks) if (hunk.lines.some((line) => line.content.toLowerCase().includes(q))) results.push({ kind: "hunk", path: `${file.path}:${hunk.newStart}`, excerpt: hunk.heading || file.path });
    }
  }
  return results;
}
