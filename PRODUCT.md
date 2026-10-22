# 帝江号
用户个人安卓生活助手，以The Velvet代码为底座。保留本地记账、提醒、天气、黄历、备忘、AI人格聊天和方宜表情库；游戏成长/任务战斗不是产品目标。

手机中文，底部仅有今日、助手、设置三项导航。记账、提醒、天气、黄历通过首页四角入口进入，首页只保留放大的飞船与四个工具入口，备忘通过设置进入。开场不显示跳过按钮，自动结束并支持减少动态效果；生成新APK须用户明确同意。核心使用从与庄方宜对话开始，明确事务实际保存，含糊追问。资料与密钥本地保存；不改变已有数据库或原生通知语义。自定义AI尚未配置时诚实显示离线预设。

视觉参考《终末地》游戏内主菜单、BAKER、任务页面，来源已记录docs/endfield-ingame-ui-sources.md。用户要求飞船有轻微漂浮、时间留在上方、四角功能入口和更精细的图标；反对入口压住圆和图标越出框、首页重复信息堆叠。安卓浏览器预览用于可视检查，不能代替真机通知/安装证明。

2026-10-15：以截图里的完整终末地工业徽标作为开场与图标，首页中央改为截图提取并重建遮挡细节的帝江号飞船；白色半透明双边框功能面板仍保留四角，动态效果支持暂停与减少动态效果。

2026-10-15 简化：首页移除对话卡片、接下来、提醒数量、收支与黄历摘要，中央钟盘移除，四角面板用居中大图标与单行标签；天气改日云图标、黄历改八卦、助手改圆形对话徽标。开场完整标识直接出现，采用一次低对比重影；无横向展开、黄屏过场、进度条或底部文案。

2026-10-17：新增庄方宜 / 祀（小葱）完整角色版本切换。视觉风格和助手人格一起切换，聊天按角色分开，生活记录和API配置共用；旧聊天保留为庄方宜。祀主题采用原创画卷山水，保留功能入口和三项导航；深浅模式独立。图标纠正为用户截图中戴1号牌子的墨魉。无APK生成授权。

2026-10-17 祀版布局优化：中央山水收进留白纸面，移除厚边框、卷轴横杆与底部独立墨魉；四角改为同系水墨小龙插画入口，保留记账、提醒、天气、黄历文字与完整点击区域。四种动作以游戏撑伞头像及提灯画卷为参照改编，来源记于 themes/si/SOURCES.txt。深色使用浅色纸面衬托墨线。聊天页改为紧凑人物栏与低对比边角山水；方宜界面、人格和数据逻辑不变。

2026-10-17 祀聊天丰富：新增六种本地静态Q版表情（开心、得意、思考、惊讶、陪伴、晚安），已接入模型候选、历史显示和恢复校验；方宜178张原表情库保持独立。重写相处节奏及颜文字规则，现代、俏皮、有主见，情绪严肃或事务核对时收住装饰。表情栏可预览，颜文字只加入草稿；离线仍明确标示预设限制。无APK生成。

2026-10-17 动效统一：开场保留完整标识直接出现与可见轻浮，重影/亮度变化减弱；翻页方向区分进入与返回，帝江号220ms、缘缘庄280ms，结束后移除过场状态，减少动态效果时立即到最终状态。祀整页裁切移除，仅山水装饰保留轻微画卷入场；底栏240ms收敛到最后选择，表情栏200ms、单条新表情220ms，历史不重播。聊天按钮只动内部内容，点击区域固定；原飞船漂浮和角落浮板继续保留。

2026-10-17 缘缘庄独立开场：祀版用原创小客栈、纸底淡山水、窗灯渐亮和朱印，沿用文楷并适配深浅色；完整客栈直接出现，无工业徽标、三角框、电视扫描或英文副标题。设置读取前使用中性底，读取完成才启动原1450+190ms计时，图片失败不阻塞进入，保留返回/焦点/减少动态效果。方宜开场不变。新增2项先红后绿，12项相关网页、104单元和完整网页构建通过；ui32双亮度、小屏、横屏预览已检查。未生成APK。

2026-10-17 开场标识重绘：用户拒绝具象Q版客栈，要求祀的水墨画技。开场改为原创派生大眼墨龙挥笔，干笔、青绿墨迹和朱红点；仅开场替换，顶栏客栈保留。移除窗灯光斑，整幅图直接出现后轻微落笔式摆正，浅色米纸/深色灰青纸保证墨线可读。6项相关网页场景和完整网页构建、ui33浅深/320/短横屏捕获检查；无APK。

