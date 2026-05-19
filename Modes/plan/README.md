# Plan Mode

Turn an approved research brief into a concrete plan.

| | |
|---|---|
| **Orchestrator** | `plan-orchestrator` (see `orchestrator.md`) |
| **Entry** | Approved `RESEARCH_BRIEF.md` (or `FEATURE_SPEC.md`) under the feature tag. |
| **Output artifact** | `.aiteam/<feature-tag>/plan/IMPLEMENTATION_PLAN.md` |
| **Detour rule** | Missing fact → sub-route to `research-orchestrator`, resume. Scope shift → ask user. |
| **Exits to** | Implement mode (when the plan is approved), or back to the user. |

Specialist sub-agents are drawn from the roster at runtime by `modes: [plan]` tag. See `orchestrator.md` for the full prompt.
