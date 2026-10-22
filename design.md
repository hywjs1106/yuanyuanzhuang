---
name: 帝江号
description: 终末地游戏内界面启发的个人安卓生活工具
colors:
  base: "#efefe9"
  paper: "#fafaf6"
  paper-2: "#e4e4dc"
  paper-3: "#d6d6cc"
  ink: "#20221f"
  ink-2: "#60635a"
  rule: "#c3c5ba"
  rule-strong: "#73786a"
  accent: "#e8ef20"
  accent-ink: "#20221f"
  focus: "#697200"
  communication: "#166a78"
  error: "#ab3028"
  success: "#28633e"
  overlay: "#151813b8"
  shadow: "#20221f16"
  clear: "transparent"
  carbon: "#242824"
  on-carbon: "#f5f5eb"
  on-carbon-muted: "#c3c8ba"
typography:
  headline:
    fontFamily: '"Terminal Sans", "Bahnschrift", "DIN Alternate", sans-serif'
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-.025em"
  title:
    fontFamily: '"Terminal Sans", "Bahnschrift", "DIN Alternate", sans-serif'
    fontSize: "17px"
    fontWeight: 600
  body:
    fontFamily: '"Terminal Sans", "Segoe UI", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: '"Terminal Sans", "Segoe UI", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "13px"
    lineHeight: 1.6
  mono:
    fontFamily: '"Consolas", "SFMono-Regular", ui-monospace, monospace'
rounded:
  input: "4px"
  tag: "2px"
  mission-row: "3px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.input}"
    padding: "10px 13px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    padding: "10px 14px"
    height: "48px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    padding: "11px 12px"
    height: "48px"
  navigation-active:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    padding: "7px 3px"
    height: "60px"
  tag:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.tag}"
    padding: "3px 7px"
  panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "20px"
---

# Design System: 帝江号

## Overview

**Creative North Star: "游戏内帝江号"**

中文安卓生活工具沿用《终末地》游戏内主菜单、BAKER通讯和任务页面的界面语法：暖纸工作面、碳色阅读面、克制的信号黄，以及清晰的细线和几何图标。参考的产品事实与来源见 [PRODUCT.md](PRODUCT.md) 和 [游戏内界面来源](docs/endfield-ingame-ui-sources.md)。图形为原创抽象地形，不表示真实定位或遥测。

本文记录已经实现的界面。色值与共享字体来自 terminal-tokens.css；尺寸、字重和最终外观同时以最后导入的 terminal-polish.css 为准。保持已有字体、人物与表情资产，以及原有本地业务和原生通知语义。

**Key Characteristics:**

- 暖纸背景、碳色通讯和提醒详情、局部信号色。
- 真实本地时间与日期一起位于标题右侧，中央显示轻微漂浮的帝江号飞船，四个功能按钮独立位于外侧四角。
- 紧凑信息行、细线分区、舒适触控区域和三项底部导航。
- 浅深主题维持同一信息层级；减少动态时仍更新真实时间。

## Colors

共享浅色主题色值见前置令牌；深色主题覆盖以 terminal-tokens.css 为准，通讯与地形的局部色值以各自组件样式为准。sidecar 记录色彩角色和可继承这些主题令牌的组件示例。

### Primary

- **信号黄（accent）**：主要提交操作、提醒选中行、导航短下划线和时钟秒标记；配 accent-ink 保持文字清晰。

### Secondary

- **通讯青（communication）**：共享通讯入口语义。聊天阅读面另有已实现的 chat-cyan 局部色，用于通讯印记和状态提示。
- **错误红（error）与成功绿（success）**：超支、错误和收入等真实业务状态。

### Neutral

- **暖纸（base、paper、paper-2、paper-3）**：页面底色、工作面和控件状态。
- **墨色（ink、ink-2）与细线（rule、rule-strong）**：文字层级、分区和边界。
- **碳色（carbon、on-carbon、on-carbon-muted）**：联系人入口和提醒详情的阅读平面。

