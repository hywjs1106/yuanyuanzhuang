# 日常终端 · Android 个人版 0.3.0

以 [The Velvet](https://github.com/yuukimarine/the-velvet) 为底座的个人生活助手。保留 GPL-3.0-or-later 许可证和上游作者署名；运行入口、应用名称和图标已替换，原游戏源码留作参考，不进入本版应用的运行路径。Velvet 原美术不随安装包分发。

已实现：人民币流水新增／编辑／删除、分类与渠道、月度预算；自配 OpenAI 兼容或 Anthropic AI（操作逐项确认）；实时天气、城市选择、三日预报与缓存；安卓单次／每天／每周／每月／每年提醒、完成／暂停／编辑／删除／稍后；离线农历、节气、节日和完整传统黄历；备忘、购物清单、完整备份与恢复。

## 在手机上使用

把 `日常终端-0.3.0-安卓.apk` 传到手机后安装。应用是独立包，不会覆盖官方 Velvet。

1. 天气页先选择城市，默认 Open-Meteo 无需 Key；也可填写自己的和风 Host／Key。
2. 提醒页允许通知，并检查“准点提醒权限”，用“测试通知”验证手机设置。每月31日和每年2月29日会跳过不存在的日期；生日按公历。
3. 设置页填写自己的 AI 地址、模型和 Key。不配置也能手动使用所有功能，并可离线识别简单记账句子。
4. 备份不包含任何 API Key。恢复替换记录前显示数量，自动保留一份导入前快照供撤销；本机已配置的 AI 与天气凭据及其目标地址不被备份改写。

天气早报是可选功能：依据最近获取的三日预报在设定时间提醒带伞等，打开天气页后重新安排。当前没有后台自动取天气，预报范围之外不会发送。网页预览可管理提醒，定时通知只在安卓安装包执行。

## 已验证与边界

51项功能测试、12条手机浏览器流程、10个原生日历日期案例通过；TypeScript/Vite生产构建、原生Java编译和资源链接通过。AI请求流程使用固定响应测试，未使用用户真实API Key；Open-Meteo实时取数已成功，和风需要用户凭据。没有连接安卓手机，因此应用关闭／手机重启后的通知送达、厂家省电限制以及原生分享备份仍需真机检查。

## 从源码构建

保留当前 `package-lock.json`。Node.js、JDK17、Android SDK33及构建工具必须已安装。SDK首次安装的许可需要使用者接受。

```powershell
npm ci
npm test
npm run test:browser
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug '-Pandroid.overridePathCheck=true'
```

`npm run build`会应用可重复的Capacitor通知修补，不能删掉 `scripts/patch-terminal-notifications.mjs` 和 `scripts/native`：它们保证每月／每年按真实日历日期重复，而非固定毫秒间隔。测试浏览器可用 `npx playwright install chromium --no-shell` 安装。SDK目录写在自己的 `android/local.properties`，不要把本机目录或密钥分发出去。

源码目录 `src/terminal` 为本次功能实现；沿用 `src/utils/aiClient.ts`、AI传输与天气基础服务及原流水类型。生产静态素材只来自 `terminal-public`。GPL及日历库MIT声明在该目录随包提供。

## 0.2 界面与助手

参考游戏内菜单的环形刻度、等高线、工业面板和黄色选中态，以原创SVG/CSS重做手机布局。底部为今日、记账、助手、提醒、更多；更多展开天气、黄历、备忘、设置。浅深主题共用同一套样式。

庄方宜风格助手依据人物资料与第二章《大器晚成》《志同道合》对白改写，属于角色演绎；接入自选AI后支持上下文闲聊，未配置时仅有限离线预设。操作逐项确认。资料依据及改编边界见 docs/character-persona-notes.md。0.2 没有角色音频或游戏美术。字体使用Noto Sans SC，OFL许可随包提供。

与0.1使用相同包名及签名，可直接覆盖升级保留本地记录；不要先卸载。新界面、通知权限、键盘和安卓返回键仍需真机确认。

## 0.3 通讯界面与人物素材

根据 Baker-Dx 的实际游戏聊天截图重做联系人、人物头像、左右气泡、时间/日期与独立输入栏；接下来/天气以简洁功能区显示，城市配置在天气页。表情按钮可播放庄方宜忙碌/探头两张公开GIF，5秒后停止；系统减少动态效果时显示静态头像。阅读旧消息时不会自动跳到底部，可按“最新消息”返回。

人物头像及夏雪NazuYuki动图的作者/来源保留在 terminal-public/characters/SOURCES.txt，属于用户个人构建的素材，不属于应用代码的GPL许可；来源记录不代表公开再分发授权。没有下载私信获取的Windows美化包。参考阅读细节见 docs/terminal-03-reference-study.md。

0.3与0.1/0.2保持同一包名、签名和数据格式，可覆盖升级；不需要先卸载。
