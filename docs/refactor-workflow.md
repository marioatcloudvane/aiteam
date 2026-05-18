# AI Team Refactor — Workflow Sketch (in progress)

Working branch: `claude/ai-team-workflow-design-Laxi0`
Last touched: 2026-05-18

## Status

Workflow shape agreed. Implementation not started.
**Three follow-up questions open — resume at the bottom of this file.**

---

## Locked decisions

| # | Decision |
|---|---|
| 1 | Four modes: **Research / Plan / Implement / Spike** |
| 2 | Spike is an escape-hatch (no orchestrator), parallel to the pipeline, always asks before promoting |
| 3 | Mode dispatch: Claude classifies when confident; user can override via slash commands (`/research`, `/plan`, `/implement`, `/spike`) **and** natural language |
| 4 | Mode is defined by *when in the workflow* an agent runs, not by the verb in its title |
| 5 | Test Manager stays in Implement mode (parallel with engineers, as today) |
| 6 | Mode orchestrators are shared across teams; team-specific context comes in via skills |
| 7 | Per-mode detour behavior (see table below) |
| 8 | Artifacts live in `.aiteam/<feature-tag>/<mode>/`, with `MANIFEST.md` linking them |
| 9 | Feature-tag scheme is configurable (semver / ticket / slug / date / custom) |

## Per-mode detour behavior

| Mode | On unknown / missing info | Notes |
|---|---|---|
| Research | Log finding & continue | Unknowns are the work. |
| Plan | Sub-route to Research, resume | Plan needs facts; user not in the loop for fact-finding. |
| Implement | Pause & ask the user | Only for *workflow* unknowns (scope shift, missing decision) — not "which file has this util". |
| Spike | n/a — promotion *is* the detour | Always asks before promoting. |

## Flow

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

## Proposed artifact layout

```
.aiteam/
├── <feature-tag>/                  # e.g. v1.2.0, PROJ-123, user-profile, 2026-05-18
│   ├── MANIFEST.md                 # status, links, mode history
│   ├── research/
│   │   └── RESEARCH_BRIEF.md       # or FEATURE_SPEC.md for user-facing work
│   ├── plan/
│   │   └── IMPLEMENTATION_PLAN.md  # arch + tasks
│   ├── implement/
│   │   ├── TEST_PLAN.md            # written by test-manager in parallel
│   │   └── notes.md                # detour findings, blockers, decisions
│   └── spike/                      # only if a spike was promoted from here
│       └── findings.md
└── config.yaml                     # team config + tagging scheme
```

`.aiteam/config.yaml` sketch:

```yaml
tagging:
  scheme: semver       # semver | ticket | slug | date | custom
  prefix: ""           # optional, e.g. "v" or "PROJ-"
  ask_on_start: true   # prompt for tag at the start of each new piece of work
```

## Mapping today's agents to modes

| Today's agent | Mode |
|---|---|
| requirements-engineer, principal-designer | Research |
| proxy-product-owner, *-app-architect | Plan |
| *-test-manager, *-implementation-engineer, *-unit-test-engineer, *-ui-automation-test-engineer | Implement |
| *(new lightweight role)* | Spike |

Today's "Bug Flow" collapses into: small bugs → Spike; ambiguous/multi-bug → Research → Plan → Implement.

---

## Open questions — RESUME HERE

### a. Repo file/folder refactor
What moves where? Proposal: introduce a new `Modes/` directory holding the shared mode orchestrators. `Teams/` shrinks now that workflow logic leaves the team YAML. New `CLAUDE.md` template becomes a mode router rather than a feature pipeline. Concrete file diff still to draft.

### b. Sub-agent + skill breakdown per mode
The original goal of this refactor. For each of Research, Plan, Implement: which sub-agents, which skills, and how team context plugs in via skills.

### c. Backwards compat / migration
The swift-apple team's existing `CLAUDE.md` is real prose people have read. Cut over, or run both shapes for a release?
