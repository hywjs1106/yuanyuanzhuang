# 缘缘庄 · 秋日茶馆（独立预览）

**当前状态（2026-10-21，覆盖下方早期记录）**：默认仍为不联网演示；设置→配置模型→启用AI自主动作，可使用本次页面内填写的API连接进行真实模型对话。复用应用的AI传输层，不读取正式版Key/数据库、不写正式记录。刷新清除本次连接。真实模型调用模式下，动作仅由模型返回的结构化performance决定，不走演示关键词规则。当前验证使用模拟模型响应，没有调用真实付费API。

启动现有开发服务器，打开 `/inn-preview.html`。入口独立于 main.tsx，不加载现有数据库、API、通知或 StartupGate。

参考：用户提供的官方抖音视频 https://www.douyin.com/video/7698646708418350377 。实际观察到秋树、橘色木台、灰绿色栏杆、Q版祀和茶馆伙计；这里提取暖色、圆润墨线与茶馆空间关系，未复制视频或声称整套界面来自官方。

背景 `/previews/tea-terrace.webp` 是本轮生成的插画，不是游戏原画。祀的表情沿用已有 `/themes/si/official/01/02/04/05.png`；来源与权利记录见现有 `terminal-public/themes/si/SOURCES.txt`。保留原素材署名。

`/previews/tea-friends.webp` 根据用户补充的视频截图生成重绘，非从原视频无损提取的原始动画。人物组采用真实透明背景。本轮将官方八张方形表情的底部字母区域统一从显示中裁去，原图与来源记录仍保存。

功能：今日/助手/设置三项导航，记账与提醒临时增改，天气与黄历布局示例，日夜配色，安静模式，点击人物招呼。聊天是固定演示回复，不调用真实模型；刷新清空临时改动，不发送提醒。真实数据、正式AI任务执行、系统键盘和APK性能不属于此预览的验证范围。

## 原片试用更新（2026-10-21）

首页已用 `OriginalTea.tsx` 播放 `/previews/tea-original.mp4`，取代之前的重绘组合。原片来自上述官方抖音页面当前 video 元素的媒体资源，14.070998 秒、576×1024、585555 字节；不是带界面录屏的裁切。原片保持原始文件，画面在容器内居中裁切，默认静音循环，按钮可暂停/继续。当前文档上方的点击人物招呼是旧版行为，已由播放控制替代。

安静模式和页面后台时暂停；离开今日即卸载播放器。系统减少动态效果时先显示第12秒封面，用户可明确点播放。封面从原片帧提取，未重绘。生成背景和重绘人物保留作之前预览素材，本版首页不再显示它们。

浏览器验证：播放时间推进、暂停/继续、片尾循环、切页卸载、安静模式、减少动态效果及320像素无横向溢出，见 `references/inn-preview/original-video-verification.json`。未生成APK，未验证安卓真机耗电/帧率。

### 结尾循环调整

按用户反馈，取消整片的原生 loop。首次从头播放，结束后回到12秒，只重复12–14.070998秒的稳定扇扇子远景，不重放开头和中间的镜头推进。使用播放器 ended 事件衔接，不增加逐帧处理。已验证首次片尾回到12秒、下一次自然片尾仍回到12秒，以及暂停、安静模式和切页行为。

## 其余页面的茶馆风格统一

`tea-rooms.css` 为独立预览补齐聊天、记账、提醒、天气、黄历和设置的共同材质：暖纸、灰绿、杏色与圆润墨线。聊天/设置使用从已有重绘组合图展示的圆形祀头像；记账与提醒使用完整小组合图，避免单独裁角色带进邻近人物的碎片。不增加视频或持续装饰动画。

底栏固定在手机视窗底部，页面内容在其上方滚动；工具页归入今日的导航选中态。表单与输入框不使用固定内容宽度，金额采用等宽数字。黄历图标重画为八卦几何线条。深色模式有独立的纸色和文字色，不对页面或原片整体调暗。

验收：390/320像素 × 浅/深色 × 七页，共28张界面截图；没有横向溢出、输入框越界或底栏出屏。临时记账、提醒、聊天、深浅切换冒烟通过；原片尾段循环与暂停行为回归通过；TypeScript检查通过。证据位于 `references/inn-preview/rooms/`。仍是无API、无数据库写入的演示，未生成APK。

### 人物图标替换

用户明确要求全套图标使用原片风格的彩色Q版人物，不再用单调的功能线条。`CharacterIcon.tsx` 与 `character-icons.css` 统一显示八格透明人物图集：四个生活入口、三项底栏、页面标题、天气主图/小时图、账本列表、日夜按钮和头像装饰。文字标签保留；发送/播放控制直接用文字。时间选择器的WebKit按钮也使用同组人物纹理。

图集为原片参考重绘，非官方现成资源；静态WebP约865KiB，重复使用同一张图，不新增动画、视频解码器或逐帧处理。原片12秒尾段循环保持。320/390像素浅深四组截图共28页、临时操作冒烟、原片循环回归和TypeScript检查再次通过。

