import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const dir='../references/ui-49';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chromium'});const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:5180/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
await page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');await terminalDb.messages.bulkPut(Array.from({length:50},(_,i)=>({id:`read-${i}`,role:i%2?'assistant':'user',character:'si',text:i%2?'那就先泡一杯茶，再慢慢说。今天有什么想画进卷子里的事吗？':'今天路上看到了很漂亮的云，想和你聊一会儿。',createdAt:new Date(Date.UTC(2026,9,17,1,i)).toISOString()})));});
await page.getByRole('button',{name:'助手',exact:true}).click();await page.getByLabel('和祀说说',{exact:true}).fill('我还在想下一句，先留在这里……');
for(const theme of ['light','dark']){
 if(theme==='dark'){await page.getByRole('button',{name:'切换深浅模式'}).click();await page.waitForTimeout(220);}
 await page.getByRole('log').evaluate(el=>{el.scrollTop=0;});await page.getByRole('button',{name:'查看更早的消息',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/history-${theme}.png`});
}
await page.locator('[data-message-id="read-25"]').evaluate(el=>el.scrollIntoView({block:'start'}));
await page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');await terminalDb.messages.put({id:'new-reply',role:'assistant',character:'si',text:'新到的消息会在这里等你，不着急。',createdAt:'2099-01-01T00:00:00.000Z'});});
await page.getByRole('button',{name:'最新消息',exact:true}).waitFor();await page.screenshot({path:`${dir}/unread-dark.png`});
await page.setViewportSize({width:320,height:568});await page.screenshot({path:`${dir}/reading-small.png`});
console.log(await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,draft:document.querySelector('.assistant-composer textarea')?.value})));
await browser.close();
