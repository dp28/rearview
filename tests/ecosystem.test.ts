import test from "node:test";
import assert from "node:assert/strict";
import { buildStory, createBrowserOverlayMessage, exportBundle, importBundle, localAgentMarketplace, parseGitDiff, publicProviderInterface } from "../packages/core/src/index.js";

test("exports and imports archival bundles", () => {
  const story = buildStory(parseGitDiff(""), ".", { kind: "working-tree" });
  const bundle = importBundle(exportBundle(story));
  assert.equal(bundle.format, "rearview.bundle.v1");
});

test("defines provider interface, marketplace, and overlay message", () => {
  const story = buildStory([], ".", { kind: "working-tree" });
  assert.equal(publicProviderInterface.includes("postComment"), true);
  assert.equal(localAgentMarketplace.length, 3);
  assert.equal(createBrowserOverlayMessage(story, "github", "1").provider, "github");
});
