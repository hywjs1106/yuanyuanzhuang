import {test,expect} from '@playwright/test';
test('three independent modes cycle, persist and share Si drafts without replacing ink',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const toggle=page.getByRole('button',{name:'切换角色风格',exact:true});
 await expect(toggle).toHaveText('方宜');await expect(page.locator('.hub-ship')).toBeVisible();
 await toggle.click();await expect(toggle).toHaveText('水墨');await expect(page.locator('.si-painted-world')).toBeVisible();await expect(page.locator('.tea-home')).toHaveCount(0);
 await page.getByRole('button',{name:'助手',exact:true}).click();await expect(page.getByRole('log',{name:'聊天记录'})).toBeVisible();await expect(page.locator('.si-live-scene')).toHaveCount(0);await page.getByLabel('和祀说说',{exact:true}).fill('两种祀模式共用这份草稿');
 await toggle.click();await expect(toggle).toHaveText('茶馆');await expect(page.getByRole('region',{name:'与祀面对面聊天',exact:true})).toBeVisible();await expect(page.getByLabel('和祀说说',{exact:true})).toHaveValue('两种祀模式共用这份草稿');
 await page.getByRole('button',{name:'今日',exact:true}).click();await expect(page.getByRole('region',{name:'秋日茶馆首页'})).toBeVisible();await expect(page.locator('.tea-home video')).toBeVisible();await page.screenshot({path:'references/inn-preview/rooms/third-mode-tea-home.png'});
 await page.reload();await expect(toggle).toHaveText('茶馆');await expect(page.locator('.tea-home')).toBeVisible();await page.getByRole('button',{name:'设置',exact:true}).click();
 const choices=page.getByRole('group',{name:'角色风格',exact:true});await expect(choices.getByRole('button')).toHaveCount(3);await expect(choices.getByRole('button',{name:/祀 · 秋日茶馆/})).toHaveAttribute('aria-pressed','true');
 await page.screenshot({path:'references/inn-preview/rooms/three-mode-settings.png'});await choices.getByRole('button',{name:/祀 · 水墨缘缘庄/}).click();await expect(toggle).toHaveText('水墨');await page.getByRole('button',{name:'助手',exact:true}).click();await expect(page.getByRole('log',{name:'聊天记录'})).toBeVisible();await expect(page.getByLabel('和祀说说',{exact:true})).toHaveValue('两种祀模式共用这份草稿');
 await toggle.click();await toggle.click();await expect(toggle).toHaveText('方宜');await page.getByRole('button',{name:'今日',exact:true}).click();await expect(page.locator('.hub-ship')).toBeVisible();
});
