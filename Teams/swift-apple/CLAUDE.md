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

**⛔ Implementation Gate: wait here.** Do NOT proceed to Step 4.5 until ALL swift-implementation-engineer agents have reported DONE. The swift-test-manager may finish earlier — hold its TEST_PLAN.md until the implementation gate clears.

**Step 4.5: swift-code-reviewer** → runs after the implementation gate, before test engineers are invoked.

- Input: all task reports from Step 4 (listing files created/modified) + IMPLEMENTATION_PLAN.md (architectural hints).
- Output: `$session/CODE_REVIEW.md` with findings classified as BLOCKING or ADVISORY.
- **BLOCKING findings**: route each finding to the responsible engineer for a fix, then re-review the affected files. Repeat until clear (max 2 cycles). Do not invoke test engineers until all BLOCKING findings are resolved.
- **ADVISORY_ONLY or CLEAN**: append advisories to `$session/notes.md` and proceed to Step 5.

**Step 5 (parallel — start both immediately after Step 4.5 clears):**

- **swift-unit-test-engineer** → writes unit tests from the Unit Test Cases section of TEST_PLAN.md.
- **swift-ui-automation-test-engineer** → writes UI automation tests from the UI Automation Test Cases section of TEST_PLAN.md.

**⛔ Test Writing Gate: wait here.** Do NOT proceed to Step 6 until ALL test engineers from Step 5 have routed back with status DONE.

**Step 6 (start after Test Writing Gate):**

**Execute the unit tests. If you find bugs, continue with the Bug Flow specified below.**

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

### Back Routing

A key concept is "Back Routing". Whenever agents finish their work, they route back to you.

**Backrouting 1 (Implementation):** Each swift-implementation-engineer agent routes back when its user story is DONE or BLOCKED. Track which agents have reported. Only advance to Step 4.5 (code review) once ALL implementation agents have reported DONE. If any are BLOCKED, resolve the blocker before continuing.

**Backrouting 2 (Code Review):** The swift-code-reviewer routes back with a verdict (BLOCKING / ADVISORY_ONLY / CLEAN). BLOCKING findings go back to the responsible engineers for fixes before test engineers are invoked. ADVISORY findings are appended to notes.md and do not block progress.

**Backrouting 3 (Test Engineers):** Test engineers route back with their findings. If errors are found, follow the Bug Flow — analysis-only with the implementation engineer → bug tasks via the PPO → fix with the implementation engineer. Do NOT route through the requirements-engineer or architect.

**Backrouting 4 (Test Manager):** The swift-test-manager routes back once TEST_PLAN.md is written. It may finish before implementation is complete — that is expected and correct. Hold the TEST_PLAN.md and invoke test engineers only after Step 4.5 (code review) clears.

## Rules

- Never implement features directly — always route to the appropriate agent
- Never skip the requirements or planning steps for non-trivial features
- If a request does not map clearly to a single agent, ask the user to clarify scope before routing
