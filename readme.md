# AI Team

**A real software team, powered by AI. Installed directly into your project.**

AI Team brings the structure of a professional software organization into your codebase. Instead of a single AI assistant answering questions, you get a coordinated team of specialized agents, each with a defined role, working together through a proven engineering workflow. The goal is maximum autonomy: from feature idea to tested, shipped code, with humans in the loop where it matters.

---

## Why AI Team?

Most AI coding tools help individuals write code faster. AI Team takes a different approach: it models how companies actually build software.

Real teams research before they plan, plan before they build, and review and test what they ship. Requirements engineers, architects, developers, reviewers, and testers each focus on their domain and hand off to the next. When that structure is applied to AI agents, the result is more thorough specs, better architecture decisions, and code that actually gets reviewed and tested. Less "write me a function", more "ship me a feature."

---

## How It Works

When you install AI Team into a project, it writes a `CLAUDE.md` that acts as the team's operating manual. Every request is classified into one of **four modes**, and each mode (except Spike) is driven by its own orchestrator agent.

You can trigger a mode by typing `/research`, `/plan`, `/implement`, or `/spike` — the installed `CLAUDE.md` routes these to the right orchestrator. Or just describe what you want and the team will infer the mode.

```
 Feature idea                            Quick ad-hoc request
      │                                          │
      ▼                                          ▼
┌─────────────────────┐                 ┌─────────────────────┐
│  RESEARCH           │  /research      │  SPIKE              │  /spike
│  Understand the     │                 │  Escape hatch.      │
│  problem before     │                 │  No orchestrator,   │
│  solving it         │                 │  no prerequisites,  │
└──────────┬──────────┘                 │  no artifacts.      │
           │ RESEARCH_BRIEF.md          │  Asks before        │
           ▼                            │  promoting to a     │
┌─────────────────────┐                 │  full mode.         │
│  PLAN               │  /plan          └─────────────────────┘
│  Turn the approved  │
│  brief into a       │
│  concrete plan      │
└──────────┬──────────┘
           │ IMPLEMENTATION_PLAN.md
           ▼
┌─────────────────────┐
│  IMPLEMENT          │  /implement
│  Execute the plan   │
└──────────┬──────────┘
           │
           ▼
      code + tests
```

**Mode gates** keep the pipeline honest — each mode requires the artifact of the previous one:

| Mode      | Requires                 | Produces                 |
| --------- | ------------------------ | ------------------------ |
| Research  | nothing                  | `RESEARCH_BRIEF.md`      |
| Plan      | `RESEARCH_BRIEF.md`      | `IMPLEMENTATION_PLAN.md` |
| Implement | `IMPLEMENTATION_PLAN.md` | code + tests             |
| Spike     | nothing                  | nothing required         |

**Artifacts** live under `.aiteam/<branch>/<date>/<feature>/` — the path is derived from your git branch, today's date, and a feature slug you provide. Two features worked on in parallel never collide.

---

## Key Features

- **Four-mode workflow:** Research, Plan, and Implement form a gated pipeline; Spike is the escape hatch for quick ad-hoc work
- **Mode orchestrators:** each full mode is driven by a dedicated orchestrator that coordinates the right agents in the right order
- **Slash commands:** enter modes explicitly with `/research`, `/plan`, `/implement`, `/spike` — or let the team infer the mode from your request
- **Mode gates:** Plan won't start without a research brief, Implement won't start without a plan — nothing gets skipped
- **Branch-scoped artifacts:** all briefs and plans live under `.aiteam/<branch>/<date>/<feature>/`, so parallel work never collides
- **Specialized roles:** each agent has a deep, focused prompt for its domain — including dedicated code reviewers as part of every Implement run
- **Skills system:** procedures and domain knowledge that agents read inline (not sub-agents), including shared scanner skills used as exit gates
- **Team configuration as code:** teams are defined in YAML, making them versionable, composable, and shareable
- **Model routing:** assign faster/cheaper models to lower-stakes roles (e.g. unit test writing) and powerful models to architecture and requirements
- **Optional agents:** agents like the Principal Designer can be toggled on or off per project
- **Templated CLAUDE.md generation:** installs a routing manifest into the target project so Claude Code knows the team, the modes, and the workflow

---

## Installation

```
npx aiteam
```

Run this in any project directory. The CLI will ask which team to install, which optional agents to include, and then write the `CLAUDE.md` and agent files into your project.

