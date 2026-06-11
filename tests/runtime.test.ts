import test from "node:test";
import assert from "node:assert/strict";
import { assertPrivacyPrompt, runtimeCapabilities } from "../packages/core/src/index.js";

test("documents runtime boundaries for future surfaces", () => {
  assert.equal(runtimeCapabilities.find((c) => c.surface === "local-server")?.canReadLocalGit, true);
  assert.equal(assertPrivacyPrompt("hosted-service", true), true);
});
