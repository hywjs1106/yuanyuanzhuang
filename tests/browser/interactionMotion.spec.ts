import {test,expect} from '@playwright/test';

test('navigation starts a short passage while rapid taps leave only the final interactive page',async({page})=>{
 await page.goto('/');const nav=page.getByRole('navigation',{name:'功能导航'});
 expect(await page.locator('main.terminal-content').evaluate(el=>el.getAnimations().length)).toBe(0);
 await nav.getByRole('button',{name:'记账',exact:true}).click();
 expect(await page.locator('main.terminal-content').evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0);
 await nav.getByRole('button',{name:'提醒',exact:true}).click();await nav.getByRole('button',{name:'助手',exact:true}).click();
 await expect(page.locator('main.terminal-content')).toHaveCount(1);await expect(page.getByLabel('和方宜说说',{exact:true})).toBeVisible();
 await page.getByLabel('和方宜说说',{exact:true}).fill('过场过程中仍能输入');await page.waitForTimeout(300);
 expect(await page.locator('main.terminal-content').evaluate(el=>el.getAnimations().length)).toBe(0);
 await page.emulateMedia({reducedMotion:'reduce'});await nav.getByRole('button',{name:'记账',exact:true}).click();
 expect(await page.locator('main.terminal-content').evaluate(el=>el.getAnimations().length)).toBe(0);await page.getByRole('button',{name:'记一笔',exact:true}).click();await expect(page.getByLabel('金额',{exact:true})).toBeVisible();
});

test('floating surfaces move without moving touch targets and stop offscreen or under reduced motion',async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.goto('/');
 const button=page.getByRole('button',{name:'打开记账',exact:true});const surface=button.locator('.hub-plate-surface');await expect(surface).toBeVisible();
 const target=await button.boundingBox();const start=await surface.boundingBox();await page.waitForTimeout(950);const later=await surface.boundingBox();
 expect(Math.abs(later!.y-start!.y)).toBeGreaterThan(.1);expect(await button.boundingBox()).toEqual(target);
 for(const child of await page.locator('.hub-plate-surface').all()){
  const parent=await child.locator('..').boundingBox();const rect=await child.boundingBox();expect(rect!.y).toBeGreaterThanOrEqual(parent!.y-.1);expect(rect!.y+rect!.height).toBeLessThanOrEqual(parent!.y+parent!.height+.1);
  const map=await page.locator('.hub-map-stage').boundingBox();expect(rect!.y+rect!.height<map!.y||rect!.y>map!.y+map!.height).toBeTruthy();
 }
 await page.setViewportSize({width:320,height:200});await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
 await expect.poll(()=>surface.evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('paused');
 await page.evaluate(()=>window.scrollTo(0,0));await expect.poll(()=>surface.evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('running');
 await page.emulateMedia({reducedMotion:'reduce'});expect(await surface.evaluate(el=>el.getAnimations().length)).toBe(0);
 await button.click();await expect(page.getByRole('button',{name:'记一笔',exact:true})).toBeVisible();
});

test('dock marker follows the last destination after rapid changes and resizing',async({page})=>{
 await page.goto('/');const nav=page.getByRole('navigation',{name:'功能导航'});
 await nav.getByRole('button',{name:'记账',exact:true}).click();await nav.getByRole('button',{name:'提醒',exact:true}).click();await nav.getByRole('button',{name:'助手',exact:true}).click();
 const marker=nav.locator('.navigation-marker');await expect(marker).toHaveCount(1);
 for(const width of [320,414,768]){
  await page.setViewportSize({width,height:844});
  await expect.poll(async()=>{const a=await marker.boundingBox(),b=await nav.locator('[aria-current=page]').boundingBox();return Math.abs((a!.x+a!.width/2)-(b!.x+b!.width/2));}).toBeLessThan(2);
 }
 await page.emulateMedia({reducedMotion:'reduce'});await nav.getByRole('button',{name:'今日',exact:true}).click();
 expect(await marker.evaluate(el=>parseFloat(getComputedStyle(el).transitionDuration))).toBe(0);
 await nav.getByRole('button',{name:'更多',exact:true}).click();await expect(page.getByRole('dialog',{name:'更多功能'})).toBeVisible();await page.keyboard.press('Escape');await expect(nav.getByRole('button',{name:'更多',exact:true})).toBeFocused();
});