**The 信号色 Rule.** 用信号黄标示操作或选中状态；底部导航的选中背景采用 paper-2，并以短黄色下划线确认当前位置。

## Typography

复用已有本地 Terminal Sans 字体文件，中文正文使用 body 栈，标题使用 display 栈，提醒列表时间和数量使用 mono 栈。正文默认常规字重；标题适度加重，数值使用等宽数字以避免跳动。

### Hierarchy

- **Headline**：面板与主标题；共享标题样式见前置令牌。通讯标题另为较紧凑的标题（20px）。
- **Title**：小节标题；提醒详情标题沿用 headline 尺寸。
- **Body**：普通页面正文；聊天正文采用较紧凑字号与宽松行高（14px、1.8）。
- **Label**：表单标签；辅助说明多使用小字号（10–13px），维持与主要内容的区别。
- **Clock**：时分采用中等字重（500、27px），秒数更小（13px）；窄屏分别缩为（24px、11px）。

**The 字重 Rule.** 正文保留常规字重（400），共享标题使用半粗字重（600）；保留联系人等局部组件已有的中间字重。

## Layout

外壳居中，最大宽度（820px），常规横向留白（24px），窄屏缩为（18px），最窄断点缩为（14px）。页面考虑上下安全区域。底部三项导航固定，导航基础高度（76px），页面底部为导航与安全区预留空间。

首页圆形地图居中，外圈保留秒标记，直径为 `min(200px,64%)`，外层区域最大宽度（480px）、高度（332px）。四个独立按钮位于左上、右上、左下、右下，置于圆外，按钮最大宽度为区域的（37%）。最窄屏区域高度（320px）。日期与本地时间共同位于总览标题右侧，地图中央不放文字。联系人入口之后依次为提醒数量和紧凑最近安排、账簿摘要、黄历摘要。

普通工作面留白（20px），手机内侧横向留白（16px）。提醒在小屏顺序显示列表与单份详情，宽屏断点（600px）改为两列。聊天采用可滚动记录区与固定布局内的输入区；键盘打开时隐藏底部导航，保留输入区域。已实现响应断点为（350px、420px、600px）。

## Elevation & Depth

工作面以纸色层级和细线构成深度，普通按钮和面板不依赖投影。圆形地图使用轻微投影（`0 8px 20px #141e2226`）；更多菜单上拉面使用（`0 -10px 40px var(--color-shadow)`）；回到最新消息按钮使用（`0 3px 12px #0003`）。这些是已有的局部深度处理。

## Shapes

控件使用小圆角，普通工作面保持方形与小切角。导航和更多菜单入口已经取消原有裁切轮廓。聊天气泡使用方向相反的不对称圆角（`2px 8px 8px 8px` 与 `8px 2px 8px 8px`），保持发出和接收的视觉区别；消息头像为圆形，联系人标题区头像为小圆角。

共享图标采用（24×24）网格、`currentColor`、圆端点和圆连接，线宽（1.6）。几何保持约（3px）的边界余量，实际图标通常显示为（22px）。导航的图标容器为（28×24px），留出图标与文字的间隔。

## Components

### Buttons

一般控件最小高度（48px），次要操作用纸色背景，主要提交用信号黄。hover 使用纸色层级与更强边线；focus-visible 为清晰外轮廓，普通终端控件宽度（2px）、偏移（3px）。首页四角按钮有双层细线和专属焦点轮廓（3px）。普通按钮按下位移（1px）；减少动态时关闭过渡和位移。

### Inputs / Fields

纸色输入面、细线边框和共享小圆角；文本输入、选择和多行文本控件最小高度（48px）。聊天输入区为独立浅色平面，输入框与发送按钮维持同一触控尺度。

### Chips

标签使用细线边框、paper-2 背景与小圆角；用于简短状态说明，避免与主操作竞争。

### Cards / Containers

工作面以顶部较强细线、底部普通细线及小切角界定。普通面板采用共享留白；提醒详情使用碳色平面与浅色文字。通知与错误以边框和状态文字表达真实状态。

### Navigation

