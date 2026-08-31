# Development Setup

## Preconditions

- The global Vite+ CLI, `vp`.
- A recent Pi release for local Extension testing.

## Setup

1. From the repository root, install the declared toolchain and dependencies:

   ```text
   vp install
   ```

2. Load the checkout as a temporary Pi Extension by passing its absolute path:

   ```text
   pi -e /absolute/path/to/pi-engineer
   ```

## Verification

Run the repository checks before handing off a change:

```text
vp run check
vp run test
```

Use `/pi-engineer status` in Pi to confirm that root prompt replacement is active for the current session.

## Failure Handling

Run `vp env doctor` when setup, runtime, or package-manager behavior is unexpected. Include its output when requesting help.
