# Terminal 0.2 — game UI, bottom navigation, Zhuang Fangyi

User requested implementation refinements: strengthen Endfield in-game futuristic/technical styling; move page switching to bottom; give assistant Zhuang Fangyi personality using character and chapter2 sources. Previous direct implementation authorization persists. Work in existing dedicated branch; no schema migration or reset.

## Source and design decisions
- Inspected actual in-game hub screenshots saved outside the repo at ../references/game-main-menu.jpg and game-hub-menu.png. Adapt circular instrumentation, contours, segmented mechanical panels, yellow active states and cool communication accent to a portrait app. Create original CSS/SVG geometry; do not ship game screenshots as backgrounds.
- Provided fz.wiki character/story pages were fetched but return client-rendered shells; browser binding timed out. Character role, dispositions and voice patterns verified against warfarin.wiki and BWiki full transcripts. Never claim the whole second chapter was read. Do not invent omitted plot scenes; keep facts separate from roleplay adaptation.
- Five fixed bottom destinations: today, ledger, assistant, reminders, more. More opens an accessible bottom sheet for weather, almanac, notes, settings. Preserve shortcuts and all8pages; selected secondary page marks More active. Safe-area padding, keyboard avoidance, focus restoration, Escape/native Back dismissal, no double assistant instance.
- Persona: gentle, composed, intellectually practical, responsible but attentive to ordinary life; calls user 管理员 unless user asks otherwise; trust and restrained concern, not automatic romance or authoritarian productivity coaching. Ordinary conversation returns actions:[]; task proposals remain explicit and confirmed. Original examples are adapted writing, not official dialogue.
- Keep real-state status labels: local data, AI configured/offline, real date and reminder counts. No invented connection/latency coordinates.

## Work boundaries
1. Visual implementer: terminal.css, terminal-tokens.css, TerminalVisuals.tsx, BottomNavigation.tsx, design.md. Shared token system for dark and light,44px targets,320/375/414/768 widths, reduced motion. Publish component integration contracts. Do not touch root app/assistant/native data.
2. Persona implementer: persona.ts, assistant.ts, AssistantPanel.tsx, tests/persona.test.ts, associated source notes. Test full real outgoing prompt with stub transport, ordinary chat, confirmation contract, offline behavior and no invented capabilities. Preserve parseAssistantReply validation. No user data writes or package/native edits.
3. Root: integrate shell/bottom navigation/visual instrumentation, update phone browser tests for More helper while preserving existing flows. Test bottom reachability/focus, last-item clearance, composer focus and all prior functions. Sources research continues bounded read-only.
4. Verify all Node tests, mobile browser flows, screenshot captures light/dark + widths; fix bounded findings then confirm. Independent read-only review.
5. Update version0.2.0/versionCode2 same app ID/signing identity; rebuild web, cap sync, debug APK; verify actual manifest/signature and packaged asset hashes. No install or push to user's device without request. Deliver newAPK; advise in-place update keeps local data.

## Acceptance
Stronger coherent mechanical visual language across pages, real bottom navigation, recognizably warm/practical character voice in configured and limited offline modes, same confirmed-action semantics and local persistence. No regressions to reminder native patch, backups, dates or money. No unverified chapter2 claims; no claim voice cloning/audio was implemented.
