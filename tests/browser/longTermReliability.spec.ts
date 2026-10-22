import {test,expect,type Page} from '@playwright/test';
async function configured(page:Page,actions:unknown[]){
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'设置',exact:true}).click();
 await page.getByLabel('服务地址').fill('https://example.invalid/v1');await page.getByLabel('模型名称',{exact:true}).fill('test');await page.getByLabel('API Key',{exact:true}).fill('test-key');await page.getByRole('button',{name:'保存设置',exact:true}).click();await expect(page.getByText('设置已保存',{exact:true})).toBeVisible();
 await page.route('https://example.invalid/**',route=>route.fulfill({json:{choices:[{message:{content:JSON.stringify({reply:'请核对。',actions})}}]}}));
 await page.getByRole('button',{name:'助手',exact:true}).click();
}
test('pending proposals and edits survive navigation, reload, later chats, and confirmation only writes once',async({page})=>{
 await configured(page,[{kind:'ledger',direction:'expense',amount:28,date:'2026-10-18',note:'茶点',type:'food'},{kind:'note',text:'茶叶清单'}]);
 await page.getByLabel('和方宜说说',{exact:true}).fill('帮我核对一下');await page.getByRole('button',{name:'发送',exact:true}).click();const card=page.locator('.proposal').first();await card.getByRole('button',{name:'修改',exact:true}).click();await card.getByLabel('金额',{exact:true}).fill('32.50');await card.getByRole('button',{name:'应用修改',exact:true}).click();await expect(card).toContainText('32.50');
 await page.getByRole('button',{name:'设置',exact:true}).click();await page.getByRole('button',{name:'助手',exact:true}).click();await expect(card).toContainText('32.50');
 await page.reload();await page.getByRole('button',{name:'助手',exact:true}).click();await expect(card).toContainText('32.50');
 await page.route('https://example.invalid/**',route=>route.fulfill({json:{choices:[{message:{content:JSON.stringify({reply:'慢慢来。',actions:[]})}}]}}));await page.getByLabel('和方宜说说',{exact:true}).fill('聊聊今天');await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.getByText('慢慢来。',{exact:true})).toBeVisible();await expect(card).toContainText('32.50');
 await card.getByRole('button',{name:'确认保存',exact:true}).click();await expect(card).toHaveAttribute('data-state','saved');await page.locator('.proposal').filter({hasText:'茶叶清单'}).getByRole('button',{name:'忽略',exact:true}).click();
 await page.reload();await page.getByRole('button',{name:'助手',exact:true}).click();await expect(page.locator('.proposal')).toHaveCount(0);await expect(page.getByRole('log')).toContainText('已记入账簿');
 expect(await page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');return (await terminalDb.messages.toArray()).find(m=>m.actionBatch)?.actionBatch?.states;})).toEqual({0:'已保存',1:'已忽略'});
 await page.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开记账',exact:true}).click();await expect(page.locator('.ledger-item')).toHaveCount(1);await expect(page.locator('.ledger-item')).toContainText('32.50');
});
test('assistant receives the next recurring occurrence and repeat rule instead of the original date',async({page})=>{
 await configured(page,[]);await page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');const {createReminder}=await import('/src/terminal/reminders.ts');await terminalDb.reminders.put(createReminder({title:'每天喝水',startAt:'2020-01-01T09:00',recurrence:'daily'}));});
 let context='';await page.route('https://example.invalid/**',route=>{context=route.request().postDataJSON().messages[1].content;return route.fulfill({json:{choices:[{message:{content:'{"reply":"看到了。","actions":[]}'}}]}});});
 await page.getByLabel('和方宜说说',{exact:true}).fill('下个提醒是什么');await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.getByText('看到了。',{exact:true})).toBeVisible();expect(context).toContain(' · 每天');expect(context).toContain('下次 ');expect(context).not.toContain('2020-01-01');
});
test('ledger budget follows selected month and counts expenses only, including over budget and zero budget',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'设置',exact:true}).click();await page.getByLabel('每月预算').fill('100');await page.getByRole('button',{name:'保存预算',exact:true}).click();await expect(page.getByText('预算已保存',{exact:true})).toBeVisible();
 await page.evaluate(async()=>{const {saveEntry}=await import('/src/terminal/data.ts');const {localDateKey}=await import('/src/terminal/ledger.ts');const date=localDateKey();for(const [id,direction,amount] of [['e','expense',120],['i','income',80],['a','adjust',50]] as const)await saveEntry({id,direction,amount,date,currency:'CNY',source:'manual',createdAt:new Date()});});
 await page.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开记账',exact:true}).click();const budget=page.getByRole('region',{name:'月度预算'});await expect(budget).toContainText('超出 ¥20.00');await expect(budget.getByRole('progressbar')).toHaveAttribute('aria-valuenow','100');await page.getByLabel('月份',{exact:true}).fill('2020-01');await expect(budget).toContainText('剩余 ¥100.00');
 await page.getByRole('button',{name:'设置',exact:true}).click();await page.getByLabel('每月预算').fill('0');await page.getByRole('button',{name:'保存预算',exact:true}).click();await expect(page.getByText('预算已保存',{exact:true})).toBeVisible();await page.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开记账',exact:true}).click();await expect(budget).toContainText('未设置预算');await expect(budget.getByRole('progressbar')).toHaveCount(0);
});

