import test from "node:test";
import assert from "node:assert/strict";
import { buildStory, detectGeneratedFile, extractSymbols, invalidateReviewedState, parseGitDiff, relationshipHints, reviewFatigueMetrics, searchStory } from "../packages/core/src/index.js";

const files = parseGitDiff("diff --git a/src/a.ts b/src/a.ts\n@@ -1 +1,2 @@\n export function old() {}\n+export function next() {}\ndiff --git a/src/a.test.ts b/src/a.test.ts\n@@ -1 +1,2 @@\n test('old',()=>{})\n+test('next works',()=>next())");

test("extracts symbols and relationships", () => {
  assert.equal(extractSymbols(files[0]).at(-1)?.name, "next");
  assert.equal(relationshipHints(files).some((h) => h.kind === "tests"), true);
});

test("detects generated files, invalidates reviewed state, computes metrics, and searches", () => {
  const story = buildStory(files, ".", { kind: "working-tree" });
  assert.equal(detectGeneratedFile({ ...files[0], path: "src/generated/a.ts" }), true);
  assert.equal(invalidateReviewedState({ ...story, sections: story.sections.map((s) => ({ ...s, reviewed: true })) }, [files[0].path]).sections[0].reviewed, false);
  assert.equal(reviewFatigueMetrics(story).changedFiles, 2);
  assert.equal(searchStory(story, "next").length > 0, true);
});
