# Spike Mode

The escape hatch. No orchestrator, no required artifacts, no specialist sub-agents. Top-level Claude handles a spike directly.

## When to use

- Quick experiments ("try X, see if Y").
- One-off fixes too small to justify a research/plan/implement run.
- Throwaway prototypes.
- Hotfixes where the path is obvious.

## Conventions

- **Time-box.** A spike is lightweight by definition. If it grows past a handful of steps or starts touching multiple files in non-obvious ways, stop and ask the user about promoting.
- **No silent promotion.** If a spike turns out to deserve real treatment (Research / Plan / Implement), **ask** the user: *"This is bigger than a spike. Should we hand it over to Research?"* Never just start a research/plan/implement run on its own.
- **Optional findings file.** If a spike produces a result worth keeping (a measurement, a finding, an answer), drop a one-line note in `.aiteam/<feature-tag>/spike/findings.md`. A feature tag is only needed if a findings file is being written or the spike is being promoted.
- **No MANIFEST entry** unless the spike is promoted. When promoted, the promotion creates the manifest as part of entering the new mode.

## What Spike never does

- Does not invoke `research-orchestrator`, `plan-orchestrator`, or `implement-orchestrator`.
- Does not produce a research brief or implementation plan.
- Does not run the specialist sub-agents.
