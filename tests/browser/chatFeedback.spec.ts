import {test,expect,type Page} from '@playwright/test';
async function setup(page:Page,reduced=true){
 await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.getByRole('button',{name:'设置',exact:true}).click();
 await page.getByLabel('服务地址').fill('https://example.invalid/v1');await page.getByLabel('模型名称',{exact:true}).fill('test');await page.getByLabel('API Key',{exact:true}).fill('test-key');await page.getByRole('button',{name:'保存设置',exact:true}).click();
 await page.route('https://example.invalid/**',route=>route.fulfill({json:{choices:[{message:{content:JSON.stringify({reply:'先核对一下，再决定要不要记。',actions:[{kind:'ledger',direction:'expense',amount:28,date:'2026-10-18',note:'一杯茶与点心',type:'food'}]})}}]}}));
 await page.getByRole('button',{name:'助手',exact:true}).click();await page.getByLabel('和祀说说',{exact:true}).fill('先帮我核对一下这些内容');await page.getByRole('button',{name:'发送',exact:true}).click();await page.locator('.proposal').getByRole('button',{name:'修改',exact:true}).waitFor();
}
test('failed confirmation reports inside its own card, preserves edits and retries without a false seal',async({page})=>{
 await setup(page);await page.evaluate(()=>{const put=IDBObjectStore.prototype.put;(window as unknown as {failWrite:boolean}).failWrite=true;IDBObjectStore.prototype.put=function(...args:Parameters<IDBObjectStore['put']>){if(this.name==='entries'&&(window as unknown as {failWrite:boolean}).failWrite)throw new Error('这次没有写入，请重试');return put.apply(this,args);};});
 const card=page.locator('.proposal');await card.getByRole('button',{name:'确认保存',exact:true}).click();await expect(card.getByRole('alert')).toContainText('没有写入');await expect(card.getByRole('heading')).toHaveText('未保存流水');await expect(card.locator('.proposal-saved-seal')).toHaveCount(0);
 await card.getByRole('button',{name:'修改',exact:true}).click();await card.getByLabel('金额',{exact:true}).fill('32.50');await card.getByRole('button',{name:'应用修改',exact:true}).click();await expect(card.getByRole('alert')).toHaveCount(0);
 await page.evaluate(()=>(window as unknown as {failWrite:boolean}).failWrite=false);await card.getByRole('button',{name:'确认保存',exact:true}).click();await expect(card.locator('.proposal-saved-seal')).toHaveText('已保存');await expect(card).toContainText('32.50');
 expect(await card.locator('.proposal-saved-seal').evaluate(el=>el.getAnimations().length)).toBe(0);
});
test('new reply animates once, a real save seals once, reduced motion cancels it and history never replays',async({page})=>{
 await page.addInitScript(()=>{
  (window as unknown as {replyMotions:string[]}).replyMotions=[];document.addEventListener('animationstart',event=>{(window as unknown as {replyMotions:string[]}).replyMotions.push((event as AnimationEvent).animationName);});
  const animate=Element.prototype.animate;Element.prototype.animate=function(keyframes,options){const a=animate.call(this,keyframes,options);if(typeof options==='object'&&options?.id==='chat-save-seal')a.pause();return a;};
 });
 await setup(page,false);await expect.poll(()=>page.evaluate(()=>(window as unknown as {replyMotions:string[]}).replyMotions.includes('chat-reply-settle'))).toBe(true);
 await page.locator('.proposal').getByRole('button',{name:'确认保存',exact:true}).click();const seal=page.locator('.proposal-saved-seal');await expect(seal).toBeVisible();expect(await seal.evaluate(el=>el.getAnimations().some(a=>a.id==='chat-save-seal'))).toBe(true);
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(()=>seal.evaluate(el=>el.getAnimations().length)).toBe(0);await expect(seal).toHaveText('已保存');
 await page.evaluate(()=>(window as unknown as {replyMotions:string[]}).replyMotions=[]);await page.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'助手',exact:true}).click();await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(400);
 expect(await page.evaluate(()=>(window as unknown as {replyMotions:string[]}).replyMotions.includes('chat-reply-settle'))).toBe(false);
});

test('an explicit offline command exposes its failed write on the card and only a successful retry gets a seal',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.getByRole('button',{name:'助手',exact:true}).click();
 await page.evaluate(()=>{const put=IDBObjectStore.prototype.put;(window as unknown as {failWrite:boolean}).failWrite=true;IDBObjectStore.prototype.put=function(...args:Parameters<IDBObjectStore['put']>){if(this.name==='entries'&&(window as unknown as {failWrite:boolean}).failWrite)throw new Error('本次写入失败');return put.apply(this,args);};});
 await page.getByLabel('和祀说说',{exact:true}).fill('帮我记一下午饭花了28元');await page.getByRole('button',{name:'发送',exact:true}).click();const card=page.locator('.proposal');await expect(card.getByRole('alert')).toContainText('本次写入失败');await expect(card.locator('.proposal-saved-seal')).toHaveCount(0);
 await page.evaluate(()=>(window as unknown as {failWrite:boolean}).failWrite=false);await card.getByRole('button',{name:'确认保存',exact:true}).click();await expect(card.locator('.proposal-saved-seal')).toHaveText('已保存');await expect(card.getByRole('alert')).toHaveCount(0);
});

test('automatic persistence stays saved and read-only when the assistant reply cannot be stored',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.getByRole('button',{name:'助手',exact:true}).click();
 await page.evaluate(()=>{const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args:Parameters<IDBObjectStore['put']>){if(this.name==='messages'&&(args[0] as {role?:string})?.role==='assistant')throw new Error('回复写入失败');return put.apply(this,args);};});
 await page.getByLabel('和祀说说',{exact:true}).fill('帮我记一下午饭花了28元');await page.getByRole('button',{name:'发送',exact:true}).click();
 const card=page.locator('.proposal');await expect(card.getByRole('heading')).toHaveText('已保存流水');await expect(card.getByRole('alert')).toContainText('事项已保存');await expect(card.locator('.proposal-saved-seal')).toHaveText('已保存');await expect(card.getByRole('button')).toHaveCount(0);
});

test('short bubble arrival does not truncate the existing Fangyi sticker playback window',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');await page.getByRole('button',{name:'助手',exact:true}).click();await page.getByLabel('和方宜说说',{exact:true}).fill('谢谢你');await page.getByRole('button',{name:'发送',exact:true}).click();
 const sticker=page.locator('.chat-message.assistant .sticker-message');await expect(sticker).toBeVisible();await page.waitForTimeout(900);await expect(sticker.getByRole('button',{name:'停止这张表情',exact:true})).toBeVisible();
});