2026-10-17 开场构图补充：用户认为水墨龙开场太空，新增原创透明淡竹/墨石画框层，右上竹叶、左下浅石与原山水相接；中间墨龙最大280px，山水上沿38%并适当加深，保留标题清晰与原短横屏限制。装饰无交互、无额外文案和延迟。6项开场网页检查通过，ui34浅深/320x568/短横屏预览已检查，无APK。

2026-10-17 开场左上补淡朱砂日与两只远鸟，原创透明画作、静止、无交互、无文案。Si-only，宽度64–94px，短横屏60px，保持主体/标题/右竹/左下石不变。ui35深浅390/320x568/740x360已看，2项相关网页检查通过，无APK。

2026-10-17 小墨龙眼珠动效：开场与四个功能入口共5只，原始PNG不改动，统一InkDragon组件通过逐图眼白坐标+独立SVG裁切瞳孔转动；同一只两眼同步，四入口错峰转圈/斜瞟/停顿，hover与键盘聚焦看过来。开场首圈在原时长内，整体轻摆移到包裹层保持对齐。减少动态效果隐藏覆盖层回原PNG，离屏/隐藏主页暂停，图片失败不遗留眼睛，唯一clipID防开场与主页冲突。2新增网页检查先红后绿（错峰延迟纳入采样时钟），原开场2项回归通过，完整网页构建通过；ui36五图放大对齐/深浅/320/视频已检查，无APK。

2026-10-17 缘缘庄首页与按钮统一：四角保留墨龙眼动和文字，山水扩大、补淡竹石和远日，标签添小朱点，深色首页以灰青纸面衬整幅画，移除四个独立亮圆底。Si单独控制首页高度，320x568四入口均在底栏上方。新si-ink-surfaces统一常用按钮纸签笔触、主要提交朱砂色、底栏选中朱印轮廓、表情/设置/表单，原命中区与焦点不被遮罩裁切；危险、disabled、hover分别保留。方宜不受影响。8项不同相关网页检查通过，新增表面检查初次误用提醒标题、修正为提醒与生日后通过；评审发现备忘删除颜色被覆盖，已通用danger覆盖修正并验证。完整网页构建及最终CSS构建通过；ui37深浅、小屏、聊天、表单、设置和切回方宜截图已检查，无APK。

2026-10-17 用户纠正首页图层：移除四个入口各自的纸签衬底，山水层inset0且取消椭圆遮罩，连续铺在四龙与文字下方；竹石装饰z1，入口z2保持命中区。同步移除短屏重新收窄山水的覆盖，深浅色均无四块截断。新增共同背景全覆盖/衬底不存在断言，4项相关网页场景与最终网页构建通过；ui38浅深和320x568已检查，无APK。

2026-10-17 顶栏名称旁图标重绘：用户不喜欢Q版客栈，要求查资料重画。核对中枢档案祀的画转录，以画境意象原创青绿画卷配毛笔（非官方标识），替换Si header src为scroll-brush-mark.png，保留40px布局。ui39浅/深/320/聊天与方宜切回复原检查通过，已看实际小图和整页；2相关开场网页检查、网页构建通过，无APK。

2026-10-17 时钟逐位动效：按用户明确要求，六位时分秒独立比较前一帧，仅变化数字节点换key并播放240ms动效，未变数字和冒号保持原节点静止，首屏不播放。仍按秒边界对齐、隐藏停止/恢复校时；reduce仅关动画，时间继续更新，无aria-live秒读。5项进位边界新网页测试先红后绿，加原实时时钟共6通过，完整网页构建通过；ui40放大实际组件录制跨分钟/小时演示，未改产品字号。无APK。

2026-10-17 用户要求深色优化和顶部更可爱水墨：Si深色统一青灰墨底/暖纸文字/淡玉与朱砂状态，原创夜景山水保持整幅衬在四龙下；小龙保留原墨线/纸道具，轻微暖灰边缘辅助，无反相/独立底板。顶部日期区左加原创抱笔小墨团44px，功能页标题统一淡墨短笔迹；聊天背景、按钮、输入、设置同步夜色。手动深浅切换决定Overview与开场景图，开场也同套夜色。新增夜色检查先红后绿，含320窄短屏不挤clock/4入口、reduce、整幅背景、文字对比与disabled；开场旧CSS同级覆盖问题新增断言先红后绿并提高具体性修复。104单元、13项不同相关网页场景及完整build/最终CSSbuild过；修复之前InkDragon直接CSS import导致Node SSR读css失败，移到TerminalApp统一入口加载。ui42完整31图/录屏与gallery已验证，夜色开场和深色主页面实际已看，预览5191，无APK。

