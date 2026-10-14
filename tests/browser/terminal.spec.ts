import { test, expect, type Page } from '@playwright/test';
async function more(page:Page,name:string){await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'更多',exact:true}).click();await page.getByRole('dialog',{name:'更多功能'}).getByRole('button',{name,exact:true}).click();}
test('all feature destinations are reachable from a fixed bottom bar',async({page})=>{
  await page.goto('/');await expect(page.getByRole('heading',{name:'日常终端',exact:true})).toBeVisible();
  const nav=page.getByRole('navigation',{name:'功能导航'});
  const position=await nav.boundingBox();expect(position).not.toBeNull();expect(position!.y).toBeGreaterThan(650);
  await nav.getByRole('button',{name:'更多',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'更多功能'})).toBeVisible();
  await page.getByRole('dialog',{name:'更多功能'}).getByRole('button',{name:'黄历',exact:true}).click();
  await expect(page.getByRole('heading',{name:'黄历',exact:true})).toBeVisible();
  await nav.getByRole('button',{name:'更多',exact:true}).click();await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'更多功能'})).toHaveCount(0);await expect(nav.getByRole('button',{name:'更多',exact:true})).toBeFocused();
});
test('phone user can record, edit and persist ledger and reminders without game onboarding',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'日常终端',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
  await page.screenshot({path:'test-results/mobile-home.png',fullPage:true});
  await page.getByRole('button',{name:'记账',exact:true}).click();
  await page.getByRole('button',{name:'记一笔',exact:true}).click();
  await page.getByLabel('金额').fill('28.50');
  await page.getByLabel('备注').fill('午饭');
  await page.getByRole('button',{name:'保存流水'}).click();
  await expect(page.getByText('午饭',{exact:true})).toBeVisible();
  await page.reload();
  await page.getByRole('button',{name:'记账',exact:true}).click();
  await expect(page.getByText('午饭',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'编辑午饭'}).click();
  await page.getByLabel('金额').fill('30');
  await page.getByRole('button',{name:'保存流水'}).click();
  await expect(page.getByText('-¥30.00',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'提醒',exact:true}).click();
  await page.getByRole('button',{name:'新增提醒',exact:true}).click();
  await page.getByLabel('事项',{exact:true}).fill('交电费');
  await page.getByLabel('日期与时间').fill('2027-01-15T09:00');
  await page.getByLabel('重复').selectOption('monthly');
  await page.getByRole('button',{name:'保存提醒'}).click();
  await expect(page.getByRole('heading',{name:'交电费',exact:true})).toBeVisible();
  await page.reload();
  await page.getByRole('button',{name:'提醒',exact:true}).click();
  await expect(page.getByRole('heading',{name:'交电费',exact:true})).toBeVisible();
  await more(page,'黄历');
  await page.getByLabel('查看日期').fill('2026-02-17');
  await expect(page.getByText(/正月初一/)).toBeVisible();
});
test('offline assistant saves an explicit ledger command once and persists its receipt',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'助手',exact:true}).click();
  await page.getByLabel('和方宜说说').fill('帮我记一下午饭花了28元');
  await page.getByRole('button',{name:'发送',exact:true}).click();
  await expect(page.locator('.chat-message.assistant').last()).toContainText('已记账：');
  await expect(page.getByRole('button',{name:'确认保存',exact:true})).toHaveCount(0);
  await expect(page.getByText('已保存',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'记账',exact:true}).click();
  await expect(page.getByText('帮我记一下午饭花了28元',{exact:true})).toHaveCount(1);
  await expect(page.getByText('-¥28.00',{exact:true})).toHaveCount(1);
  await page.reload();await page.getByRole('button',{name:'记账',exact:true}).click();
  await expect(page.getByText('-¥28.00',{exact:true})).toHaveCount(1);
  await page.getByRole('button',{name:'助手',exact:true}).click();
  await expect(page.locator('.chat-message.assistant').last()).toContainText('已记账：');
});
test('configured AI supports multiple confirmed actions and rejects malformed proposals',async({page})=>{
  let malformed=false;
  await page.route('https://example.invalid/**',async route=>{await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({choices:[{message:{content:JSON.stringify(malformed?{reply:'坏数据',actions:[{kind:'ledger',amount:-99,direction:'expense',date:'2026-10-14'}]}:{reply:'请逐项确认',actions:[{kind:'ledger',amount:12,direction:'expense',date:'2026-10-14',note:'咖啡',type:'food'},{kind:'note',text:'明天带书'}]})}}]})});});
  await page.goto('/');await more(page,'设置');
  await page.getByLabel('服务地址').fill('https://example.invalid/v1');await page.getByLabel('模型名称').fill('test-model');await page.getByLabel('API Key',{exact:true}).fill('test-only-key');await page.getByRole('button',{name:'保存设置'}).click();
  await page.getByRole('button',{name:'助手',exact:true}).click();await page.getByLabel('和方宜说说').fill('咖啡十二元，备忘明天带书');await page.getByRole('button',{name:'发送',exact:true}).click();
  await expect(page.getByRole('button',{name:'确认保存'})).toHaveCount(2);
  await page.getByRole('button',{name:'确认保存'}).first().click();await expect(page.getByText('已保存',{exact:true})).toHaveCount(1);await page.getByRole('button',{name:'确认保存'}).click();
  await more(page,'备忘');await expect(page.getByText('明天带书',{exact:true})).toBeVisible();
  malformed=true;await page.getByRole('button',{name:'助手',exact:true}).click();await page.getByLabel('和方宜说说').fill('测试异常');await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.getByRole('alert')).toBeVisible();await expect(page.getByRole('button',{name:'确认保存'})).toHaveCount(0);
});
test('backup exports, restore previews counts, and bad input does not replace live data',async({page})=>{
  await page.goto('/');await more(page,'备忘');await page.getByLabel('写点什么').fill('测试备忘');await page.getByRole('button',{name:'保存备忘'}).click();await expect(page.getByText('测试备忘',{exact:true})).toBeVisible();
  await more(page,'设置');
  const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'导出备份'}).click();const download=await downloaded;const file=await download.path();expect(file).toBeTruthy();
  await page.getByLabel('选择备份文件').setInputFiles(file!);await expect(page.getByText(/准备恢复：0 笔流水、0 个提醒、1 条备忘/)).toBeVisible();await page.getByRole('button',{name:'确认替换并恢复'}).click();await expect(page.getByText('已恢复备份，系统提醒正在重新排程',{exact:true})).toBeVisible();
  await page.getByLabel('选择备份文件').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"format":"broken"}')});await expect(page.getByRole('alert')).toContainText('完整备份');await more(page,'备忘');await expect(page.getByText('测试备忘',{exact:true})).toBeVisible();
});
test('city selection displays mapped weather and network failure preserves last valid results',async({page})=>{
  let fail=false;await page.route('https://geocoding-api.open-meteo.com/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({results:[{name:'北京',latitude:39.9,longitude:116.4,admin1:'北京'}]})}));
  const date=new Date();const day=(offset:number)=>{const d=new Date(date);d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  await page.route('https://api.open-meteo.com/**',route=>route.fulfill({status:fail?503:200,contentType:'application/json',body:JSON.stringify({utc_offset_seconds:28800,current:{temperature_2m:22,relative_humidity_2m:50,apparent_temperature:21,is_day:1,weather_code:3,time:`${day(0)}T12:00`},daily:{time:[day(0),day(1),day(2)],weather_code:[3,61,0],temperature_2m_max:[23,20,22],temperature_2m_min:[14,12,13],precipitation_sum:[0,2,0],precipitation_probability_max:[10,70,0]}})}));
  await page.goto('/');await more(page,'天气');await page.getByLabel('搜索城市').fill('北京');await page.getByRole('button',{name:'搜索城市',exact:true}).click();await page.getByRole('button',{name:/选择 北京/}).click();await expect(page.getByText('22°',{exact:true})).toBeVisible();
  fail=true;await page.getByRole('button',{name:'刷新天气'}).click();await expect(page.getByRole('alert')).toBeVisible();await expect(page.getByText('22°',{exact:true})).toBeVisible();
});

test('portrait widths, themes and conversation keep controls accessible',async({page})=>{
  await page.goto('/');
  for(const width of [320,375,414,768]){await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await expect(page.getByRole('navigation',{name:'功能导航'})).toBeVisible();}
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'test-results/home-light.png'});
  await page.getByRole('button',{name:'切换深浅模式',exact:true}).click();await page.screenshot({path:'test-results/home-dark.png'});
  await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'助手',exact:true}).click();
  await expect(page.getByRole('heading',{name:'庄方宜',exact:true})).toBeVisible();
  await page.getByLabel('和方宜说说').fill('今天有点累');await page.getByRole('button',{name:'发送',exact:true}).click();
  await expect(page.getByText(/先歇一歇也无妨/)).toBeVisible();await expect(page.getByRole('button',{name:'确认保存',exact:true})).toHaveCount(0);
  await page.getByLabel('和方宜说说').scrollIntoViewIfNeeded();const send=await page.getByRole('button',{name:'发送',exact:true}).boundingBox();const nav=await page.getByRole('navigation',{name:'功能导航'}).boundingBox();expect(send!.y+send!.height).toBeLessThanOrEqual(nav!.y);
  await page.screenshot({path:'test-results/assistant-dark.png'});
});

