# Implement Mode

Execute the plan. Ship working code with green tests.

| | |
|---|---|
| **Orchestrator** | `implement-orchestrator` (see `orchestrator.md`) |
| **Entry** | Approved `IMPLEMENTATION_PLAN.md` under the feature tag. |
| **Output artifacts** | Code committed; `TEST_PLAN.md` and `notes.md` under `.aiteam/<feature-tag>/implement/`. |
| **Detour rule** | Code-level unknown → engineer resolves. Workflow unknown (scope/decision/plan-was-wrong) → pause and ask the user. |
| **Exits to** | User confirmation that the feature is done. |

Specialist sub-agents are drawn from the roster at runtime by `modes: [implement]` tag. See `orchestrator.md` for the full prompt — exact parallelization and bug-flow handling will be detailed in step (b) of the refactor.
