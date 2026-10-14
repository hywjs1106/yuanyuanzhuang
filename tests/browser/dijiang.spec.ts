import {test,expect} from '@playwright/test';

test('opening uses a loaded complete emblem and releases the renamed app',async({page})=>{
 await page.clock.install();await page.clock.pauseAt(new Date());await page.goto('/');
 const opening=page.getByRole('dialog',{name:'帝江号开场'});
 await expect(opening).toBeVisible();
 const emblem=opening.locator('img');await expect(emblem).toBeVisible();
 await expect.poll(()=>emblem.evaluate((node:HTMLImageElement)=>node.complete&&node.naturalWidth>0)).toBeTruthy();
 await page.clock.runFor(1800);await expect(opening).toHaveCount(0);
 await expect(page.getByRole('heading',{name:'帝江号',exact:true})).toBeVisible();
});

test('ship stays visible and separate from four usable corner controls at phone widths',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 for(const width of [320,390]){
  await page.setViewportSize({width,height:844});
  const ship=page.getByAltText('帝江号飞船');await expect(ship).toBeVisible();
  await expect.poll(()=>ship.evaluate((node:HTMLImageElement)=>node.complete&&node.naturalWidth>0)).toBeTruthy();
  const s=await ship.boundingBox();expect(s).not.toBeNull();
  for(const label of ['记账','提醒','天气','黄历']){
   const button=page.getByRole('button',{name:'打开'+label,exact:true});const b=await button.boundingBox();expect(b).not.toBeNull();
   expect(b!.width).toBeGreaterThanOrEqual(48);expect(b!.height).toBeGreaterThanOrEqual(48);
   expect(b!.y+b!.height<=s!.y||b!.y>=s!.y+s!.height).toBeTruthy();
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
 }
 await page.getByRole('button',{name:'打开记账',exact:true}).click();await expect(page.getByRole('button',{name:'记一笔',exact:true})).toBeVisible();
});
