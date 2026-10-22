import {test,expect} from '@playwright/test';
async function si(page:any){await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();}
test('ink navigation connects the click origin, keeps only an inert visual and cleans it up',async({page})=>{
 await si(page);const button=page.getByRole('button',{name:'助手',exact:true});const box=await button.boundingBox();await button.click();
 const old=page.locator('.ink-route-previous');await expect(old).toHaveCount(1);await expect(old).toHaveAttribute('aria-hidden','true');expect(await old.evaluate(el=>(el as HTMLElement).inert)).toBe(true);expect(await old.evaluate(el=>Array.from(el.querySelectorAll('[clip-path]')).every(node=>{const id=node.getAttribute('clip-path')!.match(/#([^)]*)/)?.[1];return !!id&&el.contains(document.getElementById(id));}))).toBe(true);
 const main=page.locator('main.terminal-content');await expect(main).toHaveAttribute('data-ink-reveal','true');const origin=await main.evaluate(el=>({x:parseFloat((el as HTMLElement).style.getPropertyValue('--ink-x')),y:parseFloat((el as HTMLElement).style.getPropertyValue('--ink-y')),rect:el.getBoundingClientRect().toJSON()}));expect(Math.abs(origin.x+origin.rect.x-(box!.x+box!.width/2))).toBeLessThan(3);
 await expect(old).toHaveCount(0,{timeout:1200});await expect(main).not.toHaveAttribute('data-ink-reveal','true');await page.getByLabel('和祀说说',{exact:true}).fill('仍能输入');
 await page.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'设置',exact:true}).click();await page.getByRole('button',{name:'助手',exact:true}).click();await expect(page.getByRole('heading',{name:'祀',exact:true})).toBeVisible();await expect(old).toHaveCount(0,{timeout:1200});
 await page.getByRole('button',{name:'今日',exact:true}).click();await expect(old).toHaveCount(1);await page.emulateMedia({reducedMotion:'reduce'});await expect(old).toHaveCount(0);await expect(main).not.toHaveAttribute('data-ink-reveal','true');
});
test('only a successful ledger save receives the new paper receipt',async({page})=>{
 await si(page);await page.getByRole('button',{name:'打开记账',exact:true}).click();await page.getByRole('button',{name:'记一笔',exact:true}).click();await page.getByLabel('金额',{exact:true}).fill('0');await page.getByRole('button',{name:'保存流水',exact:true}).click();await expect(page.locator('.paper-receipt')).toHaveCount(0);
 await page.getByLabel('金额',{exact:true}).fill('28');await page.getByLabel('备注',{exact:true}).fill('动效验收');await page.getByRole('button',{name:'保存流水',exact:true}).click();await expect(page.locator('.paper-receipt[role=status]')).toContainText('已记入账簿');await expect(page.locator('.paper-receipt-seal')).toHaveText('记');await expect(page.getByRole('form',{name:'新增流水'})).toHaveCount(0);
});

test('persistence failure cannot produce a receipt and reminder receipts follow successful save',async({page})=>{
 await si(page);await page.getByRole('button',{name:'打开记账',exact:true}).click();await page.getByRole('button',{name:'记一笔',exact:true}).click();
 await page.evaluate(()=>{const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value,key){if(this.name==='entries')throw new Error('测试写入失败');return key===undefined?put.call(this,value):put.call(this,value,key);};});
 await page.getByLabel('金额',{exact:true}).fill('28');await page.getByRole('button',{name:'保存流水',exact:true}).click();await expect(page.getByRole('alert')).toContainText('测试写入失败');await expect(page.locator('.paper-receipt')).toHaveCount(0);
 await page.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开提醒',exact:true}).click();await page.getByRole('button',{name:'新增提醒',exact:true}).click();await page.getByLabel('事项',{exact:true}).fill('浇花');await page.getByRole('button',{name:'保存提醒',exact:true}).click();await expect(page.locator('.paper-receipt')).toContainText('提醒已收好');await expect(page.locator('.paper-receipt-seal')).toHaveText('收');
});

test('outgoing chat painting keeps its scroll position',async({page})=>{
 await si(page);await page.getByRole('button',{name:'助手',exact:true}).click();await page.locator('.ink-route-previous').waitFor({state:'hidden'});
 const scroll=await page.locator('.chat-log').evaluate(el=>{for(let i=0;i<24;i++){const row=document.createElement('p');row.style.height='100px';row.textContent='滚动位置验收 '+i;el.append(row);}el.scrollTop=el.scrollHeight;return el.scrollTop;});expect(scroll).toBeGreaterThan(500);
 await page.getByRole('button',{name:'设置',exact:true}).click();expect(await page.locator('.ink-route-copy .chat-log').evaluate(el=>el.scrollTop)).toBe(scroll);
});
