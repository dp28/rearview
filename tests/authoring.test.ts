import test from "node:test";
import assert from "node:assert/strict";
import { buildStory, detectStoryTrailers, editSection, generateCommitRewritePlan, generatePullRequestBody, moveFile, moveSection, parseGitDiff } from "../packages/core/src/index.js";

const story = buildStory(parseGitDiff("diff --git a/src/api.ts b/src/api.ts\n@@ -1 +1 @@\n-a\n+b\ndiff --git a/src/api.test.ts b/src/api.test.ts\n@@ -1 +1 @@\n-a\n+b"), ".", { kind: "working-tree" });

test("supports self-review section and file reordering", () => {
  const moved = moveSection(story, story.sections[1].id, 0);
  assert.equal(moved.sections[0].id, story.sections[1].id);
  const fileMoved = moveFile(story, "src/api.test.ts", story.sections[0].id);
  assert.equal(fileMoved.sections[0].files[0].path, "src/api.test.ts");
});

test("edits story and generates PR body and rewrite plan", () => {
  const edited = editSection(story, story.sections[0].id, { title: "Start here" });
  assert.match(generatePullRequestBody(edited, [{ id: "n", sectionId: edited.sections[0].id, kind: "decision", body: "Intentional." }]), /Author notes/);
  assert.match(generateCommitRewritePlan(edited)[0].commands.join("\n"), /git commit/);
  assert.equal(detectStoryTrailers("Rearview-Section: API").section, "API");
});