---

## Supported Teams

### Swift Apple Team `swift-apple`

Full-stack team for **iOS, macOS, visionOS, and watchOS** applications.

| Agent                             | Role                                    | Modes               |
| --------------------------------- | --------------------------------------- | ------------------- |
| Research Orchestrator             | Coordinates Research mode               | research            |
| Plan Orchestrator                 | Coordinates Plan mode                   | plan                |
| Implement Orchestrator            | Coordinates Implement mode              | implement           |
| Codebase Tour                     | Guided walkthrough of the codebase      | research            |
| Requirements Engineer             | Feature spec & scope definition         | plan                |
| Proxy Product Owner               | Task breakdown from spec                | plan                |
| Swift App Architect               | Structural & architectural guidance     | plan                |
| Swift Implementation Engineer     | Feature implementation                  | implement           |
| Swift Code Reviewer               | Code review of implemented changes      | implement           |
| Swift Test Manager                | Test case derivation from spec          | implement           |
| Swift Unit Test Engineer          | Unit test writing                       | implement           |
| Swift UI Automation Test Engineer | UI & integration test writing           | implement           |
| App Context Updater               | Keeps the app context document current  | research, implement |
| Principal Designer (optional)     | UX direction & interaction design       | research, plan      |

### Python SaaS Team `python-saas`

Full-stack team for **Python-based SaaS products** — FastAPI/Flask backends, database layers, modern web frontend.

| Agent                                    | Role                                   | Modes               |
| ---------------------------------------- | -------------------------------------- | ------------------- |
| Research Orchestrator                    | Coordinates Research mode              | research            |
| Plan Orchestrator                        | Coordinates Plan mode                  | plan                |
| Implement Orchestrator                   | Coordinates Implement mode             | implement           |
| Codebase Tour                            | Guided walkthrough of the codebase     | research            |
| Requirements Engineer                    | Feature spec & scope definition        | plan                |
| Proxy Product Owner                      | Task breakdown from spec               | plan                |
| Python SaaS Architect                    | Structural & architectural guidance    | plan                |
| Python SaaS Implementation Engineer      | Backend implementation                 | implement           |
| Python SaaS Frontend Engineer            | Frontend implementation                | implement           |
| Python SaaS Code Reviewer                | Code review of implemented changes     | implement           |
| Python SaaS Test Manager                 | Test case derivation from spec         | implement           |
| Python SaaS Unit Test Engineer           | Backend unit test writing              | implement           |
| Python SaaS Frontend Unit Test Engineer  | Frontend unit test writing             | implement           |
| Python SaaS Integration Test Engineer    | Integration test writing               | implement           |
| Python SaaS UI Test Engineer             | UI test writing                        | implement           |
| App Context Updater                      | Keeps the app context document current | research, implement |
| Principal Designer (optional)            | UX direction & interaction design      | research, plan      |

---

## Skills

Skills are procedures and domain knowledge that agents read inline — they are not sub-agents and have no separate context.

- **Shared scanner skills** — used by the Codebase Tour in Research and as exit gates by the Implement Orchestrator: `architecture-scanner.md`, `security-scanner.md`, `testing-scanner.md`, `task-decomposer.md`, `environment-validator.md`, `app-context-updater.md`
- **Team-specific skills** — `platform-constraints.md` (Swift and Python), `python-performance-patterns.md`, `frontend-constraints.md`, `swift-snapshot-testing.md`

---

## Coming Soon

### On the roadmap

- **React / TypeScript frontend team**
- **Java / Spring backend team**
- **Go microservices team**
- **Android (Kotlin) team**
- **DevOps / Infrastructure team**
- **and many more!**

---

## We Need Your Help!

AI Team is built on the idea that great agent prompts are a community resource. If you have:

- Deep expertise in a language or framework
- A workflow pattern that works well with AI agents
- A new team or role you'd like to contribute

**PRs are very welcome.** Adding a new team is as simple as writing a YAML file and a set of agent prompt files. Check the existing `swift-apple` or `python-saas` teams as a reference — the structure is intentionally simple so anyone can contribute.

For contributors: see the [Templating Reference](docs/templating.md) for how agent prompts and `CLAUDE.md` files are processed at install time — including conditional blocks, role resolution, model injection, and roster tags.

---

## License

Tbd;
