# Si 官方贴纸与参考双图来源核验

核验日期：2026-10-17。核验对象为用户给出的左右双图截图，及此前保存的官方来源材料。本记录区分“官方素材确证”“同一画作局部确证”与“尚未取得精确原图”。

## 官方贴纸：来源确认，不能代替指定左图

[国际服官方发布：Official Stickers #10](https://x.com/AKEndfield/status/2108044719796154846) 于 2026-10-08 发布，正文直接提供 [Google Drive 原始贴纸目录](https://drive.google.com/drive/folders/1hOIi4psxFPpvAZQFWBcTPPGAFbJLpcrI)。本地 `../references/ui-44/official-pack10/01.png` 至 `16.png` 保存这批原始文件；前八张为 Si，后八张为 Argent。发布正文及下载目录记录分别保存在 `stickers10-global.json`、`stickers-folder.html`，单图清单见该目录 `manifest.json`。

[中文官方 TapTap 贴纸发布页](https://www.taptap.cn/moment/857006468283501226) 的整张展示图保存在 `../references/ui-44/official-stickers10.jpg`，页面保存在同名 HTML。

结论：这批贴纸有明确官方出处，可作为官方表情素材使用；尚不能声称其中包含截图左边“闭眼、红脸、叉腰、周围粉花”的粗线条完整图。该精确左图仍未完成来源和原图核验。

## 截图右图：同一画作已在官方素材中确认，完整原图尚未取得

[日服官方 2026-10-15 活动贴文](https://x.com/AKEndfieldJP/status/2110582688302477560) 正文为「ただの思いつきで描いた絵じゃ。」及请 Si 用该线画风格作画的活动说明。贴文第三张图片 `../references/ui-44/official-jp-2110582688302477560-2.jpg` 显示 Si 肖像的上半身：持笔的黑色手套、头发与发饰、脸部、左侧笔触和右侧长发纹样均与用户截图右图相符。这是同一画作的官方裁切展示，带活动排版，不能视为无字完整原图。

[国际服官方 TikTok：I drew this portrait on a whim](https://www.tiktok.com/@akendfielden/video/7696486396831239455) 的主站页面内嵌数据已读取：作者 `akendfielden`、`verified=true`、视频时长 17 秒。保存的 `portrait-tiktok-data.json` 与 `portrait-tiktok.html` 为该记录。由其封面地址保存的 `official-portrait-cover.jpg`，可见截图右图相同的交叉持笔手势、长条黑色装饰笔触和弯曲膝部轮廓，因此进一步确认官方发布过该画作；封面仅为局部特写。

结论：对“右图所用画作具有官方发布依据”的把握高；对“已经取得截图中完整坐姿、全部长发与下半身的无字原图”不能作肯定表述。现有封面和活动海报只覆盖部分画面。

## 左图与后续线索

另一条官方 TikTok [Minimalist Doodles](https://www.tiktok.com/@akendfielden/video/7696487252456787231) 是与粗线条绘画相关的待核验线索。此次未取得其主站视频、主站内嵌元数据或能与左图逐项比对的原始画面，不能仅凭标题或第三方索引断言它就是左图来源。

## 检索与访问边界

X 正文及媒体地址通过公开 FX 镜像读取并保存，引用仍指向官方原贴；镜像仅作读取通道，不作为官方身份的独立认证。TikTok 的上述元数据来自主站 HTML。视频 CDN 返回 403，正常浏览器未加载视频，未继续绕过访问限制。搜索发现的第三方 TikTok 索引仅提供线索，未用于确证画作身份。

交付时建议将贴纸标作“官方贴纸 #10”，将右侧海报和封面标作“官方同画作局部”，将用户截图的完整左右原图继续标作“待找到原始文件”；不要把另一个作者的相似插画、重绘或裁切补全冒充这两张精确原图。


## Follow-up: exact doodled self-portrait confirmed

The user clarified that the doodle appears when the poster is opened. A public result-post link resolved to the Japanese official account: https://x.com/AKEndfieldJP/status/2110274444816245186 . Its media metadata identifies an animated GIF, delivered as https://video.twimg.com/tweet_video/HUkyn3UbAAADgdM.mp4 . Browser playback verified duration 1.4 seconds, 1138 × 640. A screenshot at 1 second exactly matches the supplied doodle: closed eyes, pink cheeks, hands on hips, thin legs, and pink flowers. This supersedes the earlier unconfirmed status for the LEFT picture only. The complete refined illustration remains unlocated. The official video is embedded remotely in the local reference gallery; no media binary was downloaded.


## 2026-10-19：六张同系列官方动图已定位

通过官方公开嵌入数据 `cdn.syndication.twimg.com/tweet-result?id=2110582688302477560&lang=en&token=1`，读取活动帖的 `unified_card` 轮播结构。六张海报的点击目标是预填分享内容，正文中分别包含六个官方结果帖。仅解析目标地址，未触发分享或发布。六个结果帖均经公开媒体元数据确认 author=AKEndfieldJP、media.type=gif，浏览器逐段加载、播放并查看不同时间点画面。

- 祀：[官方结果帖](https://x.com/AKEndfieldJP/status/2110274444816245186)；1.4 秒，1138×640；[原始动图媒体](https://video.twimg.com/tweet_video/HUkyn3UbAAADgdM.mp4)。
- 男管理员：[官方结果帖](https://x.com/AKEndfieldJP/status/2110274520120709514)；1.65 秒，1138×640；[原始动图媒体](https://video.twimg.com/tweet_video/HUkyn33a4AAkoGf.mp4)。
- 女管理员：[官方结果帖](https://x.com/AKEndfieldJP/status/2110274532275876337)；1.65 秒，1138×640；[原始动图媒体](https://video.twimg.com/tweet_video/HUkyokgaYAAIHY8.mp4)。
- 明河：[官方结果帖](https://x.com/AKEndfieldJP/status/2110274488252395532)；1.65 秒，1138×640；[原始动图媒体](https://video.twimg.com/tweet_video/HUkyn4-bQAAzYt9.mp4)。
- 佩丽卡：[官方结果帖](https://x.com/AKEndfieldJP/status/2110274547895484488)；1.65 秒，1138×640；[原始动图媒体](https://video.twimg.com/tweet_video/HUkyom8aoAAUJWr.mp4)。
- 诀：[官方结果帖](https://x.com/AKEndfieldJP/status/2110274555726209527)；1.25 秒，1138×640；[原始动图媒体](https://video.twimg.com/tweet_video/HUkyn2dbcAEGdgl.mp4)。

名称用中日官网共用英文代号核对：ミンホ / Argent Flow = 明河，オクギ / Arcane = 诀。六段 GIF 均由 X 以 MP4 承载。公开嵌入 JSON、结果帖元数据、清单、播放验证与总览截图保存在 `../references/si-doodle-series/`；`index.html` 为读取远程原始媒体的本地预览页，本轮未下载新的媒体二进制、未修改应用或生成 APK。