test('Android resized WebView hides the dock while editing and restores it after keyboard closes',async({page})=>{
 await page.goto('/');await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'助手',exact:true}).click();await page.getByLabel('和方宜说说').focus();
 await page.evaluate(()=>{Object.defineProperty(window,'innerHeight',{configurable:true,value:544});Object.defineProperty(window.visualViewport!,'height',{configurable:true,value:544});window.dispatchEvent(new Event('resize'));});
 await expect(page.getByRole('navigation',{name:'功能导航',includeHidden:true})).toBeHidden();await expect(page.getByLabel('和方宜说说')).toBeVisible();
 await page.evaluate(()=>{Object.defineProperty(window,'innerHeight',{configurable:true,value:844});Object.defineProperty(window.visualViewport!,'height',{configurable:true,value:844});window.dispatchEvent(new Event('resize'));});
 await expect(page.getByRole('navigation',{name:'功能导航'})).toBeVisible();
});

test('character portrait and expressions load locally without changing saved conversations',async({page})=>{
 await page.goto('/');await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'助手',exact:true}).click();
 const avatar=page.getByRole('img',{name:'庄方宜头像',exact:true}).first();await expect(avatar).toBeVisible();await expect.poll(()=>avatar.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBeTruthy();
 await page.getByRole('button',{name:'方宜表情',exact:true}).click();await page.getByRole('button',{name:'播放探头表情',exact:true}).click();
 const expression=page.getByRole('img',{name:'方宜探头表情',exact:true});await expect(expression).toBeVisible();await expect.poll(()=>expression.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBeTruthy();
 await page.getByRole('button',{name:'停止表情',exact:true}).click();await expect(expression).toHaveCount(0);
 await page.getByLabel('和方宜说说').fill('你好');await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.getByText(/管理员，我在/)).toBeVisible();
 await expect(page.locator('.chat-message.user')).toHaveCount(1);await expect(page.locator('.chat-message.assistant')).toHaveCount(1);await page.reload();await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'助手',exact:true}).click();await expect(page.getByText(/管理员，我在/)).toBeVisible();await expect(page.getByRole('button',{name:'确认保存',exact:true})).toHaveCount(0);
});
test('long conversations remain readable at 320px with visible composer and reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:320,height:740});await page.goto('/');await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'助手',exact:true}).click();
 await page.getByLabel('和方宜说说').fill('今天有点累，'+ '这是一段很长的日常感想。'.repeat(25));await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.getByText(/先歇一歇也无妨/)).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.getByRole('button',{name:'方宜表情',exact:true}).click();await expect(page.getByRole('img',{name:'方宜忙碌表情',exact:true})).toHaveCount(0);await expect(page.getByRole('img',{name:'方宜探头表情',exact:true})).toHaveCount(0);
});

