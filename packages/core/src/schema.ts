export type RiskLevel = "low" | "medium" | "high";
export type ReviewTargetKind = "working-tree" | "staged" | "branch" | "commit-range";

export interface ReviewTarget {
  kind: ReviewTargetKind;
  base?: string;
  head?: string;
  range?: string;
}

export interface DiffLine {
  kind: "context" | "add" | "delete";
  oldLine?: number;
  newLine?: number;
  content: string;
}

export interface DiffHunk {
  id: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  heading: string;
  lines: DiffLine[];
}

export interface ReviewFile {
  path: string;
  oldPath?: string;
  status: "added" | "modified" | "deleted" | "renamed" | "unknown";
  role: string;
  risk: RiskLevel;
  hunks: DiffHunk[];
  reviewed?: boolean;
  generated?: boolean;
}

export interface ReviewSection {
  id: string;
  title: string;
  purpose: string;
  guidance: string;
  risk: RiskLevel;
  files: ReviewFile[];
  reviewed?: boolean;
  dependsOn?: string[];
}

export interface ReviewStory {
  schemaVersion: 1;
  id: string;
  repositoryPath: string;
  target: ReviewTarget;
  title: string;
  summary: string;
  sections: ReviewSection[];
  createdAt: string;
  updatedAt: string;
}

export type CommentIntent = "issue" | "suggestion" | "question" | "praise" | "nit" | "blocker" | "note";
export type CommentSeverity = "info" | "low" | "medium" | "high" | "blocking";

export interface ReviewComment {
  id: string;
  intent: CommentIntent;
  severity: CommentSeverity;
  body: string;
  sectionId?: string;
  filePath?: string;
  hunkId?: string;
  line?: number;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
  author?: string;
}

export interface ReviewThread {
  id: string;
  subject: "review" | "section" | "file" | "hunk" | "line";
  comments: ReviewComment[];
  resolved: boolean;
}
