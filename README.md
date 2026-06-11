# Rearview

Rearview is a local-first, story-oriented code review tool. It turns a git diff into a reviewer-friendly narrative so reviewers can move through a change by concept instead of filesystem order.

## Requirements

- Node.js 24 or newer
- npm 11 or newer
- git

## Install dependencies

```sh
npm install
```

The project intentionally has a small dependency surface:

- `typescript` builds the TypeScript source.
- `@types/node` provides Node.js type definitions for local development and CI.

## Common commands

```sh
npm run build
```

Compiles the TypeScript monorepo into `dist/`.

```sh
npm test
```

Runs the TypeScript build and then executes the Node.js test runner against the compiled tests.

```sh
npm run cli -- help
```

Builds the project and prints the Rearview CLI commands.

```sh
npm run story
```

Builds the project and prints a JSON review story for the current working-tree diff.

```sh
npm run export -- .rearview/review.md
```

Builds the project and writes a Markdown review summary for the current working-tree diff.

```sh
npm run serve -- 4173
```

Builds the project and starts the local web UI at `http://localhost:4173`.

## Local review workflow

1. Make changes in a git repository.
2. Run `npm run story` to inspect the generated review story as JSON.
3. Run `npm run export -- .rearview/review.md` to save a Markdown review summary.
4. Run `npm run serve -- 4173` to browse the story outline, sections, files, and expandable diffs locally.

Use `-- --staged` with CLI-backed scripts when you want to review staged changes instead of the full working tree. For example:

```sh
npm run story -- --staged
```

## Metadata

Rearview stores local review metadata under `.rearview/`. The default persisted story path is `.rearview/review.json`; commit it only when your team intentionally wants to share that review state.
