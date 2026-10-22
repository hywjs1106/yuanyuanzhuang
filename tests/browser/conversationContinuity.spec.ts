import {test,expect,type Page} from '@playwright/test';
async function seed(page:Page,count=65){
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
 await page.evaluate(async count=>{const {terminalDb}=await import('/src/terminal/data.ts');await terminalDb.messages.bulkPut(Array.from({length:count},(_,i)=>({id:`history-${i}`,role:i%2?'assistant':'user',character:'si',text:`第${i+1}段聊天。今天也想慢慢聊聊，一杯茶，一点有趣的事。`.repeat(3),createdAt:new Date(Date.UTC(2026,9,17,1,i)).toISOString()})));},count);
 await page.getByRole('navigation').getByRole('button',{name:'助手',exact:true}).click();
}
test('each companion keeps unsent text across navigation and reload without sending it',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'助手',exact:true}).click();await page.getByLabel('和方宜说说',{exact:true}).fill('还没想好要不要说的话');
 await page.getByRole('button',{name:'设置',exact:true}).click();await page.getByRole('button',{name:'助手',exact:true}).click();await expect(page.getByLabel('和方宜说说',{exact:true})).toHaveValue('还没想好要不要说的话');
 await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await expect(page.getByLabel('和祀说说',{exact:true})).toHaveValue('');await page.getByLabel('和祀说说',{exact:true}).fill('想和祀一起喝茶');await page.reload();await page.getByRole('button',{name:'助手',exact:true}).click();await expect(page.getByLabel('和祀说说',{exact:true})).toHaveValue('想和祀一起喝茶');await expect(page.locator('.chat-message.user')).toHaveCount(0);
 await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await expect(page.getByLabel('和方宜说说',{exact:true})).toHaveValue('还没想好要不要说的话');
});
test('older history is reachable and reading position survives navigation and new messages',async({page})=>{
 await seed(page);await page.getByRole('button',{name:'往日对话',exact:true}).click();const log=page.getByRole('log',{name:'聊天记录'});
 await log.evaluate(el=>{el.scrollTop=0;});
 const previousTop=page.locator('[data-message-id="history-35"]');const oldOffset=await previousTop.evaluate(el=>el.getBoundingClientRect().top-el.closest('.chat-log')!.getBoundingClientRect().top);
 await page.getByRole('button',{name:'查看更早的消息',exact:true}).click();await expect(page.getByText(/^第6段聊天/)).toBeAttached();await expect.poll(()=>previousTop.evaluate(el=>el.getBoundingClientRect().top-el.closest('.chat-log')!.getBoundingClientRect().top)).toBeCloseTo(oldOffset,0);
 // Pick a stable rendered message independently of the character label.
 const target=page.locator('[data-message-id="history-19"]');await target.evaluate(el=>el.scrollIntoView({block:'start'}));
 const before=await target.evaluate(el=>el.getBoundingClientRect().top-el.closest('.chat-log')!.getBoundingClientRect().top);
 await page.getByRole('button',{name:'回到茶桌',exact:true}).click();
 await expect(page.getByRole('region',{name:'与祀面对面聊天',exact:true}).locator('.si-live-reply')).toContainText('第64段聊天');
 await page.getByRole('button',{name:'往日对话',exact:true}).click();
 await expect.poll(()=>target.evaluate(el=>el.getBoundingClientRect().top-el.closest('.chat-log')!.getBoundingClientRect().top)).toBeCloseTo(before,0);
 await page.getByRole('button',{name:'设置',exact:true}).click();await page.getByRole('button',{name:'助手',exact:true}).click();
 await page.getByRole('button',{name:'往日对话',exact:true}).click();await expect(target).toBeAttached();await expect.poll(()=>target.evaluate(el=>el.getBoundingClientRect().top-el.closest('.chat-log')!.getBoundingClientRect().top)).toBeCloseTo(before,0);
 await page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');await terminalDb.messages.put({id:'new-tail',role:'assistant',character:'si',text:'刚到的新消息，不应该打断阅读。',createdAt:'2099-01-01T00:00:00.000Z'});});
 await expect(page.getByRole('button',{name:'最新消息',exact:true})).toBeVisible();await expect.poll(()=>target.evaluate(el=>el.getBoundingClientRect().top-el.closest('.chat-log')!.getBoundingClientRect().top)).toBeCloseTo(before,0);
 await page.reload();await page.getByRole('button',{name:'助手',exact:true}).click();await page.getByRole('button',{name:'往日对话',exact:true}).click();await expect(target).toBeAttached();await expect(page.getByRole('button',{name:'最新消息',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'最新消息',exact:true}).click();await expect(page.getByRole('button',{name:'最新消息',exact:true})).toHaveCount(0);await expect(page.getByText('刚到的新消息，不应该打断阅读。',{exact:true})).toBeVisible();
});

test('failed user-message writes preserve the unsent draft and sending does not erase the next draft',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'助手',exact:true}).click();
 await page.evaluate(()=>{const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args:Parameters<IDBObjectStore['put']>){if(this.name==='messages')throw new Error('测试消息保存失败');return put.apply(this,args);};});
 await page.getByLabel('和方宜说说',{exact:true}).fill('没有成功保存的这一句');await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.getByRole('alert')).toContainText('测试消息保存失败');await expect(page.getByLabel('和方宜说说',{exact:true})).toHaveValue('没有成功保存的这一句');
 await page.reload();await page.getByRole('button',{name:'助手',exact:true}).click();await expect(page.getByLabel('和方宜说说',{exact:true})).toHaveValue('没有成功保存的这一句');
 await page.getByRole('button',{name:'设置',exact:true}).click();await page.getByLabel('服务地址').fill('https://example.invalid/v1');await page.getByLabel('模型名称',{exact:true}).fill('test');await page.getByLabel('API Key',{exact:true}).fill('test-key');await page.getByRole('button',{name:'保存设置',exact:true}).click();
 let release:()=>void=()=>{};const wait=new Promise<void>(resolve=>{release=resolve;});let requested=false;
 await page.route('https://example.invalid/**',async route=>{requested=true;await wait;await route.fulfill({json:{choices:[{message:{content:JSON.stringify({reply:'收到，慢慢说。',actions:[]})}}]}});});
 await page.getByRole('button',{name:'助手',exact:true}).click();await page.getByRole('button',{name:'发送',exact:true}).click();await expect.poll(()=>requested).toBe(true);await expect(page.getByLabel('和方宜说说',{exact:true})).toHaveValue('');await page.getByLabel('和方宜说说',{exact:true}).fill('这是我正在写的下一句');release();
 await expect(page.getByRole('log')).toContainText('收到，慢慢说。');await expect(page.getByLabel('和方宜说说',{exact:true})).toHaveValue('这是我正在写的下一句');
});




