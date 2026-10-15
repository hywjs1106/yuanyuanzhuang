import {test,expect} from '@playwright/test';

test('home contains only the ship and four tool controls, with notes reachable from Settings',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await expect(page.locator('main').getByRole('button')).toHaveCount(4);
 for(const text of ['离线助手','接下来','本月支出','记录余额','你的生活，你来安排'])await expect(page.getByText(text,{exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'与庄方宜对话'})).toHaveCount(0);
 for(const width of [320,390]){
  await page.setViewportSize({width,height:740});const ship=await page.getByAltText('帝江号飞船').boundingBox();const dock=await page.getByRole('navigation',{name:'功能导航'}).boundingBox();
  expect(ship!.width).toBeGreaterThan(width*.85);
  for(const button of await page.locator('.hub-plate').all()){const r=await button.boundingBox();expect(r!.height).toBeGreaterThanOrEqual(90);expect(r!.y+r!.height).toBeLessThan(dock!.y);expect(r!.y+r!.height<=ship!.y||r!.y>=ship!.y+ship!.height).toBeTruthy();}
 }
 await page.getByRole('button',{name:'设置',exact:true}).click();await page.getByRole('button',{name:'打开备忘',exact:true}).click();await expect(page.getByLabel('写点什么')).toBeVisible();
});

test('opening presents the whole mark immediately without a directional reveal or footer',async({page})=>{
 await page.clock.install();await page.clock.pauseAt(new Date());await page.goto('/');const opening=page.getByRole('dialog',{name:'帝江号开场'});await expect(opening).toBeVisible();
 const emblem=opening.locator('.startup-emblem');expect(await emblem.evaluate(el=>getComputedStyle(el).clipPath)).toBe('none');
 expect(await emblem.evaluate(el=>parseFloat(getComputedStyle(el).opacity))).toBeGreaterThan(.65);
 await expect(opening.getByText('你的生活，你来安排')).toHaveCount(0);await expect(opening.locator('.startup-foot,.startup-wipe-layer')).toHaveCount(0);
 await page.clock.runFor(1100);await expect(opening).toBeVisible();await expect(opening.locator('.startup-wipe-layer')).toHaveCount(0);await page.clock.runFor(700);await expect(opening).toHaveCount(0);await expect(page.getByRole('navigation',{name:'功能导航'})).toBeVisible();
});