2026-10-17 用户批准祀随笔画方案后实施：Si记账增加小墨龙账页、按原始本地日期分组与手绘分类图标，记录余额/月收入/月支出语义不变；筛选无结果明确提示，保存成功才显示印记。Si提醒按已到期/今日/明日/之后/已暂停/已完成分组，含公历实际日期时间；选择后仅显示单张详情，返回恢复便笺按钮焦点。原重复、启用、稍后和完成逻辑不改。新增PaperIcon统一分类和Si三项底栏图标，常用输入、选框、便笺与提交笔触接入si-paper-records，深浅均支持，保留原小龙转眼及减少动态效果。106单元、16相关网页场景、完整网页构建通过；ui43完整32图/视频/分类放大已检，预览5192，无APK。

本轮只读代码复查发现方宜提醒新增分组容器导致按钮失去flex拉伸，已对方宜wrapper用display:contents恢复原结构；隔离浏览器验证行宽354px=列表354px。Si列表/详情与小屏3项重跑通过后保留，同轮不生成APK。

2026-10-17 用户要求深色小龙变白：Si夜色仅对InkDragon的PNG层做运行时白墨反相，去原父层灰边；瞳孔覆盖层保持独立黑色与转动，浅色原图不变。涵盖四角入口、记账/提醒与开场，6相关网页和网页构建通过，ui44深色首页/账页/开场已看，无APK。官方表情来源研究另记docs/si-official-art-research.md，原图素材保存在references/ui-44，尚未替换聊天库。

2026-10-17 官方祀素材接入：头像统一换为官方第十弹01眨眼PNG，表情栏及AI候选为8张官方透明PNG，全部本地打包并保留版权标识。原6张改绘保留为历史ID，现有聊天与备份可继续解析；无数据迁移。SiPresence点击展开纸面自画像，官方1.4秒MP4只播一次后回原始静态封面，5秒收起；减少动态效果、播放失败用静图，隐藏/忙碌收起，Escape可关闭，不写聊天或触发AI。官方来源记录SOURCES.txt，方宜不变，无APK。
验收：107项单元、9项相关网页检查通过，390深浅与320小屏截图已检查；官方8张PNG与来源文件逐字节一致。评审修正了新模型回复仍可使用历史表情ID的问题：新回复只收当前8张，历史/备份继续读旧图。

2026-10-17 按用户要求移除祀聊天表情栏里的看画/墨魉预览入口及临时预览展示，只保留八张官方表情、颜文字和新头像随笔画互动；方宜原交互不变。

2026-10-17 水墨动效接力：Si切页用真实点击原点360ms揭页，旧页仅DOM画面衬底（inert/aria-hidden、表单变静图、SVG引用重命名、嵌套滚动位置保留），520ms保险清理；连点以最后选择为准，减少动态/隐藏/尺寸变化清理。原React页面照常立即卸载，中止AI请求不变；安卓返回重新读取角色设置。记账/提醒真实保存成功后，PaperReceipt先收笔360ms、再260ms后落印340ms，文字保持可读；失败不庆祝。祀开场复用原图分层，墨龙收笔、山水推进、三字错峰与1000ms落印，仍1450+190ms；无跳过、无APK，方宜保留原流程。截图/录屏ui46。

本轮验收：107单元、18相关网页、完整网页构建和差异空白检查通过；ui46深浅/320截图及18.08秒录屏已检查，预览5196。已修复旧聊天画面滚动回顶、SVG眼睛引用失效和安卓返回旧角色闭包三处评审问题。未做安卓真机帧率验证，无APK。

2026-10-17 上游经验首轮落地：记账/提醒/设置/聊天共用原生按钮组件，Si纸签按压只动纸面和标签，保留命中区、焦点、危险/禁用/忙碌状态；结构型选择行保持原布局。设置新增可增改删/停用的角色记忆，最多20条、每条240字，两位角色共用，聊天仍独立；由用户手动维护，不自动提取、不生成事务。启用时在既有API请求中作为资料发送，离线预设不据此生成回复；停用只影响后续发送。事务更新防旧设置覆盖，备份包含记忆、校验格式且不含Key。109单元、15相关回归网页场景及3项最终记忆网页场景通过；模拟保存失败保留草稿/回滚开关，ui47深浅/320检查、独立评审完成。无APK。

2026-10-18 上游经验第二轮：聊天未提交的流水/提醒/备忘卡可原位修改、应用草稿、确认或忽略；已保存/已忽略只读，明确指令自动保存保留。修改复用动作校验，稳定操作编号与同步写入锁防重复；每次手动保存独立取消控制器，卸载取消，业务已落库而聊天回执失败时不回退为可写草稿。新增统一返回层级，Android terminal-back与Escape只关闭最近打开层（表情/人物互动/卡片编辑/记账与提醒表单/提醒详情/备份确认/记忆编辑），提醒自动聚焦前保存打开按钮以便返回恢复，备忘返回设置。111单元、5新增最终网页、13相关最终回归与网页构建通过；ui48浅深/320截图检查，无APK。系统返回和键盘仍需Android真机确认。

