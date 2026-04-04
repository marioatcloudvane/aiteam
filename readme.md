# AI Team

**A real software team, powered by AI. Installed directly into your project.**

AI Team brings the structure of a professional software organization into your codebase. Instead of a single AI assistant answering questions, you get a coordinated team of specialized agents, each with a defined role, working together through a proven engineering workflow. The goal is maximum autonomy: from feature idea to tested, shipped code, with humans in the loop where it matters.

---

## Why AI Team?

Most AI coding tools help individuals write code faster. AI Team takes a different approach: it models how companies actually build software.

Real teams have requirements engineers, architects, developers, and testers. Each are focused on their domain, each handing off to the next. When that structure is applied to AI agents, the result is more thorough specs, better architecture decisions, and code that actually gets tested. Less "write me a function", more "ship me a feature."

---

## How It Works

When you install AI Team into a project, it writes a `CLAUDE.md` that acts as the team's operating manual. Claude Code reads this and routes every request through the right agent in the right order.

```
Feature Request
       │
       ▼
┌─────────────────────┐
│  Requirements       │  ← Defines the feature spec, clarifies scope
│  Engineer           │
└─────────┬───────────┘
          │  spec ready
          ▼
┌─────────────────────┐
│  (Principal         │  ← Optional: UX direction, interaction design
│   Designer)         │
└─────────┬───────────┘
          │  design notes
          ▼
┌─────────────────────┐
│  Proxy Product      │  ← Breaks spec into implementation tasks
│  Owner              │
└─────────┬───────────┘
          │  task list
          ▼
┌─────────────────────┐
│  Architect          │  ← Adds structural guidance to each task
└─────────┬───────────┘
          │  implementation plan
          ▼
┌─────────────────────┐
│  Implementation     │  ← Writes the code
│  Engineer           │
└─────────┬───────────┘
          │  code
          ▼
┌─────────────────────┐
│  Test Manager       │  ← Derives test cases from the spec
└──────┬──────────────┘
       │
   ┌───┴────────────────┐
   ▼                    ▼
┌──────────┐     ┌──────────────────┐
│  Unit    │     │  UI / Integration│
│  Tester  │     │  Test Engineer   │
└──────────┘     └──────────────────┘
```

---

## Key Features

- **Structured workflow:** agents hand off to each other in the same sequence an engineering team would follow, ensuring nothing gets skipped
- **Specialized roles:** each agent has a deep, focused prompt for its domain rather than a general-purpose assistant
- **Team configuration as code:** teams are defined in YAML, making them versionable, composable, and shareable
- **Model routing:** assign faster/cheaper models to lower-stakes roles (e.g. unit test writing) and powerful models to architecture and requirements
- **Templated CLAUDE.md generation:** installs a routing manifest into the target project so Claude Code knows the team and the workflow
- **Optional agents:** agents like the Principal Designer can be toggled on or off per project
- **Multi-model support:** works with different models in the future. We started with Claude (Anthropic)

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

Agent
Role

Requirements Engineer
Feature spec & scope definition

Proxy Product Owner
Task breakdown from spec

Swift App Architect
Structural & architectural guidance

Swift Implementation Engineer
Feature implementation

Swift Test Manager
Test case derivation from spec

Swift Unit Test Engineer
Unit test writing

Swift UI Automation Test Engineer
UI & integration test writing

Principal Designer (optional)
UX direction & interaction design

---

## Coming Soon

### Python SaaS Team `python-saas`

A full-stack team for **Python-based SaaS products** — FastAPI/Flask backends, database layers, modern web frontend.

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

**PRs are very welcome.** Adding a new team is as simple as writing a YAML file and a set of agent prompt files. Check the existing `swift-apple` team as a reference — the structure is intentionally simple so anyone can contribute.

For contributors: see the [Templating Reference](docs/templating.md) for how agent prompts and `CLAUDE.md` files are processed at install time — including conditional blocks, role resolution, model injection, and roster tags.

---

## License

Tbd;
