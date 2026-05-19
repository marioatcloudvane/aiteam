# Research Mode

Understand the problem before solving it.

| | |
|---|---|
| **Orchestrator** | `research-orchestrator` (see `orchestrator.md`) |
| **Entry** | New feature idea, vague problem, unknown domain. No prerequisite artifact. |
| **Output artifact** | `.aiteam/<feature-tag>/research/RESEARCH_BRIEF.md` *(or `FEATURE_SPEC.md` for user-facing work)* |
| **Detour rule** | Log finding & continue. Unknowns *are* the work. |
| **Exits to** | Plan mode (when the brief is approved), or back to the user. |

Specialist sub-agents are drawn from the roster at runtime by `modes: [research]` tag. See `orchestrator.md` for the full prompt.
