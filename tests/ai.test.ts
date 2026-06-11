import test from "node:test";
import assert from "node:assert/strict";
import { aiConfigFromEnv, buildStoryPrompt, contextPreview, createAiProvider, mergeAiStoryDraft, parseGitDiff, buildStory } from "../packages/core/src/index.js";

test("loads AI credentials from environment", () => {
  const configs = aiConfigFromEnv({ OPENAI_API_KEY: "o", ANTHROPIC_API_KEY: "a" });
  assert.equal(configs[0].provider, "codex");
  assert.equal(configs[1].apiKey, "a");
});

test("creates context preview and draft story response", async () => {
  const files = parseGitDiff("diff --git a/src/auth.ts b/src/auth.ts\n--- a/src/auth.ts\n+++ b/src/auth.ts\n@@ -1,1 +1,2 @@\n export const a = 1\n+export const b = 2");
  assert.match(buildStoryPrompt({ files }), /structured JSON/);
  assert.match(contextPreview(files, 40), /truncated/);
  const provider = createAiProvider({ provider: "codex", apiKey: "x" });
  const response = await provider.generateStory({ files });
  assert.equal(response.riskNotes[0].draft, true);
  const existing = buildStory(files, ".", { kind: "working-tree" });
  assert.equal(mergeAiStoryDraft(existing, response).sections.length, response.sections.length);
});