固定三项导航，目的项最小高度（60px）。选中项是纸色底与黄色短线，通讯图标可显示通讯青。更多目的地使用两列入口和清晰名称。键盘打开时隐藏底部导航。

### Map Clock

原创地形、表盘和秒标记都为不拦截点击的装饰。使用真实本地 `Date` 显示时、分、秒，秒数单独排版；每秒边界更新，页面恢复可见或获得焦点时重新同步。

地形轮廓往返流动周期（6s），陆地轮廓虚线流动周期（5s），秒数字进入动画（240ms），秒标记按真实秒数定位。减少动态时关闭这些动画并固定秒标记，文字时间继续更新。

### Communication and Reminders

通讯以独立青色印记、深色阅读面、灰色接收与浅色发出气泡组成。表情选择留在滚动记录区域。提醒列表以整行信号黄标示选中项，旁边或下面仅显示一份对应详情。保留已有确认、编辑、删除与原生通知行为。

## Do's and Don'ts

### Do:

- **Do** 复用现有共享令牌、字体和人物资产，并检查最终样式覆盖。
- **Do** 保持圆外四角入口、真实本地时钟、标题栏日期和紧凑最近安排。
- **Do** 保留清晰焦点、舒适触控区域，以及减少动态时的真实时间更新。
- **Do** 用真实业务数据和实际权限状态呈现信息。

### Don't:

- **Don't** 让入口压住中心圆或让图标越出容器。
- **Don't** 把装饰地形解释为真实定位、地图或遥测。
- **Don't** 用首页重复摘要堆叠遮住联系人与最近安排。
- **Don't** 将浏览器预览当作原生安装或通知送达验证。

## 0.6.3 refinement

The four external corner plates use a single edge and a small corner mark, with a 24px glyph, 15px title and 12px meaningful helper. Circle/time separation and reduced-motion rules stay unchanged. Fine SVG ledger/chat/bell/weather glyphs keep 3–21 optical bounds.

Fangyi remains the chat identity. The oversized anonymous cyan stamp is replaced by one small communication glyph; character status is honest. Body text is15px with1.85 line-height, quiet12px status labels, softer incoming/outgoing bubble corners. Keyboard state compresses the header and hides only explanatory copy, preserving composer and scrollable sticker/gallery content.

The five navigation destinations use24pxglyphs and12pxlabels with one selected surface/yellow indicator; hover does not create a second selected-looking tile. Primary business-page actions use signalyellow. Other functional rows, databases, native reminders and AI execution guards are unchanged.

## 0.6.4 Endfield surface families

References: Statrue/endfield-design-skill (SKILL.md, surface-families/app-ui), DSH theme previews, weepwood design atlas. These are community observations, not an official brand specification; official live-page rendering was blocked during reference study. No official logos, proprietary fonts or game screenshot assets were added.

The home is a touch-first hub: four separate controls dock around ornamental terrain, static low-contrast connector geometry groups them, and the stronger Fangyi contact remains the primary conversational entry. Date/time stays at top right, terrain stays decorative, no fake route/connectivity metrics. Map168px/orbit308px leave readable64px externalcontrols and avoidoverlap down to320px.

Ledger uses a data-report hierarchy: recorded balance is a single full-width carbon band with larger real digits; monthly income/expense are two subordinate data bands. The calculated-balance explanation stays visible. Reminders use a carbon selected row, white title and a small yellow corner hook; details/actions keep original logic.

Communication uses a light character header, circular Fangyi portrait and honest configuration label above the dark reading plane. Capsule input/actions follow conversation semantics. Compact keyboard mode retains smallportrait and composer. Selected navigation is carbon/white withyellowmarker; selectionchanges applyimmediately to avoid lowcontrast white-on-light intermediateframes. Weather quantityblue is semantic; lunar date/宜忌 followquietfoliohierarchy.

All database/action/AI/notification/TLS behavior remains unchanged. No new external assets or dependencies. Browser visual/responsive/interaction checks do not prove real Android system fontscale or notificationdelivery.

## 0.6.5 touch feedback

