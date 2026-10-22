import {test,expect,type Page} from '@playwright/test';
async function setup(page:Page,character='si'){await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');if(character==='si'){await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-terminal-visual','si');}}

for(const character of ['si','fangyi'])test(`new and edit hand off to amount once and return to the actual opener (${character})`,async({page})=>{
 await setup(page,character);await page.getByRole('button',{name:'打开记账',exact:true}).click();const create=page.getByRole('button',{name:'记一笔',exact:true});await create.click();const amount=page.getByLabel('金额',{exact:true});await expect(amount).toBeFocused();
 const position=await amount.boundingBox();expect(position!.y).toBeGreaterThanOrEqual(0);expect(position!.y+position!.height).toBeLessThan(700);
 await amount.fill('28');await page.getByLabel('备注',{exact:true}).fill('入口衔接测试');await page.getByRole('button',{name:'保存流水',exact:true}).click();await expect(create).toBeFocused();
 const edit=page.getByRole('button',{name:'编辑入口衔接测试',exact:true});await edit.click();await expect(amount).toBeFocused();await expect(amount).toHaveValue('28');
 const account=page.getByLabel('渠道／账户',{exact:true});await account.fill('尚未完成的账户');await page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');await terminalDb.entries.put({id:'background-entry',direction:'expense',amount:3,currency:'CNY',date:new Date().toISOString().slice(0,10),note:'后台刷新',type:'other',createdAt:new Date()});});
 await expect(account).toBeFocused();await expect(account).toHaveValue('尚未完成的账户');await page.keyboard.press('Escape');await expect(edit).toBeFocused();await expect(page.getByRole('form',{name:'编辑流水'})).toHaveCount(0);
 await create.click();await expect(amount).toBeFocused();await page.getByRole('button',{name:'取消',exact:true}).click();await expect(create).toBeFocused();
});

test('reopening an already open ledger editor reveals it again without a delayed focus after close',async({page})=>{
 await setup(page);await page.getByRole('button',{name:'打开记账',exact:true}).click();const create=page.getByRole('button',{name:'记一笔',exact:true});await create.click();await page.getByLabel('备注',{exact:true}).fill('未提交草稿');await create.click();await expect(page.getByLabel('金额',{exact:true})).toBeFocused();await expect(page.getByLabel('备注',{exact:true})).toHaveValue('未提交草稿');await page.keyboard.press('Escape');await expect(create).toBeFocused();await page.waitForTimeout(250);await expect(create).toBeFocused();
});

test('a pending ledger save keeps its editor until the original write finishes',async({page})=>{
 await setup(page);await page.getByRole('button',{name:'打开记账',exact:true}).click();const create=page.getByRole('button',{name:'记一笔',exact:true});await create.click();await page.getByLabel('金额',{exact:true}).fill('28');
 await page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');const put=terminalDb.entries.put.bind(terminalDb.entries);terminalDb.entries.put=(...args:any[])=>new Promise<void>(resolve=>{(window as any).releaseLedgerSave=resolve;}).then(()=>(put as any)(...args)) as any;});
 await page.getByRole('button',{name:'保存流水',exact:true}).click();await expect(page.getByRole('button',{name:'取消',exact:true})).toBeDisabled();await expect(create).toBeDisabled();await page.evaluate(()=>(window as any).releaseLedgerSave());await expect(page.getByRole('form',{name:'新增流水'})).toHaveCount(0);await expect(create).toBeFocused();
});

for(const theme of ['light','dark'])test(`Si reading surfaces share the paper ground with quiet metadata and accessible model controls (${theme})`,async({page})=>{
 await setup(page);if(theme==='dark'){await page.getByRole('button',{name:'切换深浅模式',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-terminal-theme','dark');}
 await page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');await terminalDb.messages.put({id:'material-message',role:'assistant',character:'si',text:'先喝口茶，再慢慢聊。',createdAt:new Date().toISOString()});});await page.getByRole('button',{name:'助手',exact:true}).click();
 const styles=await page.locator('.assistant-chat').evaluate(el=>{const s=getComputedStyle(el);const bar=getComputedStyle(el.querySelector('.ai-source-bar')!);const contact=getComputedStyle(el.querySelector('.fangyi-contact')!);const time=getComputedStyle(el.querySelector('.chat-message time')!);return {frame:s.borderTopWidth,shadow:s.boxShadow,sourceLine:bar.borderBottomWidth,contactLine:contact.borderBottomWidth,timeFill:time.backgroundColor};});
 expect(styles).toEqual({frame:'0px',shadow:'none',sourceLine:'0px',contactLine:'0px',timeFill:'rgba(0, 0, 0, 0)'});
 for(const button of await page.getByRole('group',{name:'对话模型',exact:true}).getByRole('button').all())expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
 await expect(page.locator('.chat-message time')).toBeVisible();await expect(page.getByRole('button',{name:'和祀打个招呼',exact:true})).toBeVisible();await expect(page.getByLabel('和祀说说',{exact:true})).toBeVisible();
});

test('touch return to the painted home uses one page arrival rather than a second clipped reveal',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();await setup(page);await page.getByRole('button',{name:'助手',exact:true}).click();await page.emulateMedia({reducedMotion:'no-preference'});await page.getByRole('button',{name:'今日',exact:true}).click();await expect(page.locator('main')).toHaveAttribute('data-motion-render','direct');
 expect(await page.locator('.si-painted-world').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');await page.waitForTimeout(300);await expect(page.locator('main')).not.toHaveAttribute('data-ink-reveal','true');await expect(page.locator('.ink-route-previous')).toHaveCount(0);await context.close();
});