2026-10-18 长聊天连续性：每位角色独立本机草稿/阅读锚点/已读尾部与历史窗口，离开页面和刷新保留；先保存用户消息再消费完全相同的草稿，不清掉较新输入，消息保存失败保留原文。新增每次30条的更早历史入口，加载旧内容或新回复到来时保持消息锚点，返回页面、媒体尺寸变化和视口变化时恢复；最新消息为右下角小纸签，主动点击才回到底部。等待历史真实加载，避免空列表覆写恢复状态；存储异常降级本次会话，草稿不自动发送、不进入备份、不扩展AI的20条上下文。114单元、3新增网页及最终角色/连续性7项通过，独立评审与390/320/700px读位检查通过；ui49深浅与320截图两轮检查、最终网页构建通过，无APK。

2026-10-18 聊天反馈优化：新回复300ms轻落定，全文即时可读，460ms清理文字入场状态；表情播放使用独立ID，保留方宜原5秒上限及历史静态策略。等待时三枚墨点，减少动态效果/切后台时停动。真实自动或手动写入成功后只播一次小朱印和笔画，静态已保存文字常驻；卡片内显示对应失败原因，可改可重试，失败绝不出现成功章。自动执行结果独立于聊天回执保存，回执失败不丢已保存/未保存卡片状态；提交原回执期间锁定卡片操作。编辑关闭后的焦点改在DOM提交后恢复，避免RAF抢跑。114单元、17最终网页与构建通过，评审两项P2先复现后修复；ui50深浅/320截图和短视频已检查，无APK。

2026-10-18 聊天与设置收敛：聊天身份区压至78px，键盘态60px，保留头像打招呼；完整保存的非提醒回执默认简短，原文可展开且保留历史/API/备份，提醒权限和失败提示不折叠。设置常用角色/外观/记忆前置，独立预算保存，AI/天气/备份/关于原生分组；折叠保留草稿，单独预算保存不清空API草稿。恢复预览只在备份分组展开时接管返回键。115单元、22相关网页、23整体/连续性回归与3最终分组网页通过，ui51深浅/320检查，独立评审完成，无APK。

2026-10-18 长期可靠性首轮：待确认事项作为原用户消息的可选actionBatch保存，保留已应用修改、未应用表单草稿、错误及保存/忽略状态；跨页面/刷新/后续聊天保留，两角色独立，备份校验兼容旧数据且恢复不执行。统一去重后的卡片编号，真实业务写入与已保存状态同一事务；事务内复核最终状态/内容防旧页面复活忽略项或已删除账目。回执失败仍保持只读；回看不重播落印。助手上下文发送时计算下一次本地提醒时间及重复规则，不使用最初日期。账本增加所选月份预算支出进度、剩余/超支和未设置提示，收入/调整不冲抵；首页不变。119单元、最终16相关网页和3关键事务回归、此前26整体回归、生产构建通过；ui52深浅/320检查，独立评审3项均修复复核。无APK。

2026-10-18 备份/缓存/历史后续：数据库v2仅增消息角色+时间+编号索引、待确认角色索引和撤销快照表，迁移旧聊天为方宜、不删除记录。恢复前旧快照与替换同一事务，失败全回滚，单步撤销保留本机Key/目的地；旧localStorage快照成功迁移才移除。导出/导入同25MiBUTF8及100000记录校验。聊天首次30条、按需向前30条，旧阅读锚点附近限量打开，最新快捷入口；较早待确认事项独立索引保留，模型仍独立取最新20条。10000条实测首次读取10000→62条（含较早待确认），不宣称相同比例的耗时提升。12张大图无损WebP约节省7.4MB，RGBA逐像素相等，官方文件及历史表情ID不变，原图归档references/asset-originals-ui53。网页预缓存约144MiB→1.1MiB，角色/字体按需有界缓存，不缓存API；生产SW实测已访问素材与页面断网可用。新角色未访问素材仍需首次联网，Android内置资源不依赖网页缓存。125单元、相关回归/构建与独立复核通过；ui53深浅/320检查，无APK。


