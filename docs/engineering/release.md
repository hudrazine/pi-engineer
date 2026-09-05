# npm Release Procedure

## Current Release State

`@hudrazine/pi-engineer@0.2.0`, Git tag `v0.2.0`, and its GitHub Release are published. Version 0.2.0 was the first Changesets-managed publication and carries npm provenance. Changesets owns subsequent package versions and `CHANGELOG.md` updates.

A push to `main` runs the [release workflow](../../.github/workflows/publish.yml), which creates or updates the release pull request, publishes an approved release, or exits without release work.

## Preconditions

- Work from a clean branch based on current `main`.
- Use the Node.js and pnpm versions declared in `package.json`.
- Do not edit `package.json` or `CHANGELOG.md` manually for a routine release.
- GitHub Actions must be allowed to create pull requests.
- The `npm-production` Environment must require review and permit deployments only from `main`.
- npm Trusted Publisher must identify repository `hudrazine/pi-engineer`, workflow `publish.yml`, Environment `npm-production`, and the `npm publish` action.
- Do not add an npm token. Publishing uses OIDC.

## Record A Release Intent

Follow the policy in [`.changeset/README.md`](../../.changeset/README.md).

1. For a user-visible package change, run `vp run changeset`.
2. Select the SemVer bump and write a concise user-facing summary.
3. Commit the generated `.changeset/*.md` file with the implementation pull request.
4. For documentation, CI, tests, or internal refactoring with no published behavior change, omit the changeset or use `vp run changeset --empty` when an explicit no-release record is useful.

## Review And Publish A Release

1. After changesets reach `main`, the workflow selects version mode and creates or updates `chore(release): version package`.
2. Review the version, consumed changesets, and `CHANGELOG.md`. If GitHub displays an approval banner for CI created by `GITHUB_TOKEN`, approve the workflow runs, then merge the release pull request after required checks pass.
3. The resulting `main` push selects publish mode. The read-only verification job runs `vp run check`, `vp run test`, and `vp pm pack -- --dry-run --json`.
4. Inspect the completed verification output, then explicitly approve the waiting `npm-production` deployment.
5. Only the approved publish job has `id-token: write`. It runs `vp run release`; `prepublishOnly` repeats check and test during publication.
6. Changesets publishes through npm Trusted Publisher, pushes `v<version>`, and creates the matching GitHub Release from the changelog entry.

## Verification

After publication:

1. Confirm that npm `latest` resolves to the release-pull-request version and that the public package carries provenance.
2. Confirm that the registry artifact contains only npm package metadata and documentation plus the `src` and `skills` trees selected by `package.json`. It must not contain tests, `docs/engineering`, local state, or generated output.
3. Confirm that the Git tag, GitHub Release, npm version, and `CHANGELOG.md` entry agree.
4. Install the exact registry version in a clean Pi package directory and confirm `/pi-engineer status` reports that prompt replacement is active.

The repository is public, so an OIDC publication of this public package is eligible for automatic npm provenance. Version 0.2.0 verifies this automated path. The earlier 0.1.0 artifact predates it and has no provenance attestation.

## Failure Handling

- If release-pull-request creation is denied, confirm that GitHub Actions may create pull requests; do not broaden unrelated workflow permissions.
- If Changesets fails with `spawn pnpm ENOENT`, confirm that the directory returned by `vp env which pnpm` is added to `PATH` in the Changesets job.
- If OIDC authentication fails, verify the exact repository, `publish.yml` filename, `npm-production` Environment, allowed npm action, GitHub-hosted runner, and `id-token: write` permission. Do not add an npm token as a fallback.
- Do not approve `npm-production` when verification or package-file inspection is incomplete.
- Published npm versions are immutable. Correct a bad artifact with a new patch version.
