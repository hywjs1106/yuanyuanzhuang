# Personal Terminal — implementation plan

User authorized direct implementation on 2026-10-14, skipping further design questions. Android; Velvet is the base. Remove games from the running application; retain bookkeeping and configurable AI; add weather, timed reminders and compact/full Chinese almanac. Visual detail is deferred.

## Decisions
- Work in the fresh dedicated clone, branch codex/endfield-assistant. No shared installation or existing user database is modified.
- A lightweight entry excludes the original growth store and game initialization. Reuse Velvet's LedgerEntry format, weather city lookup/current service and AI transport. Retain original source as reference, exclude original artwork from built public assets.
- New name: 暂名「日常终端」, applicationId com.qirui.dailyterminal, own geometric icon. No cloud account required.
- Store ledger/settings/reminders/notes/chat in dedicated Dexie database. Backup excludes API keys; restoring a backup preserves local credentials and validates the whole snapshot before one transaction.
- Birthday recurrence in first version is Gregorian. Almanac conversion and traditional daily Yi/Ji from lunar-javascript, with provenance; no invented AI auspiciousness.
- Weather selected by city, no automatic location permission. Current data + forecast + freshness and error states. Rain guidance uses forecast, not guesses from current weather; cached background forecast is labeled.
- Reminders have stable native IDs, one-time/daily/weekly/monthly/yearly patterns, complete/enable/edit/delete/snooze. Native scheduling must retain future start boundary, cancel removed schedules, and handle restart. Web preview displays its native-notification limitation.
- AI reuses Velvet chat transport; configurable OpenAI-compatible URL/model/key, confirmed structured ledger/reminder/note proposals, no automatic mutation, cancellation and errors. Unconfigured app remains usable manually.

## Tasks and boundaries
1. Data + bookkeeping + AI (root): `src/terminal/data.ts`, `ledger.ts`, `assistant.ts`, `SettingsPanel.tsx`, `LedgerPanel.tsx`, `AssistantPanel.tsx`. First write Node/tsx tests: invalid money/date rejected, totals exact, backup all-or-nothing, keys excluded, malformed AI drafts rejected. Then implement, run tests.
2. Reminders (implementer): `reminders.ts`, `reminderNotifications.ts`, `ReminderPanel.tsx`, `tests/reminders.test.ts`. Test calendar recurrence, leap years, past starts, cancellation/denial. Define a native scheduling boundary; first failing tests then implementation. Root stores reminder objects and supplies mutation callbacks.
3. Almanac + weather (implementer): `almanac.ts`, `AlmanacPanel.tsx`, `WeatherPanel.tsx`, `tests/almanac.test.ts`, `tests/weather.test.ts`. Root supplies weather config persistence callback. Test known CNY/term dates, invalid dates, current/forecast mapping and stale/error rendering boundaries.
4. APK environment (implementer): inspect existing Java/SDK first; configure dedicated official tooling locally if necessary. Own native identity/assets/build config; no changes to TS/package.json. Remove game widget/refresh services from active manifest. Reuse upstream namespace for Java compatibility but distinct application ID. Build after root web build/cap sync are ready.
5. Shell integration (root): `TerminalApp.tsx`, `terminal.css`, replace `main.tsx` with lightweight bootstrap; clean production Vite/public branding, keep license/source notices. Minimal industrial light/dark UI and usable phone navigation. Native notification startup/foreground reconciliation, error boundary and export/restore controls.
6. Verification: baseline build; all Node tests; TypeScript + Vite production; browser flow on phone viewport (persist/reload, edit ledger, repeat reminders, almanac browsing, AI response fixture + confirmation, backup/restore/error). Source and behavior review. Cap sync; APK debug build if environment permits. Do not claim real-device notification delivery without a connected device.

## Acceptance
No growth/tarot/battle/social runtime or artwork in the new app. Every requested feature has a reachable page and real persistence/service. Native notifications schedule through Android rather than an open webpage timer. Almanac works offline. Failures stay visible and do not erase local data. Deliver built output, APK when possible, concise verified limitations.
