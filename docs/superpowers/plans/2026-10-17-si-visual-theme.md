# 祀画卷主题 Implementation Plan

> **For agentic workers:** Use executing-plans for this bounded addition. Preserve the working application and verify each behavior.

**Goal:** Add a persistent, reversible switch between the existing Fangyi industrial edition and a Si painting edition, and correct the header mascot using the supplied screenshot.

**Architecture:** Add optional visualTheme to the existing settings row; no database migration. Scoped CSS and a conditional home illustration reuse all existing functional pages. The selected edition controls appearance and assistant identity, while brightness stays independent. Optional message character tags preserve old chats as Fangyi and isolate new Si history.

**Tech Stack:** React, TypeScript, Dexie, CSS, Playwright.

**Spec:** User requests a switch button, existing edition retained, new edition inspired by 祀's painting powers. PRODUCT.md governs navigation and Android constraints.

## Global Constraints
- No APK, Gradle or native sync without explicit consent.
- Preserve existing records, keys, routes, notifications, assistant and Fangyi default.
- Both visual editions work in light/dark and 320px screens.
- Painting is decorative; it does not represent real weather, telemetry or game progress.

## Review Focus
- Old backups default to Fangyi; unsupported edition values cannot enter settings.
- Switching preserves pending settings drafts and stored records/credentials.
- Header switch, corner controls, navigation and composer remain visible and usable.
- New artwork never intercepts input; reduced-motion and hidden-page pauses work.
- Identity changes use the selected persona, abort pending requests and never relabel or send another character’s history.

## Tasks
1. Add failing unit tests for visual edition patch/backup compatibility and browser test for persistence/reversion/draft preservation.
2. Add validated transactional settings patch, header toggle and Settings choices; update only affected settings-form dependencies.
3. Add scoped Si tokens/materials, original painted home scene and shared-page styling. Preserve industrial edition. Correct mascot asset and document sources.
4. Run focused unit/browser verification, inspect 320/390px light/dark captures in one batch, fix concrete defects once, then full tests and web build. Obtain read-only review; commit locally.

Ruling: optional persona decision is pending; complete the independent visual edition first, keeping current chat identity truthful.

2026-10-17 user answer: switch both appearance and assistant identity. Add optional message.character; legacy messages belong to Fangyi. Filter histories per character, remount/abort requests on switching, keep shared life records and keys. Si uses its own portrait, prompt and honest offline responses; do not reuse Fangyi stickers as Si.

Verification: full unit suite 98 passed; themed screenshot batch includes 320/390px, light/dark, keyboard and four tools. Scoped review found a stale ordinary-settings write could undo character choice; fixed with an atomic save preserving the latest edition and a failing-then-passing regression. Targeted re-review resolved. Full browser/build results recorded at completion.

Final verification: 98/98 unit tests passed; web production build succeeded. Full browser run passed 53/54, with one new test's overly broad receipt selector matching both greeting and thinking rows; corrected the test selector, then all 4/4 edition browser cases passed, covering all 54 unique browser cases across the verification runs. Existing APK SHA256 remains 44CA682D71C962CD692A9AEF5298F24C1D9CAD285E320B40808ABE467DA43022. No native sync or APK build.
