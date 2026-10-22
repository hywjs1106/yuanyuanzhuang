import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const phase=process.argv[2]??'after';
const dir=`.impeccable/review/ink-consistency-${phase}`;await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chromium'});
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:5180/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
const nav=page.getByRole('navigation',{name:'功能导航'});
for(const theme of ['light','dark']){
 if(theme==='dark')await page.getByRole('button',{name:'切换深浅模式'}).click();
 await page.locator(`html[data-terminal-theme=${theme}]`).waitFor();
 for(const name of ['今日','记账','提醒','天气','黄历','助手','设置']){
  if(['今日','助手','设置'].includes(name))await nav.getByRole('button',{name,exact:true}).click();
  else{await nav.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:`打开${name}`,exact:true}).click();}
  await page.evaluate(()=>document.fonts.ready);if(name==='助手')await page.locator('.chat-history-status').waitFor({state:'hidden'});await page.screenshot({path:`${dir}/${name}-${theme}.png`});
 }
}
if(phase==='after'){
 for(const [width,height] of [[320,640],[870,676]]){
  await page.setViewportSize({width,height});
  for(const theme of ['light','dark']){
   if((await page.locator('html').getAttribute('data-terminal-theme'))!==theme)await page.getByRole('button',{name:'切换深浅模式'}).click();
   await page.locator(`html[data-terminal-theme=${theme}]`).waitFor();
   await nav.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开记账',exact:true}).click();await page.getByRole('button',{name:'记一笔',exact:true}).click();await page.screenshot({path:`${dir}/ledger-form-${width}-${theme}.png`});
   await nav.getByRole('button',{name:'助手',exact:true}).click();await page.locator('.chat-history-status').waitFor({state:'hidden'});await page.screenshot({path:`${dir}/chat-${width}-${theme}.png`});
  }
 }
}
await browser.close();console.log(dir);
