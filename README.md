# 缘缘庄 · 日常终端

以 [YuukiMarine / The Velvet](https://github.com/yuukimarine/the-velvet) 为底座改造的 Android 个人生活助手，也支持网页预览。将记账、提醒、天气、黄历和角色对话放在一起，数据优先保存在本机。

这是独立的个人衍生项目，不是 The Velvet 官方版本，也不是《明日方舟：终末地》官方应用。

## 用什么做的

- **OpenAI Codex / ChatGPT 辅助开发**：在 The Velvet 原有代码基础上，根据使用者需求逐步修改功能、界面、角色提示词、测试和 Android 打包流程，并非从零编写全部代码。
- **React 18 + TypeScript 5 + Vite 5**：界面、组件与应用逻辑。
- **Capacitor 5 + Android 原生通知**：Android 容器及日历提醒排程。
- **Dexie / IndexedDB**：本地流水、提醒、备忘、聊天和配置。
- **自配 OpenAI 兼容 / Anthropic 接口**：支持本地模型与 API 两套配置切换，不内置服务商密钥。
- **lunar-javascript、Open-Meteo / 和风天气**：黄历与天气。
- **Node.js 测试 + Playwright**：功能与浏览器流程检查。
- **部分插画由 AI 图像生成工具辅助制作**；另有官方、第三方素材和字体，各自保留来源，不将全部美术归为原创或统一按代码许可证使用。

## 功能与模式

人民币流水、分类与渠道、月度预算；单次和循环提醒、生日；城市天气、三日预报与缓存；离线农历、节气和传统黄历；备忘、购物清单与备份恢复。

通过对话处理明确的记账、提醒和备忘请求，支持查询与修改，删除需要确认。任务成功以实际执行回执为准。未配置 AI 时仍可手动使用工具，离线对话仅有有限预设和简单指令识别。

| 模式 | 风格与体验 |
| --- | --- |
| 庄方宜 · 帝江号 | 工业风界面与庄方宜风格对话 |
| 祀 · 水墨缘缘庄 | 山水纸面、简笔人物与聊天记录界面 |
| 祀 · 秋日茶馆 | 秋日茶馆、Q版人物在场对话、人物动作及墨魉互动 |

三种模式独立选择；两种祀模式共用聊天和草稿，方宜聊天单独保存。账本、提醒与 AI 配置共用。人物表现属于 AI 角色演绎。

## 本地运行与检查

需要 Node.js 和 npm，保留依赖锁文件：

```sh
npm ci
npm run dev
```

开发地址以终端输出为准。构建与检查：

```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

`npm run build` 会应用项目自带的 Capacitor 通知修补，不要移除 `scripts/patch-terminal-notifications.mjs` 和 `scripts/native`。

主要应用代码在 `src/terminal`，运行素材在 `terminal-public`；原上游代码保留用于沿革和参考，不代表原游戏化功能全部在本版运行。

## Android 构建

需要 JDK 17、Android SDK 与构建工具；SDK 许可由构建者自行接受。SDK 路径填写在本机 `android/local.properties`，不要提交。独立包名为 `com.qirui.dailyterminal`。

```sh
npm run build
npx cap sync android
cd android
```

Windows：

```powershell
.\gradlew.bat assembleDebug '-Pandroid.overridePathCheck=true'
```

macOS / Linux：

```sh
./gradlew assembleDebug
```

发布签名需自行配置，仓库不包含发布用私钥或密钥库。本次上传的是源码，没有新增 APK 发布。

## 数据与验证边界

- API Key、本地模型凭据和个人运行配置不随源码提供；请使用自己的连接配置。
- 接入 AI 后，对话和相关任务上下文会发送到所配置的模型服务。本地优先不代表接入 API 后仍完全离线。
- 天气需要联网，黄历可离线使用。网页可管理提醒，系统定时通知依赖 Android。
- 上传前，167 项单元测试与生产构建通过；相关流程另有浏览器检查。固定模型响应测试不代表验证过全部真实模型。
- 通知送达、后台运行、厂商省电策略及键盘体验仍需具体 Android 设备验证。

## 来源、署名与许可

本项目基于 **YuukiMarine 的 The Velvet（靛蓝色房间）** 修改。感谢原作者的代码与设计工作；上游说明原文保留在 [README.upstream.md](README.upstream.md)。

代码沿用 **GPL-3.0-or-later**，保留 [LICENSE](LICENSE)、原作者 [NOTICE](NOTICE) 及其附加许可说明。更换应用名称与界面不改变原代码的署名与许可。

美术、名称、图标、角色素材、字体和第三方资源不自动适用代码的 GPL 许可。上游素材声明见 [ASSETS_LICENSE](ASSETS_LICENSE)。本版来源记录随资源保留，例如 `terminal-public/characters/SOURCES.txt`、`terminal-public/themes/si/SOURCES.txt`、`terminal-public/previews/SOURCES.md` 和 `terminal-public/licenses`。来源记录不等于获得再次分发或商用授权。

《明日方舟：终末地》相关角色、游戏素材和商标归各自权利人所有；AI 辅助生成素材与官方素材分别记录，请按具体资源的来源和许可处理。
