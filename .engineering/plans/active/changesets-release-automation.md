---
type: plan
status: active
---

# Changesets Release Automation Plan

## Goal

Automate reviewable versioning, trusted npm publication, Git tags, and GitHub Releases while keeping publication behind explicit verification and `npm-production` approval.

## Current State

`@hudrazine/pi-engineer@0.1.0` was published through the previous tag-triggered OIDC workflow. Changesets already records release intent, but versioning and publication are split across manual tag and GitHub Release steps.

## Proposed Changes

Use one `main`-triggered `publish.yml` workflow to select no-op, version, or publish mode. Keep repository and pull-request permissions separate from OIDC publication, verify the package before deployment approval, and let Changesets create the tag and GitHub Release.

## Tasks

- [x] Add package scripts, changelog history, and the pull-request Changeset policy.
- [x] Replace the separate version and tag-release workflows with the mode-selecting release workflow.
- [x] Update the current release procedure and documentation index.
- [x] Verify checks, tests, package contents, workflow policy, and an isolated version simulation.
- [x] Enable GitHub Actions pull-request creation and configure the protected `npm-production` Environment.
- [ ] Verify on `main` that the workflow selects no release work and skips privileged jobs.
- [x] Record the user-managed npm Trusted Publisher migration to `publish.yml` before the next release.
- [ ] Archive this plan after the repository rollout and no-op workflow are verified.

## Completion Criteria

- User-visible pull requests carry release intent without manual version or changelog edits.
- A release pull request is created and checked before publication can become eligible.
- Only the approval-gated publish job receives OIDC permission.
- Routine publication creates matching npm metadata, Git tag, GitHub Release, and changelog content.
- The next real release can verify the first Changesets-managed publication without an artificial version bump during rollout.
