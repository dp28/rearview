import test from "node:test";
import assert from "node:assert/strict";
import { approveAgentDraft, buildStory, parseGitDiff, reviewerAgentPresets, runReviewerAgent } from "../packages/core/src/index.js";

test("runs reviewer presets with human-approval drafts", () => {
  const story = buildStory(parseGitDiff("diff --git a/src/auth.ts b/src/auth.ts\n@@ -1 +1 @@\n-a\n+b"), ".", { kind: "working-tree" });
  const [summary] = runReviewerAgent(story, reviewerAgentPresets["on-call-engineer"]);
  assert.match(summary.summary, /human approval/);
  assert.equal(summary.drafts[0].approved, false);
  assert.equal(approveAgentDraft(summary.drafts[0]).author, "On-call engineer");
});