## 助手的对话与互动预览

`useTeaConversation.ts` 在父页面持有聊天、草稿、短暂准备回复状态与可取消计时器；`TeaChat.tsx` 展示互动。可点头像打招呼、讨茶、轻戳、换话题，人物根据接话切换表情。表情面板按需打开，四种用户表情得到不同演示回应；后续话题填入输入框，保留用户编辑机会。

演示回应结合最近内容与有限规则，不接真实AI。记账/提醒请求明确说明未保存，并给出打开对应工具的按钮；不会冒充已经执行。每次只准备一条回复，停一下即清除待回复任务；导航不会丢草稿或丢失准备中的演示回复，刷新仍会清空全部演示状态。

聊天采用多行输入，中文输入法组合态不发送，Shift+Enter换行，发送按钮保持输入焦点。翻阅旧消息时不自动抢滚动，有回到最新按钮。短屏模式压缩页头留白，安静/减少动态模式关闭局部动效，未新增视频解码器。

验证：10项互动检查（讨茶/表情、上下文、取消、切页保留、草稿、中文组合与快速回车、历史阅读、工具入口、320×540短屏）；截图见 `rooms/chat-interactive-*.png`，报告 `chat-interaction-verification.json`。同时通过原片12秒尾段循环回归、原演示操作冒烟、TypeScript检查。未生成APK，安卓原生键盘尚未真机验证。

取舍：主场景用插画与人物体现参考；四个工具单独排列，避免挤在画面内。只在切页和点击人物时使用短变换；支持减少动态效果。

## 完整小人面对面对话预览（2026-10-21）

助手默认进入茶馆场景：完整祀小人在场，当前回复显示于其身旁，最近一句用户消息单独显示。点小人可互动；收到回复短促点头，随后静止。历史通过“聊天记录”打开并可返回人物场景，原有草稿、取消、切页保存状态继续复用。长气泡内容可滚动，每次新回复从开头显示。短屏优先人物与输入框，收起快捷互动与话题建议。仍为内存演示，不连接AI、不写真实账本、不生成APK。

验证入口：`scripts/verify-si-scene.mjs`；旧 `verify-tea-chat.mjs` 入口转入同一检查，涵盖人物默认场景、点按互动、气泡回复、历史往返、取消、表情、草稿、中文输入法、连续回车、历史阅读位置、切页期间回复、账本演示入口、窄/短屏及减少动态效果。另检查原视频尾段循环不受影响。

素材采用内置 image_gen，保留真实透明通道，仅无损压缩至 `terminal-public/previews/si-conversation-fullbody.webp`。不是官方素材，不是骨骼或口型动画；此预览只使用完整角色图片与短促整体动作。

生成提示词（原片封面为身份与画法参考）：

> Create ONE clean transparent-background full-body chibi character asset for an interactive chatting companion UI. Reference image is identity and art style reference: Si (祀) from Endfield, pale sage green bob hair with longer low back hair, black branching dragon horns yellow inside, tiny gold forehead ornament, blue eyes with pink lower rim, dark charcoal short coat over ivory front with blue trim, oversized soft gray sleeves/gloves, black boots, black ribbon accents. Match the reference's simple opaque flat-color Q cartoon, bold slightly hand-drawn dark contours, adorable two-and-a-half-head proportions. Draw her alone STANDING fully visible head to feet, in a friendly conversational pose, one gloved hand raised near cheek as if chatting and the other open gently to viewer; small warm smile, looking slightly toward upper right. Do not include the other helper creatures, seat, pedestal, background, text, speech bubbles, frame, shadow blob or UI. Full body and both boots must be completely visible. Character fills 90 percent of canvas height with modest clear margin. Canvas portrait. Maintain actual alpha transparency; all body/clothing fills solid opaque, crisp cutout. This is a new companion sprite, not a screenshot crop.

## 六种语气动作（2026-10-21）

保留用户已认可的完整小人场景。新回复携带动作枚举：happy / comfort / shy / thinking / serious / tea，分别使用独立全身姿势。预览的问候/好消息、疲惫难过、称赞、困惑、记账提醒、茶话分支显式设置动作，渲染层不从屏幕上的回复文字猜测动作。不开心优先安慰；处理不难过、不累等常见否定。此处仍为有限本地演示，不是接入模型后的通用情绪理解。

新素材预解码后才允许切换；失败保持原站姿。一次动作短动并停留约1.7–2.5秒后回到站姿，换回复/取消/卸载清理计时器，切页不重播旧动作。减少动态效果时只换静态姿势；后台不持续播放。不引入骨骼或逐帧动画库。图集中安慰格左侧有邻格尾部碎片，以该姿势专用CSS裁切移除，未修改原图像像素。

验收：`scripts/verify-si-actions.mjs` 覆盖六种触发、回站姿、否定语句、取消、减少动态效果与切页；`scripts/verify-si-scene.mjs` 继续验证聊天输入/记录/小屏。尚未在安卓真机验证；未生成APK。

