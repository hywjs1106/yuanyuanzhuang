import {test,expect,type Page} from '@playwright/test';
async function setup(page:Page,actions:unknown[]){
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
 await page.getByRole('navigation').getByRole('button',{name:'设置',exact:true}).click();await page.getByLabel('服务地址').fill('https://example.invalid/v1');await page.getByLabel('模型名称',{exact:true}).fill('test');await page.getByLabel('API Key',{exact:true}).fill('test-key');await page.getByRole('button',{name:'保存设置',exact:true}).click();
 await page.route('https://example.invalid/**',route=>route.fulfill({json:{choices:[{message:{content:JSON.stringify({reply:'这些内容需要你核对。',actions})}}]}}));
 await page.getByRole('navigation').getByRole('button',{name:'助手',exact:true}).click();await page.getByLabel('和祀说说',{exact:true}).fill('这几件事我还没想好，先核对一下');await page.getByRole('button',{name:'发送',exact:true}).click();
}
test('pending card can be edited, cancelled, validated and saved exactly once',async({page})=>{
 await setup(page,[{kind:'ledger',direction:'expense',amount:28,date:'2026-10-17',note:'午饭',type:'food'}]);
 const card=page.locator('.proposal');await card.getByRole('button',{name:'修改',exact:true}).click();await card.getByLabel('金额',{exact:true}).fill('32.50');
 await page.evaluate(()=>window.dispatchEvent(new Event('terminal-back',{cancelable:true})));
 await expect(card.getByLabel('金额',{exact:true})).toHaveCount(0);await expect(card).toContainText('28.00');await expect(card.getByRole('button',{name:'修改',exact:true})).toBeFocused();
 await card.getByRole('button',{name:'修改',exact:true}).click();await card.getByLabel('金额',{exact:true}).fill('1.123');await card.getByRole('button',{name:'应用修改',exact:true}).click();await expect(card.getByRole('alert')).toBeVisible();
 await card.getByLabel('金额',{exact:true}).fill('32.50');await card.getByLabel('备注',{exact:true}).fill('午饭和茶');await card.getByRole('button',{name:'应用修改',exact:true}).click();await expect(card).toContainText('32.50');
 await card.getByRole('button',{name:'确认保存',exact:true}).dblclick();await expect(card.getByRole('heading')).toHaveText('已保存流水');await expect(card.getByRole('button',{name:'修改',exact:true})).toHaveCount(0);
 await page.getByRole('navigation').getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开记账',exact:true}).click();await expect(page.getByText('午饭和茶',{exact:true})).toHaveCount(1);await expect(page.getByText('-¥32.50',{exact:true})).toHaveCount(1);
});
test('back closes the top chat layer and reminder/ledger editor before the surrounding page',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.getByRole('button',{name:'助手',exact:true}).click();
 await page.getByRole('button',{name:'祀表情',exact:true}).click();await page.getByRole('button',{name:'和祀打个招呼',exact:true}).click();
 await page.evaluate(()=>window.dispatchEvent(new Event('terminal-back',{cancelable:true})));await expect(page.getByRole('figure',{name:'祀的随笔画'})).toHaveCount(0);await expect(page.getByRole('region',{name:'祀表情库'})).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.getByRole('region',{name:'祀表情库'})).toHaveCount(0);await expect(page.getByRole('button',{name:'祀表情',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开记账',exact:true}).click();await page.getByRole('button',{name:'记一笔',exact:true}).click();await page.getByLabel('金额',{exact:true}).fill('12');
 const consumed=await page.evaluate(()=>!window.dispatchEvent(new Event('terminal-back',{cancelable:true})));expect(consumed).toBe(true);await expect(page.getByRole('form',{name:'新增流水'})).toHaveCount(0);await expect(page.getByRole('heading',{name:'记账',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开提醒',exact:true}).click();await page.getByRole('button',{name:'新增提醒',exact:true}).click();await page.keyboard.press('Escape');await expect(page.getByRole('form',{name:'新增提醒'})).toHaveCount(0);await expect(page.getByRole('heading',{name:'提醒与生日',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'新增提醒',exact:true})).toBeFocused();
});

test('manual confirmation has a fresh cancellation scope after the request was stopped',async({page})=>{
 await page.addInitScript(()=>{const NativeController=AbortController;const controllers:AbortController[]=[];(window as unknown as {requestControllers:AbortController[]}).requestControllers=controllers;window.AbortController=class extends NativeController{constructor(){super();controllers.push(this);}};});
 await setup(page,[{kind:'ledger',direction:'expense',amount:28,date:'2026-10-17',note:'独立的手动确认',type:'food'}]);
 await page.locator('.proposal').getByRole('button',{name:'修改',exact:true}).waitFor();
 await page.evaluate(()=>(window as unknown as {requestControllers:AbortController[]}).requestControllers.forEach(controller=>controller.abort()));
 await page.locator('.proposal').getByRole('button',{name:'确认保存',exact:true}).click();await expect(page.getByRole('heading',{name:'已保存流水',exact:true})).toBeVisible();
});

test('reminder and note drafts apply edits and ignore never writes a reminder',async({page})=>{
 await setup(page,[{kind:'reminder',title:'浇花',at:'2099-10-18T09:00',repeat:'none'},{kind:'note',text:'买茶叶'}]);
 const reminder=page.locator('.proposal').nth(0);
 await reminder.getByRole('button',{name:'修改',exact:true}).click();await reminder.getByLabel('事项',{exact:true}).fill('给窗边的小花浇水');await reminder.getByLabel('重复',{exact:true}).selectOption('weekly');await reminder.getByRole('button',{name:'应用修改',exact:true}).click();await expect(reminder).toContainText('每周');await reminder.getByRole('button',{name:'忽略',exact:true}).click();
 const note=page.locator('.proposal').last();await note.getByRole('button',{name:'修改',exact:true}).click();await note.getByLabel('备忘内容',{exact:true}).fill('买茉莉花茶和点心');await note.getByRole('button',{name:'应用修改',exact:true}).click();await note.getByRole('button',{name:'确认保存',exact:true}).click();
 await expect(page.getByRole('heading',{name:'已保存备忘',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'已忽略提醒',exact:true})).toHaveCount(0);
 await page.getByRole('navigation').getByRole('button',{name:'设置',exact:true}).click();await page.getByRole('button',{name:'打开备忘',exact:true}).click();await expect(page.getByText('买茉莉花茶和点心',{exact:true})).toBeVisible();
 await page.getByRole('navigation').getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开提醒',exact:true}).click();await expect(page.getByRole('button',{name:/查看提醒：/})).toHaveCount(0);
});

test('a persisted action stays saved if its chat receipt fails and cannot be edited or duplicated',async({page})=>{
 await setup(page,[{kind:'ledger',direction:'expense',amount:28,date:'2026-10-17',note:'已落账但回执失败',type:'food'}]);
 await page.locator('.proposal').getByRole('button',{name:'修改',exact:true}).waitFor();
 await page.evaluate(()=>{const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args:Parameters<IDBObjectStore['put']>){if(this.name==='messages'&&String((args[0] as {id?:string})?.id).startsWith('receipt-'))throw new Error('回执写入失败');return put.apply(this,args);};});
 await page.locator('.proposal').getByRole('button',{name:'确认保存',exact:true}).click();await expect(page.getByRole('heading',{name:'已保存流水',exact:true})).toBeVisible();await expect(page.getByRole('alert')).toContainText('事项已保存');await expect(page.locator('.proposal').getByRole('button')).toHaveCount(0);
 await page.getByRole('navigation').getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开记账',exact:true}).click();await expect(page.getByText('已落账但回执失败',{exact:true})).toHaveCount(1);
});