Studied icaruszezen/endfield-ui motion documentation and README, LaoBiDeng321/Endfield-Style-Skill README, and Yue-plus/astro-endfield README/Header/Card source. Adopt short action-driven motion rather than delayed boot choreography. Their visual guidance is community interpretation; the React 19/Tailwind 4 component package is not imported into this React 18 app.

The focal interaction is the independent yellow dock marker moving between five stable destinations in 200ms. Selected foreground/background remain atomic to preserve first-frame contrast. Home plate and contact hit regions stay fixed: icons compress, corner marks tuck inward, and the contact action responds separately. Asymmetric corners soften controls while retaining straight industrial edges. More and sticker panels enter once in 180–200ms; native dialog focus, dismiss behavior and business handlers remain unchanged. No new dependency, haptic permission or pointer-capture state. Reduced motion removes spatial feedback; disabled send controls cannot compress. Phone viewport and browser verification do not establish physical Android touch performance.

## 0.6.6 floating home controls

User explicitly requests floating buttons. Only the four home shortcuts gain idle motion: each complete visual surface moves vertically by up to 3px over 5.2 seconds with offset phases and a soft downward shadow. A fixed 67px hit region reserves 3px above the 64px visual surface, so every visible face stays clickable throughout the cycle and remains at least 3px clear of the terrain at 320px. Pressing pauses the float and reduces the shadow, while existing icon feedback remains independent. The HubMotion wrapper observes its viewport intersection and document visibility, pauses offscreen/hidden loops and cleans up observers/listeners. Reduced-motion preferences retain static elevation without floating. Bottom navigation, forms and conversation controls keep their prior behavior.

Follow-up: page navigation gets a 190ms, 6px content entrance with a thin transient signal mark. Reading text stays fully opaque. The content region is keyed by page; existing conditional page disposal stays the same, old pages are not overlaid, and repeated current-page navigation does not remount. The first load has no passage; header and dock remain stable. No waiting, exit timers or forwards transform fill, and reduced motion disables both entrance and signal. Native back-to-home also changes the keyed content after navigation has been enabled.

## Opening preview awaiting packaging approval

User requested a short opening and explicitly said not to produce another APK until they agree. The first F-mark preview is superseded by the user's chosen icaruszezen/endfield-ui SplashScreen adaptation: original MIT triangular geometry and portrait/landscape layout, decorative fill (900ms), yellow full-screen wipe (540ms), then fade (200ms). The triangular mark remains visible in portrait and the branding is our own 日常/终端. The React 19/Tailwind 4 package is not installed; original source motifs and sequence are adapted to the current React 18 app, with full MIT attribution in NOTICE and terminal-public/licenses/endfield-ui-MIT.txt. No separate official-image Game assets are included.

StartupGate keeps application initialization mounted, temporarily makes the content inert/hidden from accessibility, and restores a non-input heading when it leaves. By the latest user request, there is no visible skip button: startup focus stays on the dialog itself until automatic completion. Existing Escape/native-back dismissal and reduced-motion bypass remain; timers and listeners clean up. ErrorBoundary stays outside the gate. No fake progress or connectivity statements, no version change or Android sync/build. Current preview: references/ui-13/three-tabs-preview.webm. Physical Android behavior remains unverified; generating the next APK still requires explicit packaging confirmation.

## Three destination dock

The user's latest navigation requirement supersedes the five-item descriptions above: only 今日, 助手 and 设置 remain in the dock. Settings opens directly; daily subpages belong to Today's group, with `aria-current="location"` on Today when a tool is open rather than announcing the actual page as 今日总览. The fixed dock uses three equal columns, two 8px gaps and 12px side padding; the sliding marker slot is `(100% - 40px) / 3`. The four floating home shortcuts retain their routes. A labelled 48px 备忘 row on the home page preserves the former More-only note destination. No business feature or persisted data is deleted, and the keyboard still hides the entire dock.


