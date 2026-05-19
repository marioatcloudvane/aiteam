# Skills

> **Status: placeholder.** Skills are populated in refactor step (b).

In the four-mode design, mode orchestrators (`research-orchestrator`, `plan-orchestrator`, `implement-orchestrator`) are **team-agnostic** — they encode the workflow, not the platform. Team-specific context (Swift conventions, Python conventions, framework quirks) flows into orchestrators via **Skills**.

Examples of what would live here:

- `swift-apple/codebase-conventions.md` — read by orchestrators when running on the Swift Apple Team.
- `python-saas/codebase-conventions.md` — same for Python SaaS.
- Mode-scoped skills shared across teams.

The exact shape, naming, and installation flow for skills is part of step (b) of the refactor (`docs/refactor-workflow.md`, question b).