2026-10-18 动效连续性首轮：两套主题共用进入/返回/底栏切换语义，祀保留360ms触点揭页，进入220ms、返回200ms；方宜面板进入220ms、返回180ms。返回以不透明旧页退开露出首页，避免文字交叠。表情和设置分组按实测高度200ms展开/160ms收起，逻辑关闭立即inert并释放返回层，草稿保留；确认卡编辑只有一份实时表单，200ms高度承接和原焦点恢复。祀开场顺序改为小龙落定→店名→印章→首页山水与四角入口20ms错峰，总时长仍1450+190ms，眼睛只在开场短暂注视一次；日常眼动与聊天发送/滚动不在本轮范围。减少动态、切后台、尺寸变化或连续操作均终止残留动画。评审发现收起面板切页时cloneNode遗漏WAAPI中间样式，新增用例先红后绿，冻结后代高度/透明度/变换后复核前后67.59375px与0.00232293一致。126单元、35项不同相关浏览器场景通过，ui54两轮截图检查及录屏；无APK，Android实际帧率和返回键仍待真机验证。


2026-10-18 动效第二轮：四个墨龙改为11–14秒长间隔单次侧瞟，方向/相位错开，大部分时间居中；入口按住时按两眼中心看向触点，松开/取消/失焦/隐藏复原，不改变按钮命中区。开场单次眼神与隐藏/离屏暂停、减少动态保留。聊天仅成功保存的本次用户气泡150ms/3px落定，历史不重播；底部读者收到新消息220ms平顺跟随，滚轮/触摸/按下/翻页键立即中断，翻旧记录和恢复阅读锚点继续即时定位；减少动态或隐藏时立即落底并清理RAF，卸载取消。126单元、21项不同相关浏览器场景与生产构建通过，独立评审无待修项；ui55浅色首页/触点眼神、深色聊天及320小屏检查，保存/表情逻辑不变。无APK，安卓真机流畅度仍待测。

2026-10-18 按用户反馈缩短小龙侧瞟周期：11–14秒→5.5–7秒，四入口延迟改为0/.7/1.4/2.1秒保持错开；开场不变。3项眼动/触点/减少动态及开场浏览器检查通过，无APK。


2026-10-18 返回连续性与删除撤销：快速切页快照冻结页面外层clip/transform/opacity，并保留尚露出的旧背景；恢复原first-child折叠外边距，避免静图下移14px。连点间隔400ms内最多三次过场，之后立即到最终页并清理，静置后恢复，最多保留两层历史画面。当前会话记住账本月份/搜索、设置展开分组和各页面窗口滚动，刷新重置这些浏览状态，不缓存Key草稿；页面仍正常卸载。账目/备忘删除与5秒撤销记录同一数据库事务，支持跨页/快速刷新及多项一起撤销；实际时钟到期即失效、不覆盖同编号新记录，导入/撤销备份恢复时清除旧删除撤销。数据库v3只新增短期deleted表，备份不包含该表。列表删除/恢复以160ms位置承接，减少动态/后台/尺寸变化清理。127单元、25项不同相关浏览器场景及生产构建通过，独立评审修复连续切页历史堆积后复核通过；ui56深浅/320检查，无APK，原生体验待真机验证。


2026-10-18 助手操作能力：API模式支持流水/提醒/备忘的真实查询、新增与唯一目标修改，删除始终为持久确认卡，确认前不删除；方宜/祀保持各自对话人格。新增最多3轮白名单只读查询，回传最多20行/约24k字符及完整匹配合计/截断标识，本轮临时ref绑定真实ID和完整记录指纹；模型不能猜ID，查询中夹带写入不执行。自动写入独立核对当前用户意图、目标域和非否定表达，不以有效JSON当权限；多条匹配追问、含糊时间追问，仅最近未提交且未产生卡片的澄清可延续原指令。API漏报单条明确动作时本地补齐；普通聊天不写入，虚报完成且无动作时改为未落库说明。修改/删除与actionBatch状态同事务，提交前重读指纹，保留原ID/账户/通知编号等未改字段，提醒改时清理旧跳过状态，排程同步失败不会撤销已保存事实。流水/备忘删除沿用5秒撤销。递归canonical序列化替代旧顶层replacer，覆盖嵌套修改内容的去重和并发校验；备份支持新卡且恢复不自动执行。提醒日期查询使用实际发生日期并含午夜，支持schedule:start查原始日期。天气只读当前所选城市缓存并标注新旧，黄历调用本地数据，不提供任意SQL/脚本/密钥修改。134单元、24项不同相关网页与最终构建通过；独立评审问题已复现修复复核，ui57双主题/深浅/320确认卡检查。仅模拟API验收，实际服务商未联调；无APK，手机系统通知送达仍待真机。


