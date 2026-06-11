#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { buildStory, createId, exportStoryMarkdown, loadDiff, parseGitDiff, saveStory, type ReviewTarget } from "../../core/src/index.js";
import { startServer } from "../../server/src/index.js";

const [, , command = "help", ...args] = process.argv;
const repo = process.cwd();
function target(): ReviewTarget { return args.includes("--staged") ? { kind: "staged" } : { kind: "working-tree" }; }
function story() { return buildStory(parseGitDiff(loadDiff(repo, target())), repo, target()); }

if (command === "help" || command === "--help" || command === "-h") {
  console.log(`Rearview\n\nCommands:\n  help        Show this message\n  init        Create .rearview metadata directory\n  story       Print local review story JSON\n  save        Persist .rearview/review.json\n  export      Write review markdown\n  serve       Start local web UI`);
} else if (command === "init") {
  const { mkdirSync, writeFileSync: write, existsSync } = await import("node:fs");
  mkdirSync(".rearview", { recursive: true });
  if (!existsSync(".rearview/README.md")) write(".rearview/README.md", "# Rearview metadata\n");
  console.log(`Initialized ${createId("workspace", repo)}`);
} else if (command === "story") {
  console.log(JSON.stringify(story(), null, 2));
} else if (command === "save") {
  console.log(saveStory(story()));
} else if (command === "export") {
  const out = args[0] && !args[0].startsWith("--") ? args[0] : ".rearview/review.md";
  writeFileSync(out, exportStoryMarkdown(story()));
  console.log(out);
} else if (command === "serve") {
  const port = Number(args.find((a) => /^\d+$/.test(a)) ?? 4173);
  startServer({ port, repositoryPath: repo, target: target() });
  console.log(`Rearview listening on http://localhost:${port}`);
} else {
  console.error(`Unknown command: ${command}`);
  process.exitCode = 1;
}
