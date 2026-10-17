import {test,expect} from '@playwright/test';

test('Si paper entrances fit above navigation on a short phone and all tools still open',async({page})=>{
 await page.setViewportSize({width:320,height:568});await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
 const nav=await page.getByRole('navigation',{name:'功能导航'}).boundingBox();
 for(const button of await page.locator('.hub-plate').all()){const box=await button.boundingBox();expect(box!.height).toBeGreaterThanOrEqual(44);expect(box!.y+box!.height).toBeLessThanOrEqual(nav!.y);}
 for(const [name,heading] of [['记账','记账'],['提醒','提醒与生日'],['天气','天气'],['黄历','黄历']]){await page.getByRole('button',{name:`打开${name}`,exact:true}).click();await expect(page.getByRole('heading',{name:heading,exact:true}).first()).toBeVisible();await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'今日',exact:true}).click();}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});

test('Si sends and saves with ink buttons while disabled and destructive controls stay distinct',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
 await page.getByRole('button',{name:'助手',exact:true}).click();const send=page.getByRole('button',{name:'发送',exact:true});await expect(send).toBeDisabled();
 const disabled=await send.evaluate(el=>getComputedStyle(el,'::before').backgroundColor);
 await page.getByLabel('和祀说说',{exact:true}).fill('你好');await expect(send).toBeEnabled();expect(await send.evaluate(el=>getComputedStyle(el,'::before').backgroundColor)).not.toBe(disabled);
 await send.hover();expect(await send.evaluate(el=>getComputedStyle(el).getPropertyValue('--si-button-fill').trim())).toBe('#763523');
 await page.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开记账',exact:true}).click();await page.getByRole('button',{name:'记一笔',exact:true}).click();
 await page.getByLabel('金额',{exact:true}).fill('8');await page.getByLabel('备注',{exact:true}).fill('纸签按钮检查');await page.getByRole('button',{name:'保存流水',exact:true}).click();await expect(page.getByText('纸签按钮检查',{exact:true})).toBeVisible();
 const danger=page.getByRole('button',{name:'删除',exact:true});expect(await danger.evaluate(el=>getComputedStyle(el).color)).not.toBe(await page.getByRole('button',{name:'编辑纸签按钮检查',exact:true}).evaluate(el=>getComputedStyle(el).color));
 await page.locator('.ledger-item .button-row').evaluate(el=>{const note=document.createElement('div');note.className='note-item';note.innerHTML='<button class="danger" type="button">临时备忘删除样式</button>';el.after(note);});
 expect(await page.getByRole('button',{name:'临时备忘删除样式',exact:true}).evaluate(el=>getComputedStyle(el).color)).toBe(await danger.evaluate(el=>getComputedStyle(el).color));
});