test('unfinished editor draft and role separation survive returning to a proposal',async({page})=>{
 await configured(page,[{kind:'note',text:'原清单'}]);await page.getByLabel('和方宜说说',{exact:true}).fill('核对清单');await page.getByRole('button',{name:'发送',exact:true}).click();const card=page.locator('.proposal');await card.getByRole('button',{name:'修改',exact:true}).click();await card.getByLabel('备忘内容',{exact:true}).fill('还没应用的清单');
 await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await expect(page.locator('.proposal')).toHaveCount(0);await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await card.getByRole('button',{name:'修改',exact:true}).click();await expect(card.getByLabel('备忘内容',{exact:true})).toHaveValue('还没应用的清单');
 await page.reload();await page.getByRole('button',{name:'助手',exact:true}).click();await card.getByRole('button',{name:'修改',exact:true}).click();await expect(card.getByLabel('备忘内容',{exact:true})).toHaveValue('还没应用的清单');await expect(card.getByLabel('备忘内容',{exact:true})).not.toHaveValue('原清单');
});
test('action and committed status are atomic when metadata storage fails, and receipt failure stays saved after reload',async({page})=>{
 await configured(page,[{kind:'ledger',direction:'expense',amount:28,date:'2026-10-18',note:'原子保存',type:'food'}]);await page.getByLabel('和方宜说说',{exact:true}).fill('核对');await page.getByRole('button',{name:'发送',exact:true}).click();const card=page.locator('.proposal');await card.getByRole('button',{name:'修改',exact:true}).waitFor();
 await page.evaluate(()=>{const put=IDBObjectStore.prototype.put;(window as any).failStatus=true;IDBObjectStore.prototype.put=function(...args:any[]){const m=args[0];if(this.name==='messages'&&(window as any).failStatus&&m.actionBatch?.states?.[0]==='已保存')throw new Error('状态写入失败');if(this.name==='messages'&&String(m.id).startsWith('receipt-'))throw new Error('回执写入失败');return put.apply(this,args as any);};});
 await card.getByRole('button',{name:'确认保存',exact:true}).click();await expect(card.getByRole('alert')).toContainText('状态写入失败');expect(await page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');return terminalDb.entries.count();})).toBe(0);
 await page.evaluate(()=>(window as any).failStatus=false);await card.getByRole('button',{name:'确认保存',exact:true}).click();await expect(card.getByRole('alert')).toContainText('事项已保存');await page.reload();await page.getByRole('button',{name:'助手',exact:true}).click();await expect(card).toHaveAttribute('data-state','saved');await expect(card.getByRole('button')).toHaveCount(0);expect(await page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');return terminalDb.entries.count();})).toBe(1);
});

test('next reminder context advances when chat stays open across an occurrence',async({page})=>{
 await page.clock.install({time:new Date(2026,9,18,8,59,50)});await configured(page,[]);await page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');const {createReminder}=await import('/src/terminal/reminders.ts');await terminalDb.reminders.put(createReminder({title:'喝水',startAt:'2020-01-01T09:00',recurrence:'daily'}));});
 let context='';await page.route('https://example.invalid/**',route=>{context=route.request().postDataJSON().messages[1].content;return route.fulfill({json:{choices:[{message:{content:'{"reply":"下一次。","actions":[]}'}}]}});});
 await page.clock.fastForward(20000);await page.getByLabel('和方宜说说',{exact:true}).fill('下个提醒');await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.getByText('下一次。',{exact:true})).toBeVisible();expect(context).toContain('2026-10-19 09:00');expect(context).not.toContain('2026-10-18 09:00');
});
