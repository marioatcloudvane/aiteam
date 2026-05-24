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

### Privacy Manifest (`PrivacyInfo.xcprivacy`)

Apple requires a privacy manifest entry for every use of the following API categories. Missing entries cause App Store rejection.

| API category | Key | Triggered by |
|---|---|---|
| `UserDefaults` | `NSPrivacyAccessedAPICategoryUserDefaults` | Any `UserDefaults` read/write, `@AppStorage` |
| File timestamps | `NSPrivacyAccessedAPICategoryFileTimestamp` | `URLResourceValues`, `FileManager` attribute reads |
| System boot time | `NSPrivacyAccessedAPICategorySystemBootTime` | `ProcessInfo.systemUptime`, `mach_absolute_time()` |
| Disk space | `NSPrivacyAccessedAPICategoryDiskSpace` | `URLResourceValues.volumeAvailableCapacity` |
| Active keyboard | `NSPrivacyAccessedAPICategoryActiveKeyboards` | `UITextInputMode.activeInputModes` |

- **Flag if:** the feature reads or writes `UserDefaults` (including `@AppStorage`) → `NSPrivacyAccessedAPICategoryUserDefaults` entry required.
- **Flag if:** the feature reads file metadata or modification dates → `NSPrivacyAccessedAPICategoryFileTimestamp` entry required.
- **Flag if:** the feature uses `ProcessInfo.systemUptime` or timing APIs based on boot time → `NSPrivacyAccessedAPICategorySystemBootTime` entry required.
- **Flag if:** the feature checks available disk space → `NSPrivacyAccessedAPICategoryDiskSpace` entry required.

When flagging, specify the exact key and the code location that triggers it so the engineer can add the entry to `PrivacyInfo.xcprivacy` in the same task.

### Other App Store rules

- No downloading or executing dynamic code at runtime.
- **Flag if:** the feature adds new assets or frameworks exceeding ~5 MB → note the binary size impact on the App Store download size.

## SwiftUI State Management

Use `@Observable` (iOS 17+ / macOS 14+) for all reference-type state in new code. Do not introduce `ObservableObject`, `@StateObject`, `@ObservedObject`, or `@Published` in new code targeting these minimum versions.

| Pattern | When to use |
|---------|-------------|
| `@State var value = T()` | Value-type local state, OR an `@Observable` object created and owned by THIS view |
| `let model: MyModel` | An `@Observable` object passed in from a parent (no wrapper needed) |
| `@Environment(MyModel.self) var model` | An `@Observable` object injected at an ancestor via `.environment(model)` |
| `@Binding` | Two-way reference to a parent's `@State` value |
| `@AppStorage` | UserDefaults-backed scalar values |
| `@Query` | SwiftData queries (auto-updates when data changes) |

**`@Observable` rules:**
- Classes annotated `@Observable` do not use `@Published` — all stored properties are automatically tracked.
- Never store an `@Observable` object in `@State` in a child view when a parent or environment already owns it — this creates dual source of truth.
- `@MainActor` on the `@Observable` class ensures all mutations happen on the main thread.

**Legacy patterns (iOS 16 and earlier only):**
- `@StateObject` — reference-type state created and owned by this view
- `@ObservedObject` — reference-type state passed in from a parent
- `@EnvironmentObject` — app-wide shared state injected at root

If the project's minimum deployment target is iOS 16, use the legacy patterns. Flag the minimum deployment target in Architecture Notes so engineers know which pattern set applies.

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
