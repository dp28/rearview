import test from "node:test";
import assert from "node:assert/strict";
import { createComment, createThread, parseCommentMarkdown, renderCommentMarkdown, resolveThread } from "../packages/core/src/index.js";

test("renders and imports structured comment metadata", () => {
  const comment = createComment({ body: "Please cover the error path.", intent: "suggestion", severity: "medium", filePath: "src/api.ts", line: 12 });
  const markdown = renderCommentMarkdown(comment);
  assert.match(markdown, /rearview:/);
  const [imported] = parseCommentMarkdown(markdown);
  assert.equal(imported.intent, "suggestion");
  assert.equal(imported.filePath, "src/api.ts");
});

test("threads can be resolved", () => {
  const thread = createThread(createComment({ body: "Nice", intent: "praise" }));
  assert.equal(resolveThread(thread).resolved, true);
});
