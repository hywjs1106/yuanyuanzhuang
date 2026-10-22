import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='references/inn-preview/rooms';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chromium'});const errors=[],geometry=[];
for(const width of [390,320])for(const theme of ['light','dark']){
 const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5180/inn-preview.html');await page.evaluate(()=>document.fonts.ready);
 if(theme==='dark')await page.getByRole('button',{name:'切换深色',exact:true}).click();
 const capture=async name=>{
  await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode().catch(()=>{}))));
  await page.screenshot({path:`${dir}/${name}-${width}-${theme}.png`,fullPage:true});
  geometry.push({name,width,theme,...await page.evaluate(()=>({horizontalOverflow:document.documentElement.scrollWidth>innerWidth,navVisible:document.querySelector('.inn-nav').getBoundingClientRect().bottom<=innerHeight+1,inputOverflow:[...document.querySelectorAll('.inn-form input')].some(i=>{const a=i.getBoundingClientRect(),b=i.closest('.inn-form').getBoundingClientRect();return a.right>b.right||a.left<b.left})}))});
 };
 await capture('today');
 for(const name of ['记账','提醒','天气','黄历']){
  await page.getByRole('button',{name:new RegExp('^'+name)}).click();await capture({'记账':'ledger','提醒':'reminder','天气':'weather','黄历':'almanac'}[name]);
  await page.getByRole('button',{name:'回到今日'}).click();
 }
 await page.getByRole('button',{name:'助手',exact:true}).click();await capture('chat');
 await page.getByRole('button',{name:'设置',exact:true}).click();await capture('settings');await page.close();
}
await writeFile(`${dir}/verification.json`,JSON.stringify({geometry,errors},null,2));
console.log(JSON.stringify({screenshots:geometry.length,errors,layoutProblems:geometry.filter(g=>g.horizontalOverflow||g.inputOverflow||!g.navVisible)}));await browser.close();
if(errors.length||geometry.some(g=>g.horizontalOverflow||g.inputOverflow||!g.navVisible))process.exitCode=1;
