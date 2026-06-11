import { execFileSync } from "node:child_process";
import type { ReviewTarget } from "./schema.js";

export function loadDiff(repositoryPath: string, target: ReviewTarget): string {
  const args = ["-C", repositoryPath, "diff", "--no-ext-diff", "--find-renames"];
  if (target.kind === "staged") args.push("--staged");
  if (target.kind === "branch" && target.base) args.push(`${target.base}...${target.head ?? "HEAD"}`);
  if (target.kind === "commit-range" && target.range) args.push(target.range);
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 });
}
