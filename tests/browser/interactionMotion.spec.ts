import {test,expect} from '@playwright/test';

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
