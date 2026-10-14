import {test,expect} from '@playwright/test';

test('opening is immediately skippable and cannot intercept later navigation',async({page})=>{
 await page.goto('/');const opening=page.getByRole('dialog',{name:'日常终端开场'});await expect(opening).toBeVisible();
 await expect(page.getByRole('navigation',{name:'功能导航'})).toHaveCount(0);
 await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'跳过开场',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'跳过开场',exact:true}).click();await expect(opening).toHaveCount(0);
 const nav=page.getByRole('navigation',{name:'功能导航'});await nav.getByRole('button',{name:'记账',exact:true}).click();await expect(page.getByRole('button',{name:'记一笔',exact:true})).toBeVisible();await nav.getByRole('button',{name:'今日',exact:true}).click();await expect(opening).toHaveCount(0);
});

test('changing motion preference during opening dismisses it without leaving a blocker',async({page})=>{
 await page.goto('/');await expect(page.getByRole('dialog',{name:'日常终端开场'})).toBeVisible();await page.emulateMedia({reducedMotion:'reduce'});await expect(page.getByRole('dialog',{name:'日常终端开场'})).toHaveCount(0);await expect(page.getByRole('navigation',{name:'功能导航'})).toBeVisible();
});

test('opening leaves automatically and reduced motion bypasses it entirely',async({page})=>{
 await page.goto('/');await expect(page.getByRole('dialog',{name:'日常终端开场'})).toBeVisible();await expect(page.getByRole('dialog',{name:'日常终端开场'})).toHaveCount(0,{timeout:3000});await expect(page.getByRole('navigation',{name:'功能导航'})).toBeVisible();
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await expect(page.getByRole('navigation',{name:'功能导航'})).toBeVisible();await expect(page.getByRole('dialog',{name:'日常终端开场'})).toHaveCount(0);
});
