import test from "node:test";
import assert from "node:assert/strict";
import { createComment } from "../packages/core/src/index.js";
import { gitLabConfigFromEnv, providerCapabilityMatrix, renderGitLabDiscussionComment } from "../packages/integrations/src/index.js";

test("reads GitLab token configuration", () => {
  assert.equal(gitLabConfigFromEnv({ GITLAB_TOKEN: "gl" }).token, "gl");
});

test("documents provider capabilities", () => {
  assert.equal(providerCapabilityMatrix.find((row) => row.provider === "gitlab")?.replies, true);
});

test("renders GitLab discussion markdown with metadata", () => {
  assert.match(renderGitLabDiscussionComment(createComment({ body: "Question", intent: "question" })), /rearview:/);
});
