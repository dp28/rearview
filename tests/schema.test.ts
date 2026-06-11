import test from "node:test";
import assert from "node:assert/strict";
import { createId, type ReviewStory } from "../packages/core/src/index.js";

test("createId creates stable readable identifiers", () => {
  assert.equal(createId("section", "API & Tests!"), "section-api-tests");
});

test("review story schema accepts a minimal story", () => {
  const story: ReviewStory = {
    schemaVersion: 1,
    id: "review-demo",
    repositoryPath: ".",
    target: { kind: "working-tree" },
    title: "Demo",
    summary: "A minimal story",
    sections: [],
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString()
  };
  assert.equal(story.schemaVersion, 1);
});
