# Future surfaces feasibility

## Chrome extension spike

A browser extension can add story overlays to provider pages without requiring a hosted Rearview service. The extension should not parse private repository contents in a remote context by default; it should request story data from the local server when the user explicitly connects a checkout.

## Hosted app spike

A hosted app may help teams share review stories, but the first feasibility milestone deliberately avoids selecting a cloud platform. Any hosted design must answer whether repository contents are cached, for how long, and with which user controls.

## Runtime boundaries

| Capability | Browser | Extension | Local server | Hosted service |
| --- | --- | --- | --- | --- |
| Render review story | Yes | Yes | Yes | Yes |
| Read local git diff | No | No | Yes | No |
| Store private tokens | No | Browser storage/OS broker | Environment or OS keychain | Secret store |
| Send AI context | User-approved preview only | User-approved preview only | User-approved preview only | Requires explicit repository-data policy |
| Sync provider comments | Via API token | Via provider page/API | Yes | Yes, if secrets are hosted |

## Authentication options

1. Environment variables for local-first development.
2. OS keychain storage for persistent local credentials.
3. OAuth for provider integrations once callback and token storage boundaries are clear.
4. Browser extension auth only for provider-page overlays.
5. Hosted secret storage only if a hosted app is explicitly chosen.

## Privacy review

Rearview should default to local processing. Any surface that sends repository contents, diffs, comments, or AI context outside the local machine must show a context preview, identify the recipient, and require explicit user action.
