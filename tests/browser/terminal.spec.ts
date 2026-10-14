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
  await page.getByLabel('事项').fill('交电费');
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
test('offline assistant offers a confirmation then creates an entry once',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'助手',exact:true}).click();
  await page.getByLabel('和方宜说说').fill('午饭花了28元');
  await page.getByRole('button',{name:'发送',exact:true}).click();
  await expect(page.getByRole('button',{name:'确认保存',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'确认保存',exact:true}).click();
  await expect(page.getByText('已保存',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'记账',exact:true}).click();
  await expect(page.getByText('午饭花了28元',{exact:true})).toHaveCount(1);
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
