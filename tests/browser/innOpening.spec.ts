import {test,expect} from '@playwright/test';
async function chooseSi(page:import('@playwright/test').Page){await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await expect(page.getByRole('heading',{name:'缘缘庄',exact:true})).toBeVisible();}

test('saved Si gets an independent inn opening without any transient industrial mark',async({page})=>{
 await page.addInitScript(()=>{(window as any).__openingImages=[];new MutationObserver(()=>{for(const img of document.querySelectorAll('.startup-screen img')){const src=(img as HTMLImageElement).getAttribute('src');if(src)(window as any).__openingImages.push(src);}}).observe(document,{childList:true,subtree:true});});
 await chooseSi(page);await page.reload();const opening=page.getByRole('dialog',{name:'缘缘庄开场',exact:true});await expect(opening).toBeVisible();
 await expect(opening.locator('.startup-emblem,.startup-emblem-frame,.startup-window-light')).toHaveCount(0);await expect(opening.getByAltText('缘缘庄水墨小龙',{exact:true})).toBeVisible();
 await expect(opening.locator('img[src="/themes/si/inn-mark.webp"],img[src="/themes/si/scroll-brush-mark.webp"]')).toHaveCount(0);
 const images=await page.evaluate(()=>(window as any).__openingImages as string[]);expect(images.some(src=>src.includes('endfield-lockup'))).toBe(false);
 expect(await opening.locator('.startup-brand').evaluate(el=>getComputedStyle(el,'::before').backgroundImage)).toBe('none');
 await expect(opening.getByRole('button')).toHaveCount(0);await expect(opening).toHaveCount(0,{timeout:3000});
 await expect(page.locator('.terminal-brand .brand-inn')).toHaveAttribute('src','/themes/si/scroll-brush-mark.webp');
 await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.reload();const original=page.getByRole('dialog',{name:'帝江号开场',exact:true});await expect(original.getByAltText('终末地工业完整徽标')).toBeVisible();await expect(original.locator('.startup-inn')).toHaveCount(0);
});

test('Si dark opening, broken artwork and reduced motion never leave an input blocker',async({page})=>{
 await chooseSi(page);await page.getByRole('button',{name:'切换深浅模式'}).click();await expect(page.locator('html')).toHaveAttribute('data-terminal-theme','dark');
 await page.route('**/themes/si/ink-dragon-opening.webp',route=>route.abort());await page.reload();const opening=page.getByRole('dialog',{name:'缘缘庄开场',exact:true});await expect(opening).toHaveClass(/startup-dark/);await expect(opening).toHaveCount(0,{timeout:3000});
 await page.getByRole('button',{name:'助手',exact:true}).click();await page.getByLabel('和祀说说',{exact:true}).fill('开场结束后可以输入');await expect(page.getByLabel('和祀说说',{exact:true})).toHaveValue('开场结束后可以输入');
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await expect(page.getByRole('heading',{name:'缘缘庄',exact:true})).toBeVisible();await expect(page.locator('.startup-screen')).toHaveCount(0);
});
