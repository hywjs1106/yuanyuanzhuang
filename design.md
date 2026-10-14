# 日常终端 · mechanical command console

This locked visual system applies to all eight existing pages. User data and confirmed-action behavior belong to the existing application. The reference is the supplied Endfield hub screenshots, adapted as original CSS and SVG geometry. No game screenshots, logos, character art, coordinates, connection latency, or invented operational metrics ship in the app.

## Visual DNA

Portrait command console: compact identity and truthful status strip, narrow route rail, a working area of metal-toned panels, five fixed bottom destinations. The overview combines real amounts with a compact circular instrument. Other pages lead with their actual forms, records, calendar details or conversation; they do not repeat a decorative hero.

Signal yellow denotes selected navigation and primary actions. Cool cyan identifies assistant communication and input. Neutral charcoal and warm grey hold the interface; light mode reverses the same hierarchy into pale metal. Thin contour lines, segmented circle scales, alignment rails, top-edge breaks and square module controls establish the mechanical voice. No neon bloom or continuous scanning animation.

## Tokens and typography

`src/terminal/terminal-tokens.css` is the semantic palette and timing source; `terminal.css` imports it. Color roles are base, paper, panel-end, paper-2, paper-3, ink, ink-2, rule, rule-strong, accent, accent-ink, focus, communication, error, success, overlay, shadow, clear, glass and topography. Dark mode overrides roles using `data-terminal-theme="dark"`.

Display uses installed Bahnschrift/DIN with bundled Terminal Sans for Chinese; body uses the bundled OFL Noto Sans SC subset. Mono uses installed Consolas/system monospace. Every font/color declaration consumes a named token except the local @font-face registration. No external font request. Headings remain upright. Amounts use tabular numbers; body copy stays comfortably readable.

## Navigation and responsive contract

Five bottom destinations: 今日, 记账, 助手, 提醒, 更多. Assistant has a distinctive cyan communication socket; yellow marks its active state. More opens a native modal dialog with 天气, 黄历, 备忘, 设置, and marks itself current for secondary pages. Native dialog supplies focus containment; Escape, close, backdrop and the cancelable window `terminal-back` event dismiss it and restore focus to More. Root native Back handling dispatches that event and stops navigation when defaultPrevented is true.

Controls are at least 44px high; bottom destinations are 60px high. Safe-area padding is included above and below. Shell reserves navigation height plus 32px; keyboardOpen hides navigation and root `.keyboard-open` removes its clearance. Max shell width is 820px. Grid tracks use minmax(0,1fr); 320, 375, 414 and 768px must have no horizontal overflow. Textareas remain normal document controls and can scroll into view above the keyboard.

## State and motion

Default, hover, focus-visible, active, disabled, loading, error and success styles are present. Focus rings appear instantly; motion is limited to a 1px pressed response and explicit short color transitions. Reduced motion removes pressed movement and transitions. Existing errors, saved states and disabled controls retain their meaning; no celebration or simulated service status is added.

## Integration

- `BottomNavigation({currentPage,onNavigate,keyboardOpen?})`; exported TerminalPage includes all eight existing pages.
- `TerminalStatusStrip({date,reminderCount,aiConfigured})`; caller provides actual local date, pending reminder count and configuration state. Configuration is never presented as a verified live connection.
- `TerminalInstrument({expense,budget,reminderCount})`; bounded budget ratio when budget exists, otherwise pending reminder count. Original SVG contour art is decorative; equivalent real values are visible and available in the accessible label.
- Overview `.hero-body`/`.hero-copy` layout is shared with `.today-command`. Existing panel, form, list, assistant and weather classes are preserved.

## Verification record

Focused navigation SSR tests check five destinations, More selection for secondary pages and honest budget overspend values. Browser inspection at 375px verified light/dark overview and More sheet; Escape restored More focus. All eight pages at 320, 375, 414 and 768px matched document width to viewport. The 320px assistant surface was visually reviewed. The cancelable terminal-back event was consumed when the sheet was open. Root owns the complete page/browser regression suite, keyboard/native testing and APK packaging.

Hallmark self-critique: Philosophy 5, Hierarchy 4, Execution 4, Specificity 5, Restraint 4, Variety 4. User-requested game menu shape intentionally permits compact framed modules and yellow edge markers; application function remains primary.
