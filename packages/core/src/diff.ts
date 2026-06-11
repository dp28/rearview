import { createId } from "./index.js";
import type { DiffHunk, DiffLine, ReviewFile } from "./schema.js";

const HUNK_RE = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@ ?(.*)$/;

export function parseGitDiff(diff: string): ReviewFile[] {
  const files: ReviewFile[] = [];
  let current: ReviewFile | undefined;
  let hunk: DiffHunk | undefined;
  let oldLine = 0;
  let newLine = 0;

  for (const raw of diff.split(/\r?\n/)) {
    if (raw.startsWith("diff --git ")) {
      if (current) files.push(current);
      const match = raw.match(/^diff --git a\/(.*) b\/(.*)$/);
      const path = match?.[2] ?? raw.slice("diff --git ".length);
      current = { path, status: "modified", role: categorizePath(path), risk: riskForPath(path), hunks: [] };
      hunk = undefined;
      continue;
    }
    if (!current) continue;
    if (raw.startsWith("new file mode")) current.status = "added";
    if (raw.startsWith("deleted file mode")) current.status = "deleted";
    if (raw.startsWith("rename from ")) current.oldPath = raw.slice("rename from ".length);
    if (raw.startsWith("rename to ")) current.status = "renamed";
    const hunkMatch = raw.match(HUNK_RE);
    if (hunkMatch) {
      oldLine = Number(hunkMatch[1]);
      newLine = Number(hunkMatch[3]);
      hunk = {
        id: createId("hunk", `${current.path}-${current.hunks.length + 1}`),
        oldStart: oldLine,
        oldLines: Number(hunkMatch[2] ?? 1),
        newStart: newLine,
        newLines: Number(hunkMatch[4] ?? 1),
        heading: hunkMatch[5] ?? "",
        lines: []
      };
      current.hunks.push(hunk);
      continue;
    }
    if (!hunk || raw.startsWith("--- ") || raw.startsWith("+++ ")) continue;
    const marker = raw[0];
    const content = raw.slice(1);
    let line: DiffLine | undefined;
    if (marker === "+") line = { kind: "add", newLine: newLine++, content };
    else if (marker === "-") line = { kind: "delete", oldLine: oldLine++, content };
    else if (marker === " ") line = { kind: "context", oldLine: oldLine++, newLine: newLine++, content };
    if (line) hunk.lines.push(line);
  }
  if (current) files.push(current);
  return files;
}

export function categorizePath(path: string): string {
  if (/test|spec|__tests__/i.test(path)) return "Tests";
  if (/migration|schema|model/i.test(path)) return "Persistence";
  if (/route|controller|api/i.test(path)) return "API";
  if (/ui|web|component|css|html/i.test(path)) return "Interface";
  if (/doc|readme|\.md$/i.test(path)) return "Documentation";
  return "Implementation";
}

export function riskForPath(path: string): "low" | "medium" | "high" {
  if (/migration|auth|security|payment|schema/i.test(path)) return "high";
  if (/test|spec|doc|readme|\.md$/i.test(path)) return "low";
  return "medium";
}
