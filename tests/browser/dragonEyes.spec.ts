import {test,expect} from '@playwright/test';

test('startup dragon shares the eye motion and failed artwork leaves no floating eyes',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.getByRole('heading',{name:'缘缘庄',exact:true}).waitFor();await page.reload();
 await expect(page.locator('.startup-screen .ink-dragon-eyes')).toBeVisible();await page.locator('.startup-screen').waitFor({state:'detached'});
 await page.route('**/themes/si/ink-dragon-opening.webp',route=>route.abort());await page.reload();await expect(page.getByRole('dialog',{name:'缘缘庄开场'})).toBeVisible();await expect(page.locator('.startup-screen .ink-dragon-eyes')).toHaveCount(0);await expect(page.locator('.startup-screen')).toHaveCount(0,{timeout:3000});
});
