import {test,expect,type Page} from '@playwright/test';
async function si(page:Page){await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-terminal-visual','si');}

test('one touch sends while the composer remains focused and the keyboard layout stays in place',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();await si(page);await page.getByRole('button',{name:'助手',exact:true}).click();
 const field=page.getByLabel('和祀说说',{exact:true});await field.fill('今天想聊聊窗边的小鸟');await field.focus();
 await page.evaluate(()=>{const viewport=visualViewport!;Object.defineProperty(viewport,'height',{configurable:true,get:()=>500});viewport.dispatchEvent(new Event('resize'));});
 await expect(page.locator('.terminal-shell')).toHaveClass(/keyboard-open/);
 const send=page.getByRole('button',{name:'发送',exact:true});const bounds=await send.boundingBox();expect(bounds).not.toBeNull();
 expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(500);
 await page.mouse.move(bounds!.x+bounds!.width/2,bounds!.y+bounds!.height/2);await page.mouse.down();
 await expect(field).toBeFocused();await expect(page.locator('.terminal-shell')).toHaveClass(/keyboard-open/);await page.mouse.up();
 await expect(page.locator('.chat-message.user')).toHaveCount(1);await expect(field).toHaveValue('');await expect(field).toBeFocused();
 expect(await page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');return (await terminalDb.messages.toArray()).filter(message=>message.role==='user').length;})).toBe(1);
 await context.close();
});

for(const character of ['方宜','祀'])test(`touch submits the complete Chinese draft once and a cancelled press does not send (${character})`,async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 if(character==='祀'){await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-terminal-visual','si');}
 await page.getByRole('button',{name:'助手',exact:true}).click();const field=page.getByLabel(`和${character}说说`,{exact:true});const text='刚打完的中文候选文字，不要漏字';
 await field.focus();await field.evaluate((el,value)=>{el.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true,data:''}));Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')!.set!.call(el,value);el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertCompositionText',data:value,isComposing:true}));},text);
 const send=page.getByRole('button',{name:'发送',exact:true});await expect(send).toBeEnabled();const b=await send.boundingBox();await page.mouse.move(b!.x+b!.width/2,b!.y+b!.height/2);await page.mouse.down();await page.mouse.move(2,2);await page.mouse.up();await expect(page.locator('.chat-message.user')).toHaveCount(0);
 await send.tap();await expect(page.locator('.chat-message.user')).toHaveCount(1);await expect(page.locator('.chat-message.user')).toContainText(text);await expect(field).toBeFocused();await expect(field).toHaveValue('');await context.close();
});

test('clean saved cards settle away while the ledger and readable receipt survive navigation',async({page})=>{
 await si(page);await page.getByRole('button',{name:'助手',exact:true}).click();await page.getByLabel('和祀说说',{exact:true}).fill('帮我记一下今天午饭花了28元');await page.getByRole('button',{name:'发送',exact:true}).click();
 await expect(page.getByRole('log')).toContainText('已记入账簿');await expect(page.locator('.proposal')).toHaveCount(0,{timeout:4000});await expect(page.locator('.chat-action-batch')).toHaveCount(0);
 await page.getByRole('button',{name:'设置',exact:true}).click();await page.getByRole('button',{name:'助手',exact:true}).click();await expect(page.locator('.proposal')).toHaveCount(0);
 expect(await page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');return terminalDb.entries.count();})).toBe(1);
});

test('filtering finished cards preserves unresolved original indexes and committed error warnings',async({page})=>{
 await si(page);await page.evaluate(async()=>{const {terminalDb,registerActionBatch,patchActionBatch}=await import('/src/terminal/data.ts');await terminalDb.messages.put({id:'mixed-ui',role:'user',character:'si',text:'合成混合事项',createdAt:new Date().toISOString()});await registerActionBatch('mixed-ui',[{kind:'note',text:'已完成'},{kind:'note',text:'待确认'},{kind:'note',text:'回执失败的已保存事项'}]);await patchActionBatch('mixed-ui',0,{kind:'result',state:'已保存'});await patchActionBatch('mixed-ui',2,{kind:'result',state:'已保存',error:'事项已保存，聊天回执未能写入'});});
 await page.getByRole('button',{name:'助手',exact:true}).click();await expect(page.locator('.proposal')).toHaveCount(2);await expect(page.locator('.proposal-save-error')).toContainText('回执未能写入');
 await page.locator('.proposal').filter({hasText:'待确认'}).getByRole('button',{name:'确认保存',exact:true}).click();
 await expect.poll(()=>page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');return (await terminalDb.messages.get('mixed-ui'))?.actionBatch?.states[1];})).toBe('已保存');
 expect(await page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');return (await terminalDb.notes.toArray()).map(n=>n.text);})).toEqual(['待确认']);
});

test('home has no extra painting captions or slash and ink buttons have no straight baseline',async({page})=>{
 await si(page);await expect(page.locator('.si-scroll-title,.si-scroll-seal')).toHaveCount(0);expect(await page.locator('.si-heading-companion').evaluate(el=>getComputedStyle(el,'::after').content)).toBe('none');
 await page.getByRole('button',{name:'打开记账',exact:true}).click();await page.getByRole('button',{name:'记一笔',exact:true}).click();
 for(const button of await page.locator('.ledger-panel .terminal-action').all())expect(await button.evaluate(el=>getComputedStyle(el).borderBottomWidth)).toBe('0px');
 await expect(page.locator('.terminal-form .paper-icon path[d^="M4 22"]')).toHaveCount(0);
});

for(const theme of ['light','dark'])test(`ledger fields stay in their own frames at 320px and enlarged text (${theme})`,async({page})=>{
 await page.setViewportSize({width:320,height:700});await si(page);if(theme==='dark'){await page.getByRole('button',{name:'切换深浅模式',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-terminal-theme','dark');}
 await page.getByRole('button',{name:'打开记账',exact:true}).click();
 const month=await page.getByLabel('月份',{exact:true}).boundingBox();expect(month!.width).toBeGreaterThanOrEqual(180);
 await page.getByRole('button',{name:'记一笔',exact:true}).click();await page.addStyleTag({content:'input,select,textarea{font-size:24px!important}'});
 await page.getByLabel('渠道／账户',{exact:true}).fill('一个很长很长的账户名称'.repeat(6));await page.getByLabel('备注',{exact:true}).fill('很长的流水备注'.repeat(35));
 const overflow=await page.locator('.ledger-panel input,.ledger-panel select').evaluateAll(nodes=>nodes.filter(n=>{const b=n.getBoundingClientRect(),l=n.closest('label')!.getBoundingClientRect();return b.right>l.right+1||b.left<l.left-1||b.right>innerWidth-8;}).map(n=>(n as HTMLInputElement).type));expect(overflow).toEqual([]);
});
