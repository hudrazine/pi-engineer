# Changesets Release Automation Plan

## Goal

Automate reviewable versioning, trusted npm publication, Git tags, and GitHub Releases while keeping publication behind explicit verification and `npm-production` approval.

## Initial State

`@hudrazine/pi-engineer@0.1.0` was published through the previous tag-triggered OIDC workflow. Changesets already recorded release intent, but versioning and publication were split across manual tag and GitHub Release steps.

## Implemented Changes

One `main`-triggered `publish.yml` workflow now selects no-op, version, or publish mode. Repository and pull-request permissions remain separate from OIDC publication, the package is verified before deployment approval, and Changesets owns tags and GitHub Releases.

## Tasks

- [x] Add package scripts, changelog history, and the pull-request Changeset policy.
- [x] Replace the separate version and tag-release workflows with the mode-selecting release workflow.
- [x] Update the current release procedure and documentation index.
- [x] Verify checks, tests, package contents, workflow policy, and an isolated version simulation.
- [x] Enable GitHub Actions pull-request creation and configure the protected `npm-production` Environment.
- [x] Verify on `main` that the workflow selects no release work and skips privileged jobs.
- [x] Record the user-managed npm Trusted Publisher migration to `publish.yml` before the next release.
- [x] Archive this plan after the repository rollout and no-op workflow are verified.

## Outcome

The repository rollout completed through [PR #5](https://github.com/hudrazine/pi-engineer/pull/5). The first `main` run selected no release work and skipped the version, verification, and publish jobs as intended. At archival time, the first Changesets-managed publication was deliberately deferred until the next user-visible package change. Current publication state is owned by the [release procedure](../../release.md).
