---
name: swift-snapshot-testing
description: Guidance for snapshot testing in Swift Apple apps using swift-snapshot-testing (Point-Free). Read by the test manager when deciding coverage strategy for UI-heavy features. Describes when to use snapshots, how to structure them, and what the snapshot test engineer produces.
---

# Swift Snapshot Testing

Snapshot tests capture a rendered view as a reference artifact (image or string) and fail when the rendering changes unexpectedly. They catch visual regressions that XCTest unit tests and XCUITest UI automation tests cannot — layout shifts, color changes, Dynamic Type breakage, and Dark Mode inconsistencies.

**Library:** [swift-snapshot-testing](https://github.com/pointfreeco/swift-snapshot-testing) by Point-Free. This is the standard for Swift snapshot testing.

---

## When to use snapshot tests

The test manager should recommend snapshot tests for features where:

- **Custom layout components** are introduced — card views, custom cells, complex headers, grid layouts. A unit test cannot verify the layout renders correctly; an XCUITest cannot efficiently cover every size class.
- **Multi-platform views** exist — the same SwiftUI view rendered on iPhone, iPad, and macOS may look correct on one and broken on another. Snapshots cover this systematically.
- **Dynamic Type compliance** is required — snapshot at the largest accessibility text size to verify no clipping or overlap.
- **Dark Mode support** — snapshot in both `.light` and `.dark` color schemes.
- **Empty / error / loading states** — these are often visually distinct and regression-prone. One snapshot per state.

Do NOT recommend snapshots for:
- Logic-only components with no visual output
- Screens that are purely data-driven with no custom layout
- Features where the XCUITest UI automation already provides sufficient visual confidence

---

## Snapshot strategies

The library supports multiple rendering strategies:

```swift
// Image snapshot — full visual render
assertSnapshot(of: MyView(), as: .image(layout: .device(config: .iPhone15Pro)))

// Image with specific size
assertSnapshot(of: MyView(), as: .image(layout: .fixed(width: 375, height: 200)))

// Image in Dark Mode
assertSnapshot(of: MyView().preferredColorScheme(.dark),
               as: .image(layout: .device(config: .iPhone15Pro)),
               named: "dark")

// String snapshot — for non-visual components, accessibility trees
assertSnapshot(of: MyView(), as: .accessibilityElements)
```

---

## Device configurations to cover

For each new screen-level view, the test manager should specify which configurations the snapshot test engineer must cover:

| Configuration | When required |
|---|---|
| `.iPhone15Pro` | Always for iPhone-primary views |
| `.iPadPro11` | When the feature has an iPad layout variant |
| `.Mac` | When targeting macOS |
| Dynamic Type `.accessibilityXXXL` | When the view uses custom text layout |
| Dark Mode | Always when using semantic colors or custom color assets |

---

## What the snapshot test engineer produces

The test manager routes snapshot test cases to a **`swift-snapshot-test-engineer`** agent (if rostered) or includes them in the unit test engineer's scope as a named section.

Each snapshot test case in TEST_PLAN.md should follow this format:

```
#### ST-001: [View name] — [device/condition]
**Target:** `Features/Projects/Views/ProjectCardView`
**Configurations:**
  - iPhone 15 Pro, light mode
  - iPhone 15 Pro, dark mode
  - iPhone 15 Pro, Dynamic Type XXL
**States to snapshot:**
  - Active project (name: "Q4 Campaign", status badge: "Active")
  - Draft project (name: "New Project", status badge: "Draft")
  - Long name (truncation behaviour)
**Priority:** MEDIUM
**Traces to:** US-001 AC-5 (card displays project correctly)
```

---

## File structure

```
Tests/
├── SnapshotTests/
│   ├── Features/
│   │   ├── Projects/
│   │   │   ├── ProjectCardViewSnapshotTests.swift
│   │   │   └── ProjectListViewSnapshotTests.swift
│   │   └── Settings/
│   └── __Snapshots__/               # Auto-generated reference images
│       ├── Projects/
│       │   ├── ProjectCardView.iPhone15Pro.png
│       │   ├── ProjectCardView.iPhone15Pro.dark.png
│       │   └── ProjectCardView.XXL.png
│       └── Settings/
```

**Rules:**
- `__Snapshots__/` is committed to source control — it is the reference.
- Run `assertSnapshot(of:, as:, record: true)` once to generate the reference, then set `record: false` (or remove the parameter) for CI.
- Never commit snapshots generated on a different machine or Xcode version without team agreement — rendering differs between OS versions.
- Snapshot tests live in a separate test target from unit tests. They are slower and require a simulator.

---

## Updating snapshots

When a visual change is intentional (design update, new branding):

1. Set `record: true` in the relevant test, run once to regenerate.
2. Visually inspect the new reference image before committing.
3. Set `record: false`, commit both the code change and the new reference image together.

A snapshot failure on CI without a corresponding code change is a regression — investigate before updating.

---

## Integration with the test plan

The test manager includes a `## Snapshot Test Cases` section in TEST_PLAN.md when snapshot coverage is warranted. If no `swift-snapshot-test-engineer` is rostered, these cases are assigned to `swift-unit-test-engineer` with a note that they require the swift-snapshot-testing package.
