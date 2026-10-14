# 日常终端 · Endfield functional panels

The user pinned Arknights: Endfield as the visual world and rejected the previous generic grey industrial treatment. This redesign preserves the existing local data, forms, page destinations, assistant confirmation behavior and notification behavior. The application is an everyday tool in Operate mode; real information stays ahead of decoration.

## Reference evidence

- Supplied `references/game-main-menu.jpg` and `references/game-hub-menu.png`: large pale functional planes against carbon, yellow action plates, bold legible amounts, displaced panel corners and clear selected modules.
- [Wanye-7300/baker-dx](https://github.com/Wanye-7300/baker-dx), including the locally reviewed `references/baker-preview.png`: an actual character portrait anchors the conversation; the contact/header rail and message plane are distinct regions. The chat surface follows that composition rather than a generic assistant card.
- [VBeatDead/ReEnd-Components](https://github.com/VBeatDead/ReEnd-Components): tactical panel corner and geometric frame vocabulary, adapted as original CSS rather than copying project assets.
- [Yue-plus/astro-endfield](https://github.com/Yue-plus/astro-endfield): Endfield website reference for a crisp black, offwhite and yellow hierarchy.

Game character imagery, when present, is a verified source asset rather than a recreated SVG person. The header uses an original geometric sigil rather than the official logo. No fictional coordinates, latency, service connection status or operational metrics are introduced.

## Direction contract

The first viewport is a calendar masthead, a dark portrait conversation rail and a ledger plane. Today's real date is oversize and the overview heading stays upright and direct. The 64px portrait and greeting lead straight into the assistant. Monthly expense is the dominant real figure; budget remaining or balance is secondary. The cut-corner yellow record plate names its action. Upcoming reminders are simple ruled rows and weather is a light horizontal function rail, with any stale-data notice or error below its main line. There is no repeated boxed card hero or decorative circular instrument in the overview.

Across the application, pale flat working surfaces use restrained broken corner geometry and top rules. Nested forms remain open divided regions. Dark mode uses deep green charcoal rather than washed-out grey. Selected bottom navigation is a solid yellow module with a cut corner, large enough to carry the entire active destination. Cyan is reserved for conversation affordances where the dedicated chat surface uses it. Yellow marks working selection and primary action.

## Tokens and typography

`src/terminal/terminal-tokens.css` owns shared semantic colors, fonts and timing. Palette roles cover base, paper, panel-end, paper-2, paper-3, ink, ink-2, rule, rule-strong, accent, accent-ink, focus, communication, error, success, overlay, shadow, clear, glass, topography, carbon, on-carbon and on-carbon-muted. Dark mode overrides these through `data-terminal-theme="dark"`. The portrait rail retains high-contrast carbon and pale text in both themes.

The bundled OFL Terminal Sans Chinese font carries body and display typography, with installed platform fallbacks. No external font request is made. Chinese headings use substantial weight, amounts and dates use tabular numbers, status copy stays at 11px, ordinary content uses 13–15px. Monospace is available only for meaningful measurement or code and does not costume the shell.

## Navigation, responsive and interaction contract

The five fixed destinations remain 今日, 记账, 助手, 提醒, 更多. More supplies the existing native modal with 天气, 黄历, 备忘 and 设置, including focus restoration and native Back dismissal. The shell reserves an 82px navigation height plus clearance and safe-area insets. The keyboard state hides the navigation and removes its clearance.

The shell is at most 820px wide. Grid tracks use `minmax(0,1fr)`, long values can wrap, and 320px layouts use compact space without reducing primary controls below 44px. At 600px the finance plane becomes one horizontal region instead of stacked equal-size cards. The dedicated assistant surface owns its chat CSS; legacy chat styles in `terminal.css` are explicitly scoped to `.page-assistant > .panel`.

Focus rings, selection, caret and scrollbar colors consume the same palette. Hover, pressed, disabled, loading, error and success states remain functional. Motion is limited to brief color changes and a 1px pressed response, removed for reduced motion. No decorative scrolling, scanning or glow is present.

## Integration and verification scope

Root owns `TerminalApp.tsx`, the actual overview content and route state. The styling contract is `.overview-topline`, `.overview-date`, `.overview-message`, `.overview-finance`, `.overview-expense`, `.overview-remaining`, `.overview-record`, `.overview-agenda` and `.overview-weather`. Existing `.panel`, form, ledger, reminder, weather, almanac, notes and settings classes are retained. `TerminalInstrument` stays exported for existing independent consumers but is not mounted in the overview.

This CSS change was checked against the actual overview and compact weather markup. Root performs the build, page regressions, bounded light/dark browser review and 320px overflow checks after merging the independently owned changes. Earlier verification records for the discarded grey design do not certify this replacement.
