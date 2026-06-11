# GitHub integration

Set `GITHUB_TOKEN` for the local Rearview app before importing or posting pull request review data. OAuth is intentionally deferred; environment-variable auth keeps the local-first flow explicit while the integration matures.

Rearview imports PR metadata, diffs, commits, review comments, checks, and review state through the GitHub API. Structured comments are rendered as Markdown with embedded Rearview metadata comments so GitHub remains the source of record while Rearview can round-trip intent and severity.
