import { createId } from "./index.js";
import type { CommentIntent, CommentSeverity, ReviewComment, ReviewThread } from "./schema.js";

export interface NewCommentInput {
  body: string;
  intent?: CommentIntent;
  severity?: CommentSeverity;
  sectionId?: string;
  filePath?: string;
  hunkId?: string;
  line?: number;
  author?: string;
}

export function createComment(input: NewCommentInput): ReviewComment {
  const now = new Date().toISOString();
  return {
    id: createId("comment", `${input.filePath ?? input.sectionId ?? "review"}-${input.line ?? ""}-${input.body}`),
    intent: input.intent ?? "note",
    severity: input.severity ?? "info",
    body: input.body,
    sectionId: input.sectionId,
    filePath: input.filePath,
    hunkId: input.hunkId,
    line: input.line,
    resolved: false,
    createdAt: now,
    updatedAt: now,
    author: input.author
  };
}

export function createThread(comment: ReviewComment): ReviewThread {
  return {
    id: createId("thread", `${comment.filePath ?? comment.sectionId ?? "review"}-${comment.hunkId ?? comment.line ?? "top"}`),
    subject: comment.line ? "line" : comment.hunkId ? "hunk" : comment.filePath ? "file" : comment.sectionId ? "section" : "review",
    comments: [comment],
    resolved: comment.resolved
  };
}

export function renderCommentMarkdown(comment: ReviewComment): string {
  const metadata = Buffer.from(JSON.stringify({ rearview: { id: comment.id, intent: comment.intent, severity: comment.severity, sectionId: comment.sectionId, filePath: comment.filePath, hunkId: comment.hunkId, line: comment.line } })).toString("base64url");
  return `**${comment.intent}${comment.severity === "info" ? "" : ` · ${comment.severity}`}**\n\n${comment.body}\n\n<!-- rearview:${metadata} -->`;
}

export function parseCommentMarkdown(markdown: string): ReviewComment[] {
  const matches = markdown.matchAll(/<!--\s*rearview:([A-Za-z0-9_-]+)\s*-->/g);
  const comments: ReviewComment[] = [];
  for (const match of matches) {
    const parsed = JSON.parse(Buffer.from(match[1], "base64url").toString("utf8")) as { rearview: Partial<ReviewComment> };
    comments.push(createComment({
      body: markdown.slice(0, match.index).trim().replace(/^\*\*.*?\*\*\s*/, "").trim(),
      intent: parsed.rearview.intent,
      severity: parsed.rearview.severity,
      sectionId: parsed.rearview.sectionId,
      filePath: parsed.rearview.filePath,
      hunkId: parsed.rearview.hunkId,
      line: parsed.rearview.line
    }));
  }
  return comments;
}

export function resolveThread(thread: ReviewThread, resolved = true): ReviewThread {
  return { ...thread, resolved, comments: thread.comments.map((comment) => ({ ...comment, resolved, updatedAt: new Date().toISOString() })) };
}
