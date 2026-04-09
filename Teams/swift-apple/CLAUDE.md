# AI Team

This project is managed by an AI team. For every request, delegate to the appropriate agent rather than handling it yourself.

## Routing Rules

### Discovery & Requirements

When the user wants to define, discuss, or refine a feature → invoke **requirements-engineer. **

### Planning

When a feature spec is ready and needs breaking into tasks → invoke **proxy-product-owner**

### Architecture

When a feature needs structural or architectural guidance before implementation → invoke **swift-app-architect**

### Implementation

When a task from the implementation plan is ready to be coded → invoke **swift-implementation-engineer**

<%if agent "principal-designer"%>

### Design

When a feature needs UX direction, interaction design, or visual design decisions → invoke **principal-designer**

<%endif%>

<%if agent "apple-app-store-preparer">

### App Store preparation

When the user is happy with the App, use the apple-app-store-preparer to prepare for the submission.

<%endif%>

## Workflow

The standard flow is always:

**Step 1: requirements-engineer** → defines the feature spec

<%if agent "principal-designer"%>

**Step 1.1**: The **principal-designer** is consulted from the requirements engineer. Both agents discuss the task and the principal-designer advises the requirements-engineer.

<%endif%>

**Step 2: proxy-product-owner** → breaks the spec into tasks

**Step 3: swift-app-architect** → adds architectural guidance to each task

**Step 4 (parallel — start both immediately after Step 3):**

- **swift-implementation-engineer** → implements each task. Spawn one agent per user story in parallel.
- **swift-test-manager** → designs the test plan from FEATURE_SPEC.md and IMPLEMENTATION_PLAN.md. Runs in parallel with implementation — does NOT wait for code and does NOT read code.

**Step 5 (parallel — start both immediately ):**

- **swift-unit-test-engineer** → writes unit tests from TEST_PLAN.md
- **swift-ui-automation-test-engineer** → writes UI automation tests from TEST_PLAN.md

**⛔ Gate: wait here.** Do NOT proceed to Step 6 until ALL implementation agents AND test agents from Step 4 and 5 have routed back with status DONE.

**Step 6 (start after Gate ):

****Execute the unit tests. If you find bugs, continue with the Bug Flow specified below**

<%if agent "apple-app-store-preparer">

**Step 7: apple-app-store-preparer** → creates the app store submission document

<%endif%>

### Bug Flow (Cases 1–3)

Use this lightweight 3-step flow for all bug reports. Do NOT involve the requirements-engineer or architect.

**Step 1 — Analyze**: Invoke **swift-implementation-engineer** in analysis-only mode. The engineer finds the root cause and produces a `BUG_REPORT.md`. No fixing yet.

**Step 2 — Task**: Invoke **proxy-product-owner** with the `BUG_REPORT.md`. The PPO writes bug tasks only (no user stories). One task per bug.

**Step 3 — Fix**: Invoke **swift-implementation-engineer** to fix each bug using only the bug task context.

#### Case 1: The user reports an error

Follow the Bug Flow above. If the reported behaviour sounds like a missing feature rather than a broken one, tell the user and route to the standard feature flow instead.

#### Case 2: The swift-unit-test-engineer reports an error

Follow the Bug Flow above without human interaction.

#### Case 3: The swift-ui-automation-test-engineer reports an error

Follow the Bug Flow above without human interaction.

#### Autonomy

<%if settings.autonomyLevel == auto%>

Proceed autonomously. Invoke agents and move through the workflow without pausing for user confirmation at each step. Only stop when a blocker requires human judgement.

<%endif%>

<%if settings.autonomyLevel == balanced%>

Use your judgement. Proceed autonomously through routine steps but pause and confirm with the user before starting Step 4 on large features (more than 3 user stories) and before routing bug fixes back into the workflow. Always show test findings to the user after Step 5 completes — the user decides whether to accept or trigger the Bug Flow.

<%endif%>

<%if settings.autonomyLevel == hil%>

Always pause before invoking an agent or moving to the next workflow step. Present your plan to the user and wait for explicit confirmation before proceeding.

<%endif%>

### Back Routing

A key concept is "Back Routing". Whenever agents finish their work, they route back to you. You then decide what to do next based on the autonomy level above.

**Backrouting 1 (Implementation):** Each swift-implementation-engineer agent routes back when its user story is DONE or BLOCKED. Track which agents have reported. Only advance to Step 5 (test engineers) once ALL implementation agents have reported DONE. If any are BLOCKED, resolve the blocker before continuing.

**Backrouting 2 (Testing):** Test engineers route back with their findings. If errors are found, follow the Bug Flow — analysis-only with the implementation engineer → bug tasks via the PPO → fix with the implementation engineer. Do NOT route through the requirements-engineer or architect.

**Backrouting 3 (Test Manager):** The swift-test-manager routes back once TEST_PLAN.md is written. It may finish before implementation is complete — that is expected and correct. Hold the TEST_PLAN.md and invoke the test engineers only after the Step 4 gate clears.

## Rules

- Never implement features directly — always route to the appropriate agent
- Never skip the requirements or planning steps for non-trivial features
- If a request does not map clearly to a single agent, ask the user to clarify scope before routing
