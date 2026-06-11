import test from "node:test";
import assert from "node:assert/strict";
import { buildStory, exportStoryMarkdown, parseGitDiff } from "../packages/core/src/index.js";

const diff = `diff --git a/src/api.ts b/src/api.ts
index 111..222 100644
--- a/src/api.ts
+++ b/src/api.ts
@@ -1,1 +1,2 @@ handler
 export function old() {}
+export function added() {}
diff --git a/src/api.test.ts b/src/api.test.ts
new file mode 100644
--- /dev/null
+++ b/src/api.test.ts
@@ -0,0 +1,1 @@
+test('added', () => {})`;

test("parses git diff files and hunks", () => {
  const files = parseGitDiff(diff);
  assert.equal(files.length, 2);
  assert.equal(files[0].hunks[0].lines.at(-1)?.kind, "add");
});

test("builds deterministic story sections", () => {
  const story = buildStory(parseGitDiff(diff), ".", { kind: "working-tree" });
  assert.deepEqual(story.sections.map((s) => s.files[0].role), ["API", "Tests"]);
  assert.match(exportStoryMarkdown(story), /Review integration boundaries/);
});
