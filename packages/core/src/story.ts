import { createId } from "./index.js";
import type { ReviewFile, ReviewSection, ReviewStory, ReviewTarget } from "./schema.js";

const ORDER = ["Persistence", "Implementation", "API", "Interface", "Tests", "Documentation"];

export function buildStory(files: ReviewFile[], repositoryPath: string, target: ReviewTarget): ReviewStory {
  const now = new Date().toISOString();
  const grouped = new Map<string, ReviewFile[]>();
  for (const file of files) {
    const key = file.role;
    grouped.set(key, [...(grouped.get(key) ?? []), file]);
  }
  const sections: ReviewSection[] = [...grouped.entries()]
    .sort(([a], [b]) => (ORDER.indexOf(a) === -1 ? 99 : ORDER.indexOf(a)) - (ORDER.indexOf(b) === -1 ? 99 : ORDER.indexOf(b)))
    .map(([role, roleFiles]) => ({
      id: createId("section", role),
      title: sectionTitle(role),
      purpose: sectionPurpose(role, roleFiles.length),
      guidance: sectionGuidance(role),
      risk: roleFiles.some((f) => f.risk === "high") ? "high" : roleFiles.some((f) => f.risk === "medium") ? "medium" : "low",
      files: roleFiles.sort((a, b) => a.path.localeCompare(b.path))
    }));
  return {
    schemaVersion: 1,
    id: createId("review", `${repositoryPath}-${target.kind}-${now}`),
    repositoryPath,
    target,
    title: "Local change review",
    summary: `${files.length} changed file${files.length === 1 ? "" : "s"} organized into ${sections.length} review section${sections.length === 1 ? "" : "s"}.`,
    sections,
    createdAt: now,
    updatedAt: now
  };
}

function sectionTitle(role: string): string {
  return {
    Persistence: "Review data shape and persistence first",
    Implementation: "Review core behavior",
    API: "Review integration boundaries",
    Interface: "Review user-facing surfaces",
    Tests: "Review coverage and examples",
    Documentation: "Review documentation and review notes"
  }[role] ?? `Review ${role.toLowerCase()}`;
}

function sectionPurpose(role: string, count: number): string {
  return `${count} ${count === 1 ? "file" : "files"} categorized as ${role.toLowerCase()} changes.`;
}

function sectionGuidance(role: string): string {
  if (role === "Tests") return "Confirm behavior is covered and test names explain reviewer intent.";
  if (role === "Documentation") return "Skim for accuracy, missing migration notes, and reviewer context.";
  if (role === "Persistence") return "Inspect compatibility, data safety, and rollback implications before dependent code.";
  if (role === "API") return "Check request/response contracts, validation, errors, and integration seams.";
  if (role === "Interface") return "Check workflow clarity, accessibility, and responsive behavior.";
  return "Focus on correctness, naming, edge cases, and maintainability.";
}
