---
type: development
status: active
---

# Release Procedure

This document defines how `pi-engineer` versions are proposed, accumulated, and published. Publishing runs through the existing [release workflow](../../../.github/workflows/release.yml) and never changes.

## Change Classification

| Change kind                                               | Examples                                                                        | Changeset required |
| --------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------ |
| User-visible behavior, prompt content, compatibility      | Portable Core update, Runtime Layer section change, supported Pi version change | Yes                |
| Documentation typo fix, CI adjustment, test-only refactor | README fixes, workflow tweaks, internal test restructuring                      | No                 |

Add a changeset from a branch with a version-bumping change:

```text
vp run changeset
```

Select `patch`, `minor`, or `major`, and describe the change for users. The changeset file (`.changeset/*.md`) is committed with the pull request. A pull request without a changeset simply does not trigger a version bump; no further action is needed.

## Versioning Flow

1. Merged changesets accumulate on `main`.
2. The [Version Packages workflow](../../../.github/workflows/version.yml) creates or updates one "Version Packages" pull request that bumps `package.json` and regenerates `CHANGELOG.md`.
3. Review the pull request, then merge it.
4. Tag and push the release:

   ```text
   git tag v<new-version>
   git push origin v<new-version>
   ```

5. The tag push triggers the release workflow, which runs checks and tests and publishes to npm through Vite+ (`vp pm publish --no-git-checks`) with GitHub Actions OIDC Trusted Publishing.
6. Create the GitHub Release manually, as in previous releases.

## Constraints

- Never publish outside the release workflow. Bare `npm publish` fails with `EBADDEVENGINES`, and bare `pnpm publish` fails because `pnpm` is not on `PATH` (established during the v0.1.0 release).
- The npm Trusted Publisher registration points at `release.yml` by filename; do not rename that workflow without updating npmjs.com settings.
- This repository is private, so npm provenance is not generated regardless of publishing method.