2026-10-19: User explicitly authorized APK. Generated 0.7.0/versionCode13 com.qirui.dailyterminal, app label 帝江号; both themes and latest assistant operations included. Fresh web build/cap sync/Gradle assembleDebug succeeded. apksigner v1/v2 verified, certificate matches 0.6.6 (60c0e0248e890612992be285b65cf2e86644077db4a517f9a9c11ef7c14c4608). APK ZIP integrity and all432 dist files verified. Delivered root 帝江号-缘缘庄-0.7.0-安卓.apk,146947522bytes, SHA25614bbd54fc3746656ba1ce57c1069444cc277b26e08d74d4e669f98f127fac1dc. Old visible0.6.6 moved to Recycle Bin per existing latest-only preference. Debug signed personal build; Android notification/keyboard/device QA and real user API provider still untested. Verification references/apk-0.7.0-verification.json.


2026-10-19: User reports APK motion lag, clarified navigation and disclosure opening. Diagnosing-bugs/three-seat council: production touch390x844 DPR2 CPU6 baseline cold worst450ms/warm183ms; per-node snapshot animation queries120 calls13–50ms. Replaced with one subtree animation query; skips closed native disclosure controls without resolving hidden styles. Native/coarse-pointer navigation now bypasses all snapshot/layout/copy preparation and full-page reveal mask, uses180ms transform/opacity; desktop ink continuation remains. Settings folds resolve end flow once, reveal clip + additive sibling FLIP; generic chat drawers retain height flow. Shared parent anchor WeakMap refcount fixes concurrent cleanup (RED→GREEN); overlap/reversal/reduced/focus/snapshot continuity passed. Profiler found gratuitous scrollTo(0) synchronous layout; skip when old and target top0 using pre-navigation scroll snapshot (no post-commit scrollY read), retain actual page restoration.134unit,33distinctrelatedbrowser,latestproductionbuild passed. Final CPU6 warm worst83ms vs183ms; cold400ms remains, p95/longframecounts not consistently improved, so not proof of Android smoothness. Panel3fold paint145→59ms in observed runs. Both fonts already loaded before coldnav, so font-preload assumption rejected; no font/art changes. ui58 two bounded capture batches inspected. adb devices empty. No new APK generated; root0.7.0 remains prior motion. Profiling/reproduction scripts retained, references/performance-0.7/comparison.json.


2026-10-19: User explicitly requested APK after motion fixes. Delivered 帝江号-缘缘庄-0.7.1-安卓.apk, versionCode14,146948665bytes (~140.1MiB), SHA256d8f1f2b709b88e40c40c1bb2aa275a484f282d55132ff09371eeef962a3cbdce. Fresh tsc/Vite build, Capacitor sync and Gradle assembleDebug succeeded; apksigner v1/v2 certificate matches0.7.0; aapt package/version/minSDK verified. ZIP integrity/all432dist resources match. Includes touch/native lightweight navigation, settings fold FLIP+shared cleanup, desktop snapshot batching/hiddenfield skip, redundant top-scroll avoidance. Existing0.7.0 delivery APK moved to Recycle Bin under latest-only preference. Native FPS still untested (adb target list empty). references/apk-0.7.1-verification.json.

## 2026-10-19 Official doodle entrance preview

Replaced only Si home four entry illustrations with official activity doodles: male Endministrator (ledger), female Endministrator (reminders), Perlica (weather), Si (almanac). Minghe and Arcane replace the existing ledger/reminder header illustrations. Startup dragon is retained. Six original MP4/JPG pairs total 1,113,994 bytes; provenance and hashes in references/si-doodle-assets.json and themes/si/SOURCES.txt.

Scene-owned playback mounts at most one video, plays one finite greeting sequence, supports mouse/focus replay, and removes the decoder for reduced motion, background, offscreen, opening stage and unmount. Poster fallback covers failed playback. CSS cropping, edge mask and brightness/multiply (light) or invert/screen (dark) blend original paper into the existing landscape; no original media bytes edited.

Verified: 134 unit tests; 14 distinct relevant browser cases across doodles/startup/chat motion/night palette/paper record forms; production web build. 390px light/dark and business-page screenshots inspected; 320px targets tested. This is web preview only; no APK generated, Android FPS not measured.

### Doodle color correction (2026-10-19)
User rejected the blended/white-ink rendering because characters looked transparent and indistinct. Removed multiply/screen compositing, inversion, brightness filtering and edge masks. Original JPG/MP4 colors now remain opaque in both palettes; a small solid paper backing separates each figure from scenery. Playback logic unchanged. Six focused browser checks pass, including regression assertions for normal blending, no filters/masks and full opacity in home and business headers. Updated light/dark screenshots visually inspected. No APK generated.

