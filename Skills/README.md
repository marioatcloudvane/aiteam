# Skills

Skills are procedures and domain knowledge read and executed inline by agents. They are not sub-agents — they do not have their own context or run independently. An agent reads a skill file and follows its procedure as part of its own work.

## Structure

```
Skills/
├── shared/                        # Team-agnostic skills, usable by any mode
│   ├── architecture-scanner.md    # Audits architectural health
│   ├── security-scanner.md        # Audits security posture
│   └── testing-scanner.md         # Audits test quality and coverage patterns
└── <team>/                        # Team-specific knowledge (conventions, preferences)
    └── rulebook.md                # Team/project rules consumed by scanners
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

## Adding a new scanner

1. Create `Skills/shared/<domain>-scanner.md` following the structure of the existing scanner files.
2. Add a matching section key to `Teams/rulebook.template.md`.
3. Add the scanner to the invocation table in `Modes/research/codebase-tour.md`.
4. Add it to the implement-orchestrator exit gate when that is fleshed out in step (b).
