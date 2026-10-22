import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const dir='../references/ui-48';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chromium'});const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:5180/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.getByRole('navigation').getByRole('button',{name:'设置',exact:true}).click();
await page.getByLabel('服务地址').fill('https://example.invalid/v1');await page.getByLabel('模型名称',{exact:true}).fill('visual-test');await page.getByLabel('API Key',{exact:true}).fill('test-key');await page.getByRole('button',{name:'保存设置',exact:true}).click();
await page.route('https://example.invalid/**',route=>route.fulfill({json:{choices:[{message:{content:JSON.stringify({reply:'先放在这里，你看看要不要改。',actions:[{kind:'ledger',direction:'expense',amount:28.5,date:'2026-10-17',note:'茉莉花茶与点心',type:'food'},{kind:'reminder',title:'给窗边的小花浇水',at:'2099-10-18T09:00',repeat:'weekly'}]})}}]}}));
await page.getByRole('navigation').getByRole('button',{name:'助手',exact:true}).click();await page.getByLabel('和祀说说',{exact:true}).fill('这些事情先帮我核对一下');await page.getByRole('button',{name:'发送',exact:true}).click();
const card=page.locator('.proposal').first();await card.getByRole('button',{name:'修改',exact:true}).waitFor();
for(const theme of ['light','dark']){
 if(theme==='dark'){await page.getByRole('button',{name:'切换深浅模式'}).click();await page.waitForTimeout(250);}
 await card.scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/card-${theme}.png`});
 await card.getByRole('button',{name:'修改',exact:true}).click();await card.getByLabel('金额',{exact:true}).fill('32.50');await card.getByLabel('方向',{exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/edit-${theme}.png`});await card.getByRole('button',{name:'取消修改',exact:true}).click();
}
await page.setViewportSize({width:320,height:568});await card.getByRole('button',{name:'修改',exact:true}).click();await card.getByRole('button',{name:'应用修改',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/edit-small.png`});
console.log(JSON.stringify(await page.locator('.proposal').evaluateAll(rows=>rows.map(e=>({width:e.clientWidth,scroll:e.scrollWidth})))));
await card.getByRole('button',{name:'取消修改',exact:true}).click();await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.screenshot({path:`${dir}/fangyi-chat.png`});
await browser.close();