### Doodle background correction (2026-10-19)
User also rejected the solid white paper tiles as visually abrupt. Replaced paper tiles with canvas cutout rendering: flood-fill only neutral bright paper connected to the source boundary, close tiny sketch-outline gaps first to preserve pale hair/white clothes, and leave original foreground RGB/opacity unchanged. Original JPG/MP4 files are unchanged. No blend/invert/mask/filter and no tile background. Only a fine paper contour remains around the figures.

Rendering is bounded to 384x216; one shared worker handles flood-fill away from the UI thread. Only the active video samples frames at 80ms intervals with one in-flight video job, while static posters render once. Hidden/reduced/offscreen/startup guards remain. Scratch canvas prevents raw paper flashes while awaiting worker output. An initial synchronous prototype measured ~16-21ms median per frame under desktop 6x CPU slowdown, so that processing was moved off the UI thread; this is not Android FPS validation.

135 unit tests and 7 doodle browser checks pass, production web build passes (worker included). Deep/light screenshots and ledger/reminder illustrations inspected. No APK produced.

### Weather doodle pale-hair fix (2026-10-19)
Reproduced Perlica's 1.2-second turning frame: crown pixel (210,43) at 384x216 changed from original RGBA [219,220,213,255] to alpha 0. This was a cutout leak, not viewport clipping (all sampled horizontal bounds fit). Tightened paper neutrality tolerance from 8 to 5 so slightly green hair stays foreground while truly neutral paper is removed. Verified eight sampled frame pairs visually; head-region holes at 1.2 seconds disappear. Added unit and real MP4/worker regression cases; no sizing/layout or playback changes.

### Weather/almanac white-frame flash fix (2026-10-19)
Reproduced original-media tinted paper frames through the same worker path: Perlica at ~1.46s left only 13,281/82,944 pixels transparent, Si at ~1.21s only 22,842/82,944; these could replace the good canvas with an almost opaque paper rectangle. A 50ms probe across both clips found three frames to hold (Perlica ~1.46s, Si ~1.16/1.21s).

Final behavior: validate all four transparent corners and majority background removal before a worker result is eligible for display. Rejected frames retain the previous valid canvas. Render errors no longer reset ready=false or reveal the raw JPG. Subsequent valid frames/posters resume normally; original colors, pale hair protection and playback limits remain. Original media files unchanged. No APK generated.

Validation: three focused unit tests; real MP4/worker tests for known tinted frames and pale crown; injected worker rejection for both weather/almanac proves the exact canvas checksum is retained and raw posters stay hidden. Existing seven doodle checks also passed. Production web build passed. Full media probe before/after is in references/doodle-white-flash-*.json.

### Heading Minghe size and motion (2026-10-19)
Increased the home heading doodle stage from 44x44 to 64x64, keeping the existing heading row height so the scene and navigation remain in place. Minghe plays first on home entry and can be replayed by tapping the figure (also pointer hover or keyboard focus).

Home heading and four corners now share one five-item playback owner via context, without an extra DOM wrapper. At most one home video mounts: Minghe first, then the four tools. Manual replay replaces the active clip. Startup, reduced-motion, visibility, cutout validation and white-frame retention remain shared with the existing renderer. No APK generated.

Verified: three existing overview unit checks and 13 relevant browser checks, including a new heading size/replay/single-decoder test and 320px clock clearance. Light/dark preview screenshots updated and inspected.

### Larger heading and hover playback (2026-10-19)
User requested another size increase and automatic motion on pointer hover. Heading Minghe is now 84x84 (previously 64x64); heading slot is 60px tall with 124px horizontal reservation. Pointer hover loops the original clip; pointer leave lets the current pass finish. Tap/keyboard activation still replays once. The shared five-figure owner suspends its ordinary timeout only for the actively hovered heading, retaining the one-video budget and reduced-motion/visibility/startup cancellation.

New hover regression waits beyond the normal 2.4s watchdog and verifies actual unpaused playback, single decoder, exit behavior, and 320x568 clock/navigation clearance. Updated light/dark screenshots inspected. No APK generated.

### Independent ink sparrow heading (2026-10-19)
User noticed Minghe was already in the ledger and asked to replace the new heading figure without restoring the old brush-holding spirit. Clarified the six official doodles are all used; user explicitly chose an independent ink animal. Created an original transparent ink sparrow in two registered wing poses with built-in image_gen. Original PNG pixels/alpha retained unchanged; provenance, prompts and hashes saved under themes/si/SOURCES.txt, ink-sparrow.prompt.txt and references/ink-sparrow-hashes.json.

