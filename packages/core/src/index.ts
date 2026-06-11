export * from "./schema.js";

export function createId(prefix: string, input: string): string {
  const slug = input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
  return `${prefix}-${slug || "item"}`;
}
export * from "./diff.js";
export * from "./story.js";
export * from "./git.js";
export * from "./persistence.js";
export * from "./export.js";
export * from "./comments.js";
export * from "./ai.js";
export * from "./authoring.js";
export * from "./agents.js";
export * from "./runtime.js";
export * from "./intelligence.js";
export * from "./ecosystem.js";
