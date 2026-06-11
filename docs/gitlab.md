# GitLab integration

Set `GITLAB_TOKEN` for the local Rearview app before importing or posting merge request data. OAuth and hosted secret storage are later options; the initial GitLab flow mirrors GitHub by using explicit local environment variables.

Rearview imports MR metadata, diffs, commits, discussions, and pipelines. Because GitLab does not have the same review submission model as GitHub, Rearview emits review-like summaries through supported merge request notes and discussions.