Only the home heading is replaced. Minghe remains in ledger, Arcane in reminders, and the four home entry doodles stay as before. InkSparrow uses an 84px slot, two complementary step opacity poses and a small transform bounce. Mouse hover animates; tap/keyboard activation gives a 1.52s greeting. Both poses must load before animation. Startup/reduced-motion/hidden/offscreen guards pause it. No paper background, filters, raster recoloring or extra video decoder. Home video tour returns to the original four slots; the retired five-slot context and heading hold timeout are removed.

Three-seat review favored an asymmetric plump silhouette, restrained movement and original-asset labeling; main risks were small-size legibility and monopolizing attention. The generated raster is used rather than an illustrated SVG. Light/dark 390px screenshots inspected, 320px time clearance checked. Six focused unit cases, 14 browser cases and production web build passed. No APK generated; Android FPS not measured.

2026-10-21 操作接续与聊天纸面：记账新增/编辑在提交后的布局阶段聚焦并展示金额，关闭/保存/返回恢复实际入口；重复打开同一编辑器保留草稿，保存期间暂停新建/取消。祀聊天保留现有山水、全部内容与控制，减轻外框、分隔线和元信息底色，统一纸底；模型切换保持至少44px触控。普通手机返回首页由原180ms整页入场承接山水，不再另做520ms裁切，开场不变。159单元、43相关浏览器与生产构建通过，320/390深浅视觉检查完成。安卓真实键盘尚未验证；未生成APK。

## 2026-10-21：人物对话整合进原程序

原程序的祀版本默认采用完整小人+当前回复气泡；聊天记录按钮打开原分页记录，再返回人物页。12种祀动作、6种墨魉共用companionPerformance和SiCompanion，与预览共用素材及播放逻辑。原有本地/API设置、人格、工具查询、新增修改、删除确认与持久确认卡继续由AssistantPanel/askAssistant处理，不使用预览的只读提示词，也不读取预览的临时配置。

模型的performance是可选表现字段，不是业务actions。非法表现字段被忽略，合法业务提案继续验证；发生写入/删除的轮次以真实终端回执为准，抑制表演避免待确认时提前庆祝。已保存的performance可随聊天备份恢复，旧聊天/旧备份无需迁移。读取历史不重播动作。页面切换仍保留草稿；人物页读取最新的双方消息，避免较旧历史窗口被当成当前回复。

新素材沿用terminal-public/previews中的生成图；PWA已把该目录的图片纳入按需缓存，不加入大体积预缓存。未改API密钥、真实用户记录或现有APK。方宜继续使用原对话界面。

检查：165项单元测试通过；类型检查通过；新增人物模式、真实任务写入/删除确认恢复、历史位置恢复等浏览器检查通过；网页构建通过。模型联动使用模拟响应，没有使用真实API；安卓键盘/通知和真机性能未实测。未生成APK。

## 2026-10-21：三种独立模式（覆盖上一节的默认祀页说明）

界面模式现为：庄方宜·帝江号 / 祀·水墨缘缘庄 / 祀·秋日茶馆。旧祀模式已恢复原山水首页、Presence与聊天记录界面；完整小人、12动作与6墨魉只属于新增茶馆模式，茶馆另有官方原片首页与Q版功能/底栏入口。顶部按方宜→水墨→茶馆轮换，设置有三个明确选项。旧设置默认仍回到原模式，不自动改成茶馆。

新增settings.appMode记录三种展示方式，visualTheme仍是原两个角色身份，以兼容人格、聊天分页、草稿与旧备份。模式选择事务保存，与预算/AI保存互不覆盖。水墨与茶馆共享祀的聊天与草稿；方宜聊天独立。账本、提醒和AI连接共用。三模式均支持原业务执行与确认；没有生成APK。

## 2026-10-21 茶馆标注五处收整

茶馆底栏改为独立tea-navigation悬浮底座，放大Q角色并分离文字，显式清除继承自水墨的笔刷伪元素、图标红边及旋转，保留三项导航与当前状态。茶馆品牌换为既有1号牌墨魉；对话标题改“茶馆闲话”，记录入口“往日对话”、返回“回到茶桌”，可访问名称与可见文案一致。仅作用于茶馆模式。870×676、390×844、320×640深浅色检查与导航/记录往返通过；未生成APK。


## 2026-10-21 水墨版内部样式收整

仅统一水墨缘缘庄自身的纸墨样式：天气、黄历、设置沿用记账与提醒的展开纸面，标题、细墨边线、输入框和笔刷按钮保持一致；聊天输入区合并为一层纸边。原山水首页、涂鸦、SiPresence、聊天记录和PaperIcon底栏保留。茶馆与方宜保持各自样式，三种模式及数据、业务交互不变。

10项相关浏览器检查与网页构建通过，390像素七页深浅色和320/870像素表单、聊天均已捕获。未生成APK，未做Android真机验证。
