# AI Team Refactor — Workflow Sketch (in progress)

Working branch: `claude/ai-team-workflow-design-Laxi0`
Last touched: 2026-05-19

## Status

Workflow shape agreed. Step (a) scaffolding landed: new `Core/`, `Modes/`, `Skills/` directories; mode orchestrator skeletons (with frontmatter) under `Modes/<mode>/orchestrator.md`; team YAMLs updated with `modes: [...]` per agent and orchestrator entries; new top-level `Core/CLAUDE.md` mode-router template. Orchestrator prompt bodies are skeletons — flesh out in (b). Old `Teams/swift-apple/CLAUDE.md` and the workflow-tail boilerplate in existing agent files are still in place; removed in (c).

**Two follow-up questions open — resume at the bottom of this file.**

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

## Artifact layout

```
.aiteam/
├── <branch>/                       # sanitised git branch name (slashes → hyphens)
│   └── <date>/                     # YYYY-MM-DD — one directory per branch+day
│       ├── MANIFEST.md             # mode status + history for this session
│       ├── RESEARCH_BRIEF.md       # produced by research-orchestrator
│       ├── IMPLEMENTATION_PLAN.md  # produced by plan-orchestrator
│       ├── TEST_PLAN.md            # produced by test-manager (implement mode)
│       ├── notes.md                # detour findings, blockers, decisions
│       └── spike.md                # only if a spike was promoted
└── config.yaml                     # team config (autonomy level, rulebook path)
```

Session path is derived automatically — no user input:
```
branch=$(git rev-parse --abbrev-ref HEAD | tr '/' '-' | tr '[:upper:]' '[:lower:]')
date=$(date +%Y-%m-%d)
session=".aiteam/$branch/$date"
```

All artifacts for a session are flat inside the session directory — no mode-based sub-folders. Multiple runs on the same branch+day share the directory; a new branch or new day always produces a fresh one. Zero merge conflicts: different branches always produce different paths.

## Mapping today's agents to modes

| Today's agent | Mode |
|---|---|
| requirements-engineer, principal-designer | Research |
| proxy-product-owner, *-app-architect | Plan |
| *-test-manager, *-implementation-engineer, *-unit-test-engineer, *-ui-automation-test-engineer | Implement |
| *(new lightweight role)* | Spike |

Today's "Bug Flow" collapses into: small bugs → Spike; ambiguous/multi-bug → Research → Plan → Implement.

---

## What landed in (a)

- New `Core/` — `CLAUDE.md` (mode router), `manifest.template.md`, `config.template.yaml`.
- New `Modes/` — `research/`, `plan/`, `implement/` each with `orchestrator.md` (skeleton with frontmatter) + `README.md`; `spike/README.md` (no orchestrator, escape-hatch conventions).
- New `Skills/README.md` — placeholder, populated in (b).
- New `docs/modes.md` — user-facing documentation of the four modes.
- `Teams/swift-apple-team.yaml` and `Teams/python-saas-team.yaml` — `modes: [...]` per agent; orchestrator entries added; `claude_md:` now points to `Core/CLAUDE.md`.
- Design choices baked in: orchestrators are **real sub-agents** (decision B); `Support/` stays where it is with `modes:` as a list (so `principal-designer` can serve both Research and Plan).

## Still open — RESUME HERE

### b. Sub-agent + skill breakdown per mode
The original goal of this refactor. For each of Research, Plan, Implement: flesh out the orchestrator prompt bodies (currently skeletons), define the choreography between specialist sub-agents, decide what lives in `Skills/` and how team context is injected. This is also where the workflow tails currently embedded in existing agent prompts get stripped (since the orchestrator now owns workflow).

### c. Backwards compat / migration
The swift-apple team's existing `Teams/swift-apple/CLAUDE.md` is real prose people have read. Cut over and delete, or run both shapes for a release? Also covers updates to `Setup/src/claudemd.js` and `Setup/src/install.js` so the installer assembles the new shape (template `<%roster%>` injection into `Core/CLAUDE.md`, `.aiteam/` scaffolding on first run).
