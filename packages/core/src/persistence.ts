import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ReviewStory } from "./schema.js";

export function reviewPath(repositoryPath: string): string {
  return join(repositoryPath, ".rearview", "review.json");
}

export function saveStory(story: ReviewStory): string {
  const dir = join(story.repositoryPath, ".rearview");
  mkdirSync(dir, { recursive: true });
  const path = reviewPath(story.repositoryPath);
  writeFileSync(path, `${JSON.stringify({ ...story, updatedAt: new Date().toISOString() }, null, 2)}\n`);
  return path;
}

export function loadStory(repositoryPath: string): ReviewStory {
  return JSON.parse(readFileSync(reviewPath(repositoryPath), "utf8")) as ReviewStory;
}
