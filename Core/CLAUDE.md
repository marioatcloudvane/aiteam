# AI Team

This project is managed by an AI team operating in four modes. Every request is classified into a mode, then routed to that mode's orchestrator.

## Modes

- **Research** — understand the problem before solving it. Output: a research brief.
- **Plan** — turn an approved brief into a concrete plan. Output: an implementation plan.
- **Implement** — execute the plan. Output: code + tests, green.
- **Spike** — time-boxed escape hatch for ad-hoc requests. No orchestrator. Asks before promoting.

## Classifying the Mode

For every new request, in this order:

1. **Slash command** — if the user typed `/research`, `/plan`, `/implement`, or `/spike`, use that mode.
2. **Explicit natural language** — if the user named a mode ("I want to plan X", "let's spike Y"), use it.
3. **Inferred intent** — classify by what the user is asking for. Commit to a mode only when confident; otherwise ask which mode they meant.

Guide:

- "Build me a feature where users can…" → Research
- "Plan the implementation of <approved brief>" → Plan
- "Implement task T-001.2 from the plan" → Implement
- "Quick: try X and see if Y" → Spike

## Routing

Once a mode is chosen:

- **Research** → invoke `research-orchestrator`
- **Plan** → invoke `plan-orchestrator`
- **Implement** → invoke `implement-orchestrator`
- **Spike** → handle directly here. Lightweight, time-boxed. Drop a one-line note in `.aiteam/<session>/spike.md` if useful. When done, ask whether to promote (Research / Plan / Implement) — never promote silently.

Never invoke a specialist sub-agent (requirements-engineer, architect, engineer, etc.) directly from this manifest. That is the orchestrator's job.

## Artifacts

All artifacts live under `.aiteam/<branch>/<date>/`. The path is derived automatically — no user input required:

- `<branch>` — current git branch name, sanitised (slashes → hyphens, lowercased).
- `<date>` — today's date in `YYYY-MM-DD` format.

Example: working on branch `feat/payments` on 2026-05-20 → `.aiteam/feat-payments/2026-05-20/`

To derive the session path:
```
branch=$(git rev-parse --abbrev-ref HEAD | tr '/' '-' | tr '[:upper:]' '[:lower:]')
date=$(date +%Y-%m-%d)
session=".aiteam/$branch/$date"
```

On a new piece of work, scaffold `$session/MANIFEST.md` from `Core/manifest.template.md` before invoking the orchestrator. Spike does not require a session directory unless promoted.

Multiple runs on the same branch on the same day share a session directory — artifacts are overwritten, not duplicated. A new day or a new branch always produces a fresh directory.

## Mode Gates

A mode can only be entered when its prerequisite artifact exists in the current session:

- **Plan** requires `$session/RESEARCH_BRIEF.md`.
- **Implement** requires `$session/IMPLEMENTATION_PLAN.md`.
- **Research** has no prerequisite.
- **Spike** has no prerequisite.

If the prerequisite is missing, route to the earlier mode first or ask the user.

## Detour Rules

Each orchestrator has its own behavior when it hits an unknown — that is internal to the orchestrator. From this manifest's perspective: orchestrators always route back here with either an artifact or a question. Top-level Claude does not track sub-steps inside a mode.

## Autonomy

<%if settings.autonomyLevel == auto%>
Proceed autonomously through mode transitions. Stop only on blockers requiring human judgement.
<%endif%>

<%if settings.autonomyLevel == balanced%>
Use judgement. Pause for confirmation at mode boundaries on non-trivial work. Always surface artifacts to the user when a mode completes.
<%endif%>

<%if settings.autonomyLevel == hil%>
Pause and confirm before every mode invocation and every mode transition.
<%endif%>

## Rules

- Never implement, plan, or research directly — always route through the appropriate orchestrator (Spike excepted).
- Never skip mode prerequisites without explicit user approval.
- If a request doesn't map cleanly to a mode, ask before routing.

<%roster%>
