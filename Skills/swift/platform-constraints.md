---
name: swift-platform-constraints
description: Identifies iOS/Swift-specific constraints relevant to a planned feature. Invoked by swift-app-architect during Plan mode's architect review. Returns findings inline as Architecture Notes bullets.
---

# Swift / iOS Platform Constraints

Read these constraints against the feature spec. For each constraint, determine whether it applies to the planned feature and produce a bullet for the Architecture Notes section.

## App Lifecycle

- Background execution is restricted: only explicitly declared background modes (audio, location, background fetch, remote notifications, VoIP) are permitted by the OS.
- `BGTaskScheduler` for deferrable background work — not a guarantee of execution time or frequency.
- Apps are suspended within seconds of going to background unless a background mode is active.
- **Flag if:** the feature requires work to complete while backgrounded → verify entitlement exists or redesign.

## Memory

- ARC handles reference counting, but closures capture `self` strongly by default — every completion handler or `async` closure referencing `self` needs `[weak self]` unless ownership is clear.
- Background apps can be silently terminated under memory pressure — critical unsaved state must not live only in memory.
- **Flag if:** the feature holds large in-memory collections (images, data buffers) → use `NSCache` with eviction policy or stream instead of buffering.

## Concurrency

- All UI updates must occur on `@MainActor` / main thread — no exceptions.
- Use Swift structured concurrency (`async`/`await`, `Task`, actors) for all new code. Do not introduce GCD in new code.
- Never call blocking APIs (file I/O, network, heavy computation) on the main thread.
- **Flag if:** the feature shares mutable state across concurrent tasks → needs an `actor`.
- **Flag if:** the feature mixes `async` and synchronous callback-based APIs → needs bridge via `withCheckedContinuation`.

## Persistence

| Need | Correct tool |
|------|-------------|
| Simple preferences | `UserDefaults` (values only; no large objects; no secrets) |
| Credentials / tokens | `Keychain` — never `UserDefaults` |
| Structured relational data | `SwiftData` (iOS 17+) or `CoreData` |
| Large files / media | File system — `Documents/` (user-visible) or `Caches/` (evictable) |
| Temporary scratch space | `tmp/` directory |

**Flag if:** the feature stores sensitive data → must use Keychain or encrypted storage.

## Networking

- `URLSession` is the standard — avoid third-party networking libraries unless already in the dependency list.
- Background uploads/downloads require `URLSession` with a background session configuration.
- **Flag if:** the feature downloads or uploads large files → needs background URL session with resume capability.
- **Flag if:** the feature connects to non-standard backends → evaluate certificate pinning.

## App Store Constraints

- A `PrivacyInfo.xcprivacy` privacy manifest entry is required for any API that accesses: file timestamps, `UserDefaults`, disk space, active keyboard, system boot time, or coarse location.
- No downloading or executing dynamic code at runtime.
- **Flag if:** the feature adds new assets or frameworks exceeding ~5 MB → note the binary size impact.
- **Flag if:** the feature uses any of the above privacy-sensitive APIs → manifest entry required.

## SwiftUI State Management

| Property wrapper | Use for |
|-----------------|---------|
| `@State` | Local, ephemeral, value-type state owned by this view |
| `@StateObject` | Reference-type state created and owned by this view |
| `@ObservedObject` | Reference-type state passed in from a parent |
| `@EnvironmentObject` | App-wide shared state injected at root |
| `@Binding` | Two-way reference to a parent's `@State` |

- Use `List` or `LazyVStack`/`LazyHStack` for unbounded collections — never `ForEach` in a plain `ScrollView` with large data sets.
- **Flag if:** the feature displays an unbounded list → must use a lazy container.

## Output

For each constraint that applies, add to the plan's Architecture Notes:

```
Platform: <constraint summary> — <specific implication for this feature>
```

For constraints that do not apply:

```
Platform: <constraint> — not applicable (<one-word reason>)
```
