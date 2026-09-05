# Repository Guidance

Guidance for AI coding agents working in this repository.

## Project Overview

`pi-engineer` is a Pi Package that replaces Pi's default system prompt with a portable software-engineering agent policy while preserving Pi's runtime-provided tools, project context, Skills, and additive instructions.

Before making product, architecture, or prompt-design decisions, read `docs/engineering/index.md` and follow its links to the relevant authoritative documents.

## Commands

This repository uses Vite+, a unified toolchain for runtime and package management, development, builds, tests, formatting, linting, and type checking through the global `vp` CLI. Use `vp <command>` for built-in commands and `vp run <name>` for scripts defined in `package.json` or tasks in `vite.config.ts`. Documentation is available locally at `node_modules/vite-plus/docs` and online at https://viteplus.dev/guide/.

- `vp install`: Install dependencies
- `vp run check`: Check formatting, linting, and types (`--fix` applies auto-fixes)
- `vp run test`: Run tests

Pi loads the TypeScript Extension source through jiti, so this package has no build step or generated distribution artifact.

## Git

- Format commit messages as Conventional Commits.
- Keep commit messages concise and searchable.
- Include the reason for a change in the commit body when useful.

## Issues and Pull Requests

- Format PR titles like commit messages so they are suitable for final squash commit titles.
- Keep issues and pull requests concise and searchable.
- Briefly summarize the main changes in PR descriptions and include the reason when useful.
- Add issue references, test notes, and breaking-change notes only when relevant.

## Documentation sources

When using Context7 `query-docs`, use:

- Pi: `/websites/pi_dev` or `/earendil-works/pi`
