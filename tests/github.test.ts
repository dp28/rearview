import test from "node:test";
import assert from "node:assert/strict";
import { createComment } from "../packages/core/src/index.js";
import { githubConfigFromEnv, mapRearviewLineToGitHubPosition, renderGitHubReviewComment } from "../packages/integrations/src/index.js";

test("reads GitHub token configuration", () => {
  assert.equal(githubConfigFromEnv({ GITHUB_TOKEN: "ghp" }).token, "ghp");
});

test("maps Rearview lines to GitHub diff position hints", () => {
  const diff = "diff --git a/a.ts b/a.ts\n@@ -1,1 +1,2 @@\n old\n+new";
  assert.deepEqual(mapRearviewLineToGitHubPosition("a.ts", 2, diff), { path: "a.ts", line: 2, side: "RIGHT", positionHint: 3 });
});

test("renders structured metadata in GitHub-compatible markdown", () => {
  assert.match(renderGitHubReviewComment(createComment({ body: "Fix this", intent: "issue" })), /rearview:/);
});