## 2026-10-17 可切换角色版本
默认庄方宜保留现有工业界面。祀版用宣纸米白、玉绿、墨色与少量朱砂，中央改为原创山水画卷，四角入口与底部三项导航不变。书法子集只用于“画中行”装饰标题，正文/金额/时间仍用原有字体。深浅模式与角色版本独立。顶部角色按钮和设置中的两张选择项即时保存；切换会更换对话头像与人格，聊天按角色分别保留，旧记录默认归方宜，生活数据共用。墨魉采用用户提供的1号形象并以脸部裁切显示。主题插画不是官方画面，不表示实际环境。

2026-10-17 祀版布局优化：中央山水收进留白纸面，移除厚边框、卷轴横杆与底部独立墨魉；四角改为同系水墨小龙插画入口，保留记账、提醒、天气、黄历文字与完整点击区域。四种动作以游戏撑伞头像及提灯画卷为参照改编，来源记于 themes/si/SOURCES.txt。深色使用浅色纸面衬托墨线。聊天页改为紧凑人物栏与低对比边角山水；方宜界面、人格和数据逻辑不变。

2026-10-17 祀头像：按用户要求与方宜采用同系闭眼笑Q版，保留浅绿发、龙角和服饰识别点，抱小画笔。由官方portrait身份参考和现有方宜头像风格参考改绘为透明chibi-avatar.png，非官方Q版素材；聊天头图、消息头像和设置角色图同步替换，墨魉招呼互动不变。

2026-10-17 祀表情：沿用头像改绘五个透明情绪变体，开心复用原头像，共六张静态本地素材。Si表情栏单独三列排列，预览不冒充聊天消息；支持草稿颜文字插入。静态表情不显示动画播放按钮、不尝试远程URL。所有回复/导入/渲染按角色校验，默认旧聊天仍为方宜。按下Si表情按钮时若正在输入则保留焦点，避免键盘收起移动按钮造成点击失效。

2026-10-17 版本名称：祀版显示缘缘庄，方宜版保持帝江号；页头、页面标题、开场文字、设置说明及新导出备份命名随当前角色切换。祀提示词明确“喜欢使用颜文字”为聊天习惯，轻松场景主动使用；仍尊重严肃语境与用户禁用偏好。安装包名称和数据格式不变。

2026-10-17 缘缘庄字体：正文与界面标题改本地霞鹜文楷轻便版400/500，两字重保留完整25694字形，WOFF2格式；聊天16px、1.9倍行高，页头28px/窄屏24px，四角文字20px。仅Si根变量生效，画中行保留原书法子集；时间、金额、日期表单用Terminal Sans，颜文字按钮用系统符号回退。离线缓存上限由5MiB调整为6MiB以包含两个完整字体文件，方宜字体不变。

2026-10-17 缘缘庄页头图标预览：用户同意尝试原创Q版小客栈，以青绿瓦顶、米白墙、暖黄窗和小红灯笼替换Si版顶部1号墨魉；透明素材40px完整展示，不使用原头像的放大裁切。方宜版页头和两版聊天角色头像不变。

2026-10-17 动效统一：开场保留完整标识直接出现与可见轻浮，重影/亮度变化减弱；翻页方向区分进入与返回，帝江号220ms、缘缘庄280ms，结束后移除过场状态，减少动态效果时立即到最终状态。祀整页裁切移除，仅山水装饰保留轻微画卷入场；底栏240ms收敛到最后选择，表情栏200ms、单条新表情220ms，历史不重播。聊天按钮只动内部内容，点击区域固定；原飞船漂浮和角落浮板继续保留。


## 2026-10-21 水墨版纸面一致性

仅水墨模式以si-ink-consistency.css收整内部样式：工具页沿用记账与提醒的展开纸面，弱化独立面板外壳，统一细墨边线、轻字重标题、辅助文字与既有笔刷按钮。输入框与编辑区用同系纸底和轻微不规则小圆角；聊天输入区仅一层纸边，文本区透明无框。沿用现有深浅纸墨色，保留焦点、危险及禁用状态。保留原山水、涂鸦、SiPresence、聊天记录和PaperIcon导航；不套用茶馆布局或修改茶馆与方宜的样式。