素材：内置 image_gen 生成 `terminal-public/previews/si-conversation-actions.webp`，非官方素材。原PNG `C:/Users/12860/.codex/generated_images/01a1367b-6b4e-77f1-be1b-40953333f900/exec-d6da0e85-8581-414d-9fd4-8f4bd816d561.png`，1254×1254 RGBA，3列2行，仅无损WebP压缩。参考是用户认可的完整小人。

生成提示词：
> Produce one sprite atlas for this exact Si chibi companion, reference image is character identity and existing illustration style. Transparent background. A precisely aligned regular grid of THREE COLUMNS and TWO ROWS, exactly SIX equal rectangular portrait cells. Each cell contains ONE complete full-body Si, same head and body proportions as reference, pale green hair, branching black yellow horns, gold forehead ornament, gray gloves, charcoal ivory blue outfit and black boots. Identical scale and same baseline in all six cells, all horns/hair/hands/boots contained within own cell with clear margins; no overlaps, no borders, no text, no scenery, no duplicate helper creatures. Canvas approximately square (each cell portrait). Row1 col1: happy greeting, eyes bright smile, one hand raised waving. Row1 col2: comforting, gentle closed smile, torso leaning slightly forward, one open hand reaching gently toward viewer. Row1 col3: bashful from praise, rosy cheeks, gaze slightly aside, both gloved hands held near cheeks. Row2 col1: curious thinking, head tilted, one gloved hand under chin, tiny questioning eyebrow. Row2 col2: serious helpful explaining, upright stance, one finger raised, attentive face not angry. Row2 col3: offering tea, both gloved hands holding one small ivory teacup toward viewer, warm smile. Flat opaque fills, dark clean cartoon contours, no added realism, preserve friendly cute style. Real alpha transparency outside figures; clothing and skin fully opaque. Characters are separate UI pose sprites, not a poster. All six must be full body.

## AI自主表演与墨魉（2026-10-21）

祀共12种动作：原六种加掩嘴笑、抱臂轻哼、打哈欠、赞同鼓励、惊讶、安静倾听。墨魉共6种互动：探头、端茶、扇风、欢呼、打盹、作揖。它在脚边出现约4.2秒后退场；每轮最多一个祀动作和一个墨魉，不循环排队。窄短屏优先保留人物和输入框。均是生成姿势图加有限CSS动作，不是官方逐帧动画或骨骼动画。

`performance.ts` 是唯一动作目录、语义选择提示与解析边界。模型返回 `{reply,performance:{action,summon}}`，none可不动；忽略未知动作、媒体链接与任意参数，纯文本回复也可正常显示，损坏JSON报错。AI模式只播放模型返回的选择，不再使用respond演示分支。人格沿用已整理的siPersona，动作提示明确要求考虑上下文、否定、反话、低落情绪以及不要每轮重复。动作与记账等真实执行权限没有关系。

`teaModel.ts` 复用已有chatComplete（OpenAI兼容/Anthropic），发送最近16条本次预览消息。配置只在React内存，默认不联网；用户在设置明确填写并启用后才发送后续消息到该地址。中止会abort，过期响应不可回写；网络失败明确显示错误，不偷偷改成演示回答。不读取正式数据库、历史或Key，不执行正式任务，不生成APK。网页API还需服务商允许CORS。

验收：tea-performance单元测试；verify-tea-model模拟端到端模型回复，验证自主动作、none、未知动作、连接失败、取消、6个墨魉与新增6个祀姿势、短屏。另继续verify-si-scene和verify-si-actions。没有真实模型/API联调或安卓实测。

新增素材由内置image_gen生成并无损WebP压缩，保留透明通道，不是官方现成素材：
- `terminal-public/previews/si-conversation-extra.webp`，原PNG exec-29b7d02f-dba2-4443-ba05-a3f99d254c2b.png，1254×1254 RGBA。
- `terminal-public/previews/moliao-conversation-actions.webp`，原PNG exec-367225af-c627-49f3-b98a-af6f2ff8e27c.png，1536×1024 RGBA。

原PNG位于C:/Users/12860/.codex/generated_images/01a1367b-6b4e-77f1-be1b-40953333f900/。生成提示词存于references/inn-preview/companion-assets-prompts.md。墨魉以用户认可的1号牌小伙计轮廓为参考，形态和官方设定的进一步精确对应仍以用户评审为准。

## 原程序整合（2026-10-21）

原程序的祀对话页现已复用这里的人物与墨魉。共享目录/播放组件已移至src/terminal/companionPerformance.ts、SiCompanion.tsx与si-companion.css；预览保留薄重导出以兼容本页面。生产协议没有带入预览只读限制，继续走原任务执行与确认流水线；配置、聊天和备份沿用原程序。直接打开根页面切到祀→助手查看，无需另填预览Key。此处独立预览仍保留作比较。
