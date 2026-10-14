import {test,expect} from '@playwright/test';

test('three tabs leave all daily tools reachable and Settings opens directly',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const nav=page.getByRole('navigation',{name:'功能导航'});
 await expect(nav.getByRole('button')).toHaveText(['今日','助手','设置']);await expect(page.locator('.more-sheet')).toHaveCount(0);
 for(const [name,destination] of [['记账','ledger'],['提醒','reminders'],['天气','weather'],['黄历','almanac'],['备忘','notes']]){
  await nav.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开'+name,exact:true}).click();await expect(page.locator('main.page-'+destination)).toBeVisible();await expect(nav.getByRole('button',{name:'今日',exact:true})).toHaveAttribute('aria-current','location');
 }
 await nav.getByRole('button',{name:'助手',exact:true}).click();await expect(page.getByLabel('和方宜说说',{exact:true})).toBeVisible();await nav.getByRole('button',{name:'设置',exact:true}).click();await expect(page.getByLabel('每月预算')).toBeVisible();
});

test('opening has no skip button and automatically releases keyboard focus',async({page})=>{
 await page.clock.install();await page.clock.pauseAt(new Date());await page.goto('/');const opening=page.getByRole('dialog',{name:'帝江号开场'});await expect(opening).toBeVisible();expect(await opening.getByRole('button').count()).toBe(0);await page.keyboard.press('Tab');await expect(opening).toBeFocused();await page.clock.runFor(1800);await expect(opening).toHaveCount(0);await expect(page.getByRole('navigation',{name:'功能导航'})).toBeVisible();
});
