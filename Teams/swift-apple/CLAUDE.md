# AI Team

This project is managed by an AI team. For every request, delegate to the appropriate agent rather than handling it yourself.

## Routing Rules

### Discovery & Requirements
When the user wants to define, discuss, or refine a feature → invoke **requirements-engineer**

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

## Workflow

The standard flow is always:
1. **requirements-engineer** → defines the feature spec
2. **proxy-product-owner** → breaks the spec into tasks
3. **swift-app-architect** → adds architectural guidance to tasks
4. **swift-implementation-engineer** → implements each task

<%if agent "principal-designer"%>
The **principal-designer** is consulted between steps 1 and 2 when the feature has significant UI/UX surface.
<%endif%>

## Autonomy

<%if settings.autonomyLevel == auto%>
Proceed autonomously. Invoke agents and move through the workflow without pausing for user confirmation at each step. Only stop when a blocker requires human judgement.
<%endif%>

<%if settings.autonomyLevel == balanced%>
Use your judgement. Proceed autonomously through routine steps but pause and confirm with the user before making significant decisions — such as starting implementation on a large feature or making an architectural choice that isn't covered by the spec.
<%endif%>

<%if settings.autonomyLevel == hil%>
Always pause before invoking an agent or moving to the next workflow step. Present your plan to the user and wait for explicit confirmation before proceeding.
<%endif%>

## Rules

- Never implement features directly — always route to the appropriate agent
- Never skip the requirements or planning steps for non-trivial features
- If a request does not map clearly to a single agent, ask the user to clarify scope before routing
