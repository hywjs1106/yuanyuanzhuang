import {test,expect} from '@playwright/test';

test('Si ink route reveals briefly and settled pages do not replay entrance after theme changes',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.getByRole('button',{name:'设置',exact:true}).click();
 const main=page.locator('main.terminal-content');
 const clip=await main.evaluate(el=>{el.getAnimations().forEach(a=>{a.currentTime=100;});return getComputedStyle(el).clipPath;});expect(clip).toMatch(/^circle/);
 await expect(main).not.toHaveClass(/route-enter/,{timeout:800});expect(await main.evaluate(el=>getComputedStyle(el).clipPath)).toBe('none');
 await page.getByRole('button',{name:'切换角色风格',exact:true}).click();expect(await main.evaluate(el=>el.getAnimations().length)).toBe(0);
 await page.getByRole('button',{name:'助手',exact:true}).click();await expect(main).not.toHaveClass(/route-enter/,{timeout:800});await page.getByLabel('和方宜说说',{exact:true}).fill('切换后仍能输入');
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'今日',exact:true}).click();await expect(main).not.toHaveClass(/route-enter/);expect(await main.evaluate(el=>el.getAnimations().length)).toBe(0);
});

test('chat press feedback leaves the touch rectangle stationary',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'助手',exact:true}).click();await page.waitForTimeout(400);
 const button=page.getByRole('button',{name:'方宜表情',exact:true});const before=await button.boundingBox();await page.mouse.move(before!.x+before!.width/2,before!.y+before!.height/2);await page.mouse.down();await page.waitForTimeout(80);const pressed=await button.boundingBox();await page.mouse.up();
 for(const key of ['x','y','width','height'] as const)expect(Math.abs(before![key]-pressed![key])).toBeLessThan(.1);
 await expect(button).toHaveAttribute('aria-expanded','true');
});
