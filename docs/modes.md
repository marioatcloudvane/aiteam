# The Four Modes

AI Team always operates in one of four modes. The mode determines who's involved, what artifact is produced, and how detours are handled.

```
        ┌────────── user request ──────────┐
        │                                  │
        ▼                                  ▼
   ┌──────────┐                       ┌──────────┐
   │ Research │ ──► Plan ──► Implement│  Spike   │
   └──────────┘                       └──────────┘
        ▲                                  │
        └────── promote (asks first) ──────┘
```

| Mode | Purpose | Orchestrator | Output |
|---|---|---|---|
| **Research** | Understand the problem before solving it. | `research-orchestrator` | `RESEARCH_BRIEF.md` (or `FEATURE_SPEC.md`) |
| **Plan** | Turn an approved brief into a concrete plan. | `plan-orchestrator` | `IMPLEMENTATION_PLAN.md` |
| **Implement** | Execute the plan: code + tests, green. | `implement-orchestrator` | Code + `TEST_PLAN.md` + green tests |
| **Spike** | Time-boxed escape hatch for ad-hoc requests. | *(none — handled directly)* | Optional `findings.md` |

## How a mode is chosen

For every new request, the top-level Claude (reading the project's `CLAUDE.md`) classifies the mode in this order:

1. **Slash command** — `/research`, `/plan`, `/implement`, `/spike`.
2. **Explicit natural language** — "I want to plan X", "let's spike Y".
3. **Inferred intent** — only if confident. Otherwise asks.

## Per-mode detour behavior

| Mode | On unknown | Why |
|---|---|---|
| Research | Log finding & continue | Unknowns are the work. |
| Plan | Sub-route to Research, resume | Plan needs facts; user doesn't need to be in the loop for fact-finding. |
| Implement | Pause & ask the user | A workflow-level unknown here means the plan was wrong or scope shifted — that's a human call. (Code-level unknowns are not detours — engineers resolve them themselves.) |
| Spike | n/a — promotion is the detour | Always asks before promoting. |

## Artifacts

All artifacts live under `.aiteam/<feature-tag>/`. The feature-tag scheme is configured in `.aiteam/config.yaml` (`semver`, `ticket`, `slug`, `date`, or `custom`). Each feature has a `MANIFEST.md` linking the modes that have run.

```
.aiteam/
├── <feature-tag>/
│   ├── MANIFEST.md
│   ├── research/RESEARCH_BRIEF.md
│   ├── plan/IMPLEMENTATION_PLAN.md
│   ├── implement/{TEST_PLAN.md, notes.md}
│   └── spike/findings.md           # only if a spike was promoted from here
└── config.yaml
```

## Mode gates

A mode can only be entered when its prerequisite artifact exists:

- **Plan** requires the research artifact.
- **Implement** requires the plan artifact.
- **Research** and **Spike** have no prerequisite.

The top-level dispatcher enforces these. If a prerequisite is missing, it routes to the earlier mode (or asks the user) rather than letting an orchestrator start with an incomplete handoff.

## Where this is implemented

- `Core/CLAUDE.md` — top-level mode router, installed into each project as `.claude/CLAUDE.md`.
- `Modes/<mode>/orchestrator.md` — installed as `.claude/agents/<mode>-orchestrator.md`.
- `Modes/spike/README.md` — conventions only; Spike has no orchestrator.
- `Teams/<team>-team.yaml` — declares team agents with `modes: [...]` tags. Orchestrators read the installed `AGENT_ROSTER.md` at runtime to find specialists for their mode.
