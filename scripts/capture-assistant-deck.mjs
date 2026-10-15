import {chromium} from '@playwright/test';
import fs from 'node:fs';
const out='../references/ui-19';fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({channel:'chromium'});
const c=await b.newContext({viewport:{width:390,height:844},recordVideo:{dir:out+'/video',size:{width:390,height:844}}});
const p=await c.newPage();
async function toggleTheme(){const before=await p.locator('html').getAttribute('data-terminal-theme');await p.getByRole('button',{name:'切换深浅模式'}).click();await p.waitForFunction(value=>document.documentElement.getAttribute('data-terminal-theme')!==value,before);await p.waitForTimeout(100);}
await p.goto('http://127.0.0.1:5180');
await p.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'助手',exact:true}).click();
await p.screenshot({path:out+'/chat-light-empty.png'});
for(const text of ['你好，方宜','今天有点累','帮我记一下午饭花了28元']){
 await p.getByRole('textbox',{name:'和方宜说说'}).fill(text);
 await p.getByRole('button',{name:'发送',exact:true}).click();
 await p.getByRole('button',{name:'发送',exact:true}).waitFor();
 await p.waitForTimeout(200);
 if(text==='今天有点累'){
  await p.screenshot({path:out+'/conversation-light.png'});
  await toggleTheme();await p.screenshot({path:out+'/conversation-dark.png'});
  await toggleTheme();
 }
}
await p.screenshot({path:out+'/chat-light.png'});
await toggleTheme();await p.screenshot({path:out+'/chat-dark.png'});
await p.getByRole('button',{name:'方宜表情',exact:true}).click();await p.screenshot({path:out+'/stickers-dark.png'});
await p.setViewportSize({width:320,height:520});await p.locator('.terminal-shell').evaluate(el=>el.classList.add('keyboard-open'));
await p.screenshot({path:out+'/keyboard-320.png'});
await p.setViewportSize({width:320,height:740});await p.locator('.terminal-shell').evaluate(el=>el.classList.remove('keyboard-open'));
await p.getByRole('button',{name:'方宜表情',exact:true}).click();await p.screenshot({path:out+'/chat-320.png'});
const v=p.video();await c.close();await v.saveAs(out+'/assistant-preview.webm');await b.close();
