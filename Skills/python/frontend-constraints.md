---
name: frontend-constraints
description: React/TypeScript frontend rules for Python SaaS projects. Read by the architect and frontend engineer during Plan and Implement modes. Covers TypeScript configuration, component patterns, CSS conventions, state management, API integration, and testing expectations.
---

# Frontend Constraints — React / TypeScript

This skill documents the frontend standards for this project. Read APP_CONTEXT.md first — it tells you what is already in place. This skill defines the non-negotiable rules; APP_CONTEXT.md tells you the specific libraries and patterns already chosen.

---

## TypeScript

- **Strict mode is on.** `tsconfig.json` must have `"strict": true`. Do not relax this.
- **No `any`.** Use `unknown` and narrow, or define the proper type. `any` is a type error in this project's culture, even when the compiler allows it.
- **No `@ts-ignore` or `@ts-expect-error`** unless there is a genuine third-party bug with a comment explaining it.
- **Explicit return types** on all functions, hooks, and components. Let inference handle primitive local variables.
- **No implicit `any`** from untyped imports — add a `.d.ts` declaration or find a typed alternative.
- API response types must be explicitly defined interfaces, never inferred from `fetch` or `axios` calls.

---

## React

**Component model:**
- Functional components only. Class components are not used in this codebase.
- Every component goes in its own file. File name matches the component name exactly (`ProjectListView.tsx`, not `list.tsx`).
- Props interface is defined in the same file, above the component.
- Complex render logic is extracted into smaller subcomponents or custom hooks before the file exceeds ~150-200 lines.

**Hooks:**
- Business logic and data fetching go in custom hooks, not inside component bodies.
- Custom hooks go in a `hooks/` directory adjacent to the feature they serve, or in `src/hooks/` if shared.
- Never call a hook conditionally.
- `useEffect` dependency arrays must be complete — no eslint-disable for exhaustive-deps.

**State ownership:**
- Server state (data fetched from an API) is managed by the server state library in use (check APP_CONTEXT.md — typically React Query / TanStack Query).
- UI-local state (modal open/closed, input value, toggle) uses `useState`.
- Cross-component state that is not from the server uses the state management library in APP_CONTEXT.md (Zustand, Jotai, Redux Toolkit — check what's installed).
- Do not put server data into `useState`. Do not use the state management store for per-component UI state.

**Performance:**
- `React.memo`, `useCallback`, `useMemo` are applied when there is a measured or obvious performance problem. They are not applied by default.
- Avoid `AnyComponent as any` casts to work around type errors — fix the types instead.

---

## CSS Methodology

**Read `APP_CONTEXT.md` to determine which approach is in use for this project.** The three most common options:

### Tailwind CSS
- Use utility classes directly on JSX elements.
- No custom CSS for layout, spacing, or typography — use Tailwind's scale.
- Custom colors and tokens come from `tailwind.config.ts` — do not hardcode hex values.
- For complex conditional classes, use `clsx` or `cn()` utility (check that it's installed before using).

### CSS Modules
- One `.module.css` file per component, co-located in the same directory.
- Styles are imported as `import styles from './Component.module.css'`.
- Class names are camelCase in CSS Modules files.
- No global styles in module files except via `:global()` — used sparingly.

### Plain CSS / BEM
- Follow the existing BEM naming convention already in the project.
- One CSS file per feature area or component group.
- No inline styles except for values that are truly dynamic and cannot be expressed with classes.

**Common to all approaches:**
- No hardcoded pixel values for spacing or typography — use the project's scale or tokens.
- Responsive layout follows the breakpoints already defined in the project (check `tailwind.config.ts` or the CSS variables in `styles/tokens.css`).
- Dark mode support follows the approach already in the codebase — do not introduce a new mechanism.

---

## API Integration

- All HTTP calls go through the API client module (check APP_CONTEXT.md for the path — typically `src/api/client.ts` or `src/lib/api.ts`). Never call `fetch` or `axios` directly from a component or hook.
- API functions return typed responses. Define the response interface before writing the function.
- Every data-fetching hook exposes three states: loading, data (success), and error. Components must handle all three.
- API error responses are typed — do not let error handling use `catch (e: any)`.

---

## Accessibility

Non-negotiable. Apply to every component.

- All interactive elements (`button`, `input`, `select`, `a`) have accessible names. Use `aria-label` when the visible text is insufficient or absent (e.g., icon buttons).
- Use semantic HTML: `<button>` for actions, `<a>` for navigation with a URL, `<nav>` for navigation regions, `<main>` for the primary content, `<form>` for forms.
- Form inputs are associated with their labels via matching `htmlFor` and `id`.
- Focus management: when a modal opens, focus moves inside it. When it closes, focus returns to the trigger.
- Do not remove focus outlines without providing an equivalent visible focus indicator.

---

## Internationalisation

Check APP_CONTEXT.md for the i18n library in use (typically `react-i18next` or similar).

- No hardcoded user-facing strings. Every text visible to the user goes through the i18n function.
- Error messages, aria-labels, and placeholder text also need i18n treatment.
- If no i18n library is configured, raise this in the task report — do not silently ship hardcoded strings.

---

## Testing Expectations

The architect will decompose feature tasks into FE layer tasks. Expect test tasks with `Layer: FE` that cover:

- `python-saas-frontend-unit-test-engineer` handles: component render tests, hook logic tests, utility function tests. These use **Vitest + React Testing Library**.
- `python-saas-ui-test-engineer` handles: end-to-end browser flows using **Playwright**.

Frontend engineers do not write tests — they implement features. The test engineers write tests from the TEST_PLAN.md cases.

---

## File Structure Reference

Typical structure for a feature (verify against APP_CONTEXT.md for this project's convention):

```
src/
  features/
    projects/
      ProjectListView.tsx      # top-level route component
      ProjectCard.tsx          # subcomponent
      useProjectList.ts        # data-fetching hook
      projectsApi.ts           # API call functions
      types.ts                 # shared types for this feature
      index.ts                 # public exports
  hooks/                       # shared hooks used across features
  api/
    client.ts                  # base HTTP client
  components/                  # shared UI primitives (Button, Modal, etc.)
  styles/                      # global styles or tokens
```

If this project deviates from this structure, APP_CONTEXT.md will say so — follow it.
