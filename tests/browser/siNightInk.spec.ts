import {test,expect} from '@playwright/test';
test('Si night painting follows the manual theme and keeps a continuous scene beneath all dragons',async({page})=>{
 await page.setViewportSize({width:320,height:568});await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
 await expect(page.locator('.si-painted-mountains')).toHaveAttribute('src','/themes/si/painted-mountains.webp');
 await page.getByRole('button',{name:'切换深浅模式'}).click();await expect(page.locator('.si-painted-mountains')).toHaveAttribute('src','/themes/si/painted-mountains-night.webp');
 await page.locator('.si-painted-mountains').evaluate((img:HTMLImageElement)=>img.decode());
 const companion=await page.locator('.si-heading-companion').boundingBox();const clock=await page.locator('.hub-heading-meta').boundingBox();expect(companion!.x+companion!.width).toBeLessThanOrEqual(clock!.x);
 expect(await page.locator('.si-painted-world').boundingBox()).toEqual(await page.locator('.hub-orbit').boundingBox());
 const nav=await page.locator('.bottom-navigation').boundingBox();for(const button of await page.locator('.hub-plate').all()){const box=await button.boundingBox();expect(box!.y+box!.height).toBeLessThanOrEqual(nav!.y);expect(await button.locator('.hub-plate-surface').evaluate(el=>getComputedStyle(el,'::before').content)).toBe('none');}
 await page.reload();const opening=page.getByRole('dialog',{name:'缘缘庄开场',exact:true});await expect(opening).toBeVisible();const openingChannels=await opening.locator('.startup-visual').evaluate(el=>getComputedStyle(el).backgroundColor.match(/\d+/g)!.slice(0,3).map(Number));expect(Math.max(...openingChannels)).toBeLessThan(80);await expect(opening.locator('.startup-ink-landscape img')).toHaveAttribute('src','/themes/si/painted-mountains-night.webp');await opening.waitFor({state:'detached'});
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.hub-modules video')).toHaveCount(0);await expect(page.locator('.hub-modules [data-doodle]')).toHaveCount(4);
 await page.getByRole('button',{name:'切换深浅模式'}).click();await expect(page.locator('.si-painted-mountains')).toHaveAttribute('src','/themes/si/painted-mountains.webp');
 await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await expect(page.locator('.si-heading-companion')).toHaveCount(0);await expect(page.getByAltText('帝江号飞船',{exact:true})).toBeVisible();
});

test('night header and chat controls retain readable text and distinguish disabled send',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.getByRole('button',{name:'切换深浅模式'}).click();
 const contrast=await page.locator('.terminal-header .theme-button').evaluate(el=>{const rgb=(s:string)=>s.match(/[\d.]+/g)!.slice(0,3).map(Number);const luminance=(c:number[])=>c.map(v=>{const x=v/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);const text=luminance(rgb(getComputedStyle(el).color)),bg=luminance(rgb(getComputedStyle(el,'::before').backgroundColor));return (Math.max(text,bg)+.05)/(Math.min(text,bg)+.05);});expect(contrast).toBeGreaterThanOrEqual(4.5);
 await page.getByRole('button',{name:'助手',exact:true}).click();const send=page.getByRole('button',{name:'发送',exact:true});await expect(send).toBeDisabled();const background=await send.evaluate(el=>getComputedStyle(el,'::before').backgroundColor);await page.getByLabel('和祀说说',{exact:true}).fill('晚安');await expect(send).toBeEnabled();expect(await send.evaluate(el=>getComputedStyle(el,'::before').backgroundColor)).not.toBe(background);
});
