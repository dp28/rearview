import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { buildStory, exportStoryMarkdown, loadDiff, parseGitDiff, saveStory } from "../../core/src/index.js";
import type { ReviewTarget } from "../../core/src/index.js";

export interface RearviewServerOptions { port: number; repositoryPath: string; target?: ReviewTarget; }

export function describeServer(options: RearviewServerOptions): string { return `Rearview local server for ${options.repositoryPath} on :${options.port}`; }

export function startServer(options: RearviewServerOptions) {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    if (url.pathname === "/api/story") {
      const target = options.target ?? { kind: "working-tree" as const };
      const story = buildStory(parseGitDiff(loadDiff(options.repositoryPath, target)), options.repositoryPath, target);
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(story));
      return;
    }
    if (url.pathname === "/api/save" && req.method === "POST") {
      const target = options.target ?? { kind: "working-tree" as const };
      const story = buildStory(parseGitDiff(loadDiff(options.repositoryPath, target)), options.repositoryPath, target);
      saveStory(story);
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    if (url.pathname === "/api/export") {
      const target = options.target ?? { kind: "working-tree" as const };
      const story = buildStory(parseGitDiff(loadDiff(options.repositoryPath, target)), options.repositoryPath, target);
      res.setHeader("content-type", "text/markdown");
      res.end(exportStoryMarkdown(story));
      return;
    }
    res.setHeader("content-type", "text/html");
    res.end(readFileSync(new URL("../../../apps/web/src/index.html", import.meta.url), "utf8"));
  });
  server.listen(options.port);
  return server;
}
