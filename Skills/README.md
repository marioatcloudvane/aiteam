# Skills

Skills are procedures and domain knowledge read and executed inline by agents. They are not sub-agents — they do not have their own context or run independently. An agent reads a skill file and follows its procedure as part of its own work.

## Structure

```
Skills/
├── shared/                        # Team-agnostic skills, usable by any mode
│   ├── architecture-scanner.md    # Audits architectural health
│   ├── security-scanner.md        # Audits security posture
│   ├── testing-scanner.md         # Audits test quality and coverage patterns
│   └── task-decomposer.md         # Breaks a spec into tasks with types/dependencies/estimates
└── <team>/                        # Team-specific skills
│   ├── rulebook.md                # Team/project rules consumed by scanners
│   └── platform-constraints.md   # Platform-specific implementation constraints for Plan mode
```

Use `Teams/rulebook.template.md` as a starting point for a new team rulebook.

## Shared scanner skills

The three scanner skills are invoked by the `codebase-tour` agent during Research mode and by `implement-orchestrator` as exit gates during Implement mode. They share a common pattern:

1. Read the relevant section of the team rulebook (if present).
2. Fall back to generic best practices if no rulebook section exists.
3. Produce a structured findings table: ✅ compliant / ⚠️ concern / ❌ violation.

| Skill | Domain | Rulebook section |
|---|---|---|
| `architecture-scanner.md` | Structure, boundaries, abstractions, patterns | `architecture:` |
| `security-scanner.md` | Input validation, auth, secrets, data handling | `security:` |
| `testing-scanner.md` | Coverage shape, isolation, quality, conventions | `testing:` |

## Team rulebooks

A rulebook is a markdown file with one section per scanner domain. It lives at:

- `Teams/<team>/rulebook.md` — team-level rules (committed to this repo)
- `.aiteam/rulebook.md` — project-level overrides (committed to the project repo)

Project-level rules take precedence. If neither exists, scanners use generic best practices.

## Platform constraint skills

Platform constraint skills are invoked by the team's architect agent during Plan mode's architect review. They flag applicable constraints and return findings inline as Architecture Notes bullets — they write no files.

Each team has its own platform constraints file at `Skills/<team>/platform-constraints.md`. The plan orchestrator passes the correct path to the architect when invoking it.

Current platform constraint skills:

| Team | File | Platform |
|------|------|----------|
| swift | `Skills/swift/platform-constraints.md` | iOS / SwiftUI |
| python | `Skills/python/platform-constraints.md` | Python / backend |

## Task decomposer

`Skills/shared/task-decomposer.md` is invoked by the architect during Plan mode. It takes a confirmed feature spec and produces a task table with types, dependencies, and estimates. Returns inline — writes no files.

## Adding a new scanner

1. Create `Skills/shared/<domain>-scanner.md` following the structure of the existing scanner files.
2. Add a matching section key to `Teams/rulebook.template.md`.
3. Add the scanner to the invocation table in `Modes/research/codebase-tour.md`.
4. Add it to the implement-orchestrator exit gate when that is fleshed out in step (b).

## Adding a platform constraints skill

1. Create `Skills/<team>/platform-constraints.md` following the structure of `Skills/swift/platform-constraints.md`.
2. Update this README's platform constraints table above.
3. Ensure the team's architect agent references the skill by path.
