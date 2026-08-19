# pi-engineer

`pi-engineer` is a Pi Package that replaces Pi's default root system prompt with a portable software-engineering policy. It preserves the tools, project context, Skills, and additional instructions resolved by Pi.

## Requirements

Pi `>=0.84.0`.

## Installation

Install the npm package with Pi:

```text
pi install npm:pi-engineer
```

## Usage

`pi-engineer` automatically replaces the root prompt for eligible agent runs. Check its current status with:

```text
/pi-engineer status
```

The command reports whether replacement is active, why it is inactive when applicable, and the Package and Portable Core versions. It does not expose prompt text or loaded project context.

## Customization and precedence

Use Pi's `APPEND_SYSTEM.md`, project instructions, or Skills for additional guidance. `pi-engineer` preserves these inputs in the assembled prompt.

An explicit custom root prompt configured through `SYSTEM.md`, `--system-prompt`, or a custom template takes precedence. When one is active, `pi-engineer` does not replace or merge it. In sessions with a UI, it emits one notification on the first affected agent run.

## Compatibility

`pi-engineer` uses only Pi's public Extension API and public prompt helpers. If another Extension directly rewrites the root prompt in `before_agent_start`, Extension load order affects the result. `pi-engineer` preserves Pi's structured prompt inputs, but it cannot preserve arbitrary direct prompt rewrites performed by other Extensions.