test('all eight surfaces fit narrow phones and new replies respect the reader',async({page})=>{
 await page.goto('/');
 for(const width of [320,414]){await page.setViewportSize({width,height:740});for(const name of ['今日','记账','提醒','助手','天气','黄历','备忘','设置']){if(['天气','黄历','备忘','设置'].includes(name))await more(page,name);else await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name,exact:true}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name} ${width}px`).toBeTruthy();}}
 await page.setViewportSize({width:390,height:844});await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'助手',exact:true}).click();
 await page.getByLabel('和方宜说说').fill('这是一段历史消息。'.repeat(90));await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.locator('.chat-message.assistant')).toHaveCount(1);
 const log=page.getByRole('log',{name:'聊天记录'});await log.evaluate(el=>{el.scrollTop=0;el.dispatchEvent(new Event('scroll'));});
 await page.getByLabel('和方宜说说').fill('你好');await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.getByRole('button',{name:'最新消息',exact:true})).toBeVisible();expect(await log.evaluate(el=>el.scrollTop)).toBeLessThan(10);
 await page.getByRole('button',{name:'最新消息',exact:true}).click();await expect(page.getByRole('button',{name:'最新消息',exact:true})).toHaveCount(0);expect(await log.evaluate(el=>el.scrollHeight-el.clientHeight-el.scrollTop)).toBeLessThan(10);
 await page.getByRole('button',{name:'方宜表情',exact:true}).click();await page.getByRole('button',{name:'播放忙碌表情',exact:true}).click();await expect(page.getByRole('img',{name:'方宜忙碌表情',exact:true})).toBeVisible();await page.screenshot({path:'test-results/assistant-expression.png'});await expect(page.getByRole('img',{name:'方宜忙碌表情',exact:true})).toHaveCount(0,{timeout:6500});
});

test('expression controls cannot clip the composer in a short keyboard viewport',async({page})=>{
 await page.goto('/');await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'助手',exact:true}).click();await page.getByRole('button',{name:'方宜表情',exact:true}).click();await page.getByLabel('和方宜说说').focus();await page.setViewportSize({width:390,height:400});
 await expect(page.getByRole('navigation',{name:'功能导航',includeHidden:true})).toBeHidden();const panel=await page.getByRole('region',{name:'与庄方宜的对话'}).boundingBox();const composer=await page.getByLabel('和方宜说说').boundingBox();expect(composer!.y+composer!.height).toBeLessThanOrEqual(panel!.y+panel!.height);expect(composer!.y+composer!.height).toBeLessThanOrEqual(400);
});

test('mission selection follows current data through edits, completion and deletion',async({page})=>{
 await page.goto('/');await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'提醒',exact:true}).click();
 for(const title of ['交电费','寄快递']){await page.getByRole('button',{name:'新增提醒',exact:true}).click();await page.getByLabel('事项',{exact:true}).fill(title);await page.getByLabel('日期与时间').fill('2027-01-15T09:00');await page.getByRole('button',{name:'保存提醒',exact:true}).click();await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();}
 await page.getByRole('button',{name:'查看提醒：交电费',exact:true}).click();await expect(page.getByRole('heading',{name:'交电费',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'寄快递',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'编辑',exact:true}).click();await page.getByLabel('事项',{exact:true}).fill('交水电费');await page.getByRole('button',{name:'保存提醒',exact:true}).click();await expect(page.getByRole('button',{name:'查看提醒：交水电费',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'完成',exact:true}).click();await expect(page.getByText('已完成',{exact:true}).last()).toBeVisible();await page.getByRole('button',{name:'删除',exact:true}).click();await expect(page.getByRole('heading',{name:'寄快递',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'查看提醒：交水电费',exact:true})).toHaveCount(0);await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'今日',exact:true}).click();await expect(page.getByRole('main').getByText('1 项待提醒',{exact:true})).toBeVisible();
 await page.reload();await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'提醒',exact:true}).click();await expect(page.getByRole('heading',{name:'寄快递',exact:true})).toBeVisible();await page.screenshot({path:'test-results/reminders-04.png'});
});
test('radial overview shortcuts navigate to their real destinations',async({page})=>{
 await page.goto('/');for(const [label,target] of [['打开记账','记账'],['打开提醒','提醒与生日'],['打开天气','天气'],['打开黄历','黄历']]){await page.getByRole('button',{name:label,exact:true}).click();await expect(page.getByRole('heading',{name:target,exact:true})).toBeVisible();await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'今日',exact:true}).click();}
 await page.getByRole('button',{name:'与庄方宜对话',exact:true}).click();await expect(page.getByRole('heading',{name:'庄方宜',exact:true})).toBeVisible();
});

test('natural explicit reminders save while casual and ambiguous chat creates no records',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'助手',exact:true}).click();
 for(const text of ['午饭花了28元','明天九点提醒我寄快递','今天有点累']){
  await page.getByLabel('和方宜说说').fill(text);await page.getByRole('button',{name:'发送',exact:true}).click();
  await expect(page.locator('.chat-message.assistant')).toHaveCount(['午饭花了28元','明天九点提醒我寄快递','今天有点累'].indexOf(text)+1);
  await expect(page.getByRole('button',{name:'确认保存',exact:true})).toHaveCount(0);
 }
 await page.getByRole('button',{name:'记账',exact:true}).click();await expect(page.getByText('-¥28.00',{exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'提醒',exact:true}).click();await expect(page.getByRole('button',{name:/查看提醒：/})).toHaveCount(0);
 await page.getByRole('button',{name:'助手',exact:true}).click();await page.getByLabel('和方宜说说').fill('明天上午九点提醒我交电费');await page.getByRole('button',{name:'发送',exact:true}).click();
 await expect(page.locator('.chat-message.assistant').last()).toContainText('已添加提醒：交电费');await expect(page.getByRole('button',{name:'确认保存',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'提醒',exact:true}).click();await expect(page.getByRole('button',{name:'查看提醒：交电费',exact:true})).toHaveCount(1);
 await page.reload();await page.getByRole('button',{name:'提醒',exact:true}).click();await expect(page.getByRole('heading',{name:'交电费',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:/查看提醒：/})).toHaveCount(1);
});

test('assistant sends contextual stickers and restores history as static posters',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'助手',exact:true}).click();await page.getByLabel('和方宜说说').fill('谢谢你');await page.getByRole('button',{name:'发送',exact:true}).click();
 const sticker=page.locator('.chat-message.assistant .sticker-message__image');await expect(sticker).toHaveCount(1);await expect(sticker).toHaveAttribute('src','/characters/stickers/fy-01-17.webp');
 await expect.poll(()=>sticker.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBeTruthy();await page.screenshot({path:'test-results/assistant-sticker.png'});
 await page.reload();await page.getByRole('button',{name:'助手',exact:true}).click();await expect(sticker).toHaveAttribute('src','/characters/stickers/fy-01-17.jpg');await expect(page.getByRole('button',{name:'播放表情：点赞',exact:true})).toBeVisible();
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByLabel('和方宜说说').fill('晚安');await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.locator('.chat-message.assistant .sticker-message__image').last()).toHaveAttribute('src','/characters/stickers/fy-01-04.jpg');
});

test('178 sticker gallery paginates and filters without mounting every image',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'助手',exact:true}).click();await page.getByRole('button',{name:'方宜表情',exact:true}).click();
 const gallery=page.getByRole('region',{name:'方宜表情库',exact:true});await expect(gallery.getByText('共 178 张',{exact:true})).toBeVisible();await expect(gallery.locator('.sticker-picker__item')).toHaveCount(24);
 const firstTitle=await gallery.locator('.sticker-picker__item').first().getAttribute('title');await gallery.getByRole('button',{name:'下一页表情',exact:true}).click();expect(await gallery.locator('.sticker-picker__item').first().getAttribute('title')).not.toBe(firstTitle);await expect(gallery.getByText('178 张 · 2 / 8',{exact:true})).toBeVisible();
 await gallery.getByLabel('表情搜索').fill('fy-11-18');await expect(gallery.locator('.sticker-picker__item')).toHaveCount(1);await expect(gallery.getByRole('button',{name:'选择表情：火焰背景抬手',exact:true})).toBeVisible();await expect(gallery.getByRole('button',{name:'下一页表情',exact:true})).toBeDisabled();
 await gallery.getByLabel('表情搜索').fill('不存在的表情');await expect(gallery.getByText('没有找到这类表情，换个词试试。',{exact:true})).toBeVisible();
 await gallery.getByLabel('表情搜索').fill('');await gallery.getByLabel('表情分组').selectOption('11');await expect(gallery.locator('.sticker-picker__item')).toHaveCount(18);await page.screenshot({path:'test-results/sticker-gallery.png'});
});

test('configured model stickers persist and unknown IDs preserve text without loading images',async({page})=>{
 let unknown=false;await page.route('https://example.invalid/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({choices:[{message:{content:JSON.stringify({reply:unknown?'未知表情仍然正常回复':'收到你的感谢。',actions:[],stickerId:unknown?'untrusted-unknown-id':'fy-01-17'})}}]})}));
 await page.goto('/');await more(page,'设置');await page.getByLabel('服务地址').fill('https://example.invalid/v1');await page.getByLabel('模型名称').fill('test-model');await page.getByLabel('API Key',{exact:true}).fill('test-only-key');await page.getByRole('button',{name:'保存设置'}).click();
 await page.getByRole('button',{name:'助手',exact:true}).click();await page.getByLabel('和方宜说说').fill('谢谢');await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.locator('.chat-message.assistant').last()).toContainText('收到你的感谢。');await expect(page.locator('.chat-message.assistant .sticker-message__image')).toHaveAttribute('src','/characters/stickers/fy-01-17.webp');await page.screenshot({path:'test-results/assistant-model-sticker.png'});
 await page.reload();await page.getByRole('button',{name:'助手',exact:true}).click();await expect(page.locator('.chat-message.assistant .sticker-message__image')).toHaveAttribute('src','/characters/stickers/fy-01-17.jpg');unknown=true;
 await page.getByLabel('和方宜说说').fill('继续聊聊');await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.locator('.chat-message.assistant').last()).toContainText('未知表情仍然正常回复');await expect(page.locator('.chat-message.assistant').last().locator('.sticker-message')).toHaveCount(0);await expect(page.getByRole('alert')).toHaveCount(0);
});

test('model metadata variations cannot turn one explicit command into duplicate ledger writes',async({page})=>{
 await page.route('https://example.invalid/**',async route=>{const date=new Date();const day=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({choices:[{message:{content:JSON.stringify({reply:'收到',actions:[{kind:'ledger',amount:28,direction:'expense',date:day,note:'午饭',type:'food'},{kind:'ledger',amount:28,direction:'expense',date:day,note:'午餐重复',type:'other'}]})}}]})});});
 await page.goto('/');await more(page,'设置');await page.getByLabel('服务地址').fill('https://example.invalid/v1');await page.getByLabel('模型名称').fill('test-model');await page.getByLabel('API Key',{exact:true}).fill('test-only-key');await page.getByRole('button',{name:'保存设置'}).click();
 await page.getByRole('button',{name:'助手',exact:true}).click();await page.getByLabel('和方宜说说').fill('帮我记一下午饭花了28元');await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.locator('.chat-message.assistant').last()).toContainText('额外重复操作已忽略，未执行。');await expect(page.getByRole('button',{name:'确认保存',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'记账',exact:true}).click();await expect(page.getByText('-¥28.00',{exact:true})).toHaveCount(1);await expect(page.getByText('午饭',{exact:true})).toHaveCount(1);await expect(page.getByText('午餐重复',{exact:true})).toHaveCount(0);
 await page.reload();await page.getByRole('button',{name:'记账',exact:true}).click();await expect(page.getByText('-¥28.00',{exact:true})).toHaveCount(1);
});

test('overview separates clickable modules and date from terrain and honors reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
 for(const width of [320,390,768]){
  await page.setViewportSize({width,height:844});const map=await page.locator('.hub-map-stage').boundingBox();const date=await page.locator('.overview-date').boundingBox();expect(map).not.toBeNull();expect(date).not.toBeNull();expect(date!.y+date!.height).toBeLessThanOrEqual(map!.y);
  const boxes=await page.locator('.hub-modules button').evaluateAll(elements=>elements.map(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom};}));expect(boxes).toHaveLength(4);
  for(const box of boxes)expect(box.y).toBeGreaterThanOrEqual(map!.y+map!.height);
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];expect(a.right<=b.x||b.right<=a.x||a.bottom<=b.y||b.bottom<=a.y).toBeTruthy();}
 }
 const contours=page.locator('.hub-topographic-lines');expect(await contours.evaluate(el=>getComputedStyle(el).animationName)).not.toBe('none');
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/home-separated-modules.png'});await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(()=>contours.evaluate(el=>getComputedStyle(el).animationName)).toBe('none');await expect.poll(()=>page.locator('.hub-land-contours').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});
