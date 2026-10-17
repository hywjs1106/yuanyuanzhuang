import {test,expect} from '@playwright/test';

test('all four dragons roll their pupils without moving the buttons and respect reduced motion',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
 const eyes=page.locator('.hub-modules .ink-dragon-eyes');await expect(eyes).toHaveCount(4);
 const buttons=page.locator('.hub-plate');const bounds=()=>buttons.evaluateAll(nodes=>nodes.map(el=>{const b=el.getBoundingClientRect();return [b.x,b.y,b.width,b.height];}));const before=await bounds();
 for(const eye of await eyes.all()){
  const distance=await eye.locator('.ink-dragon-pupil').first().evaluate(el=>{const animation=el.getAnimations()[0];if(!animation)return 0;animation.pause();const delay=Number(animation.effect?.getTiming().delay??0);const points=[0,140,280,420,560,700].map(t=>{animation.currentTime=delay+t;const b=el.getBoundingClientRect();return [b.x,b.y];});return Math.max(...points.map(p=>p[0]))-Math.min(...points.map(p=>p[0]));});
  expect(distance).toBeGreaterThan(.5);
 }
 expect(await bounds()).toEqual(before);
 await page.emulateMedia({reducedMotion:'reduce'});for(const eye of await eyes.all())await expect(eye).toBeHidden();
 await page.getByRole('button',{name:'打开记账',exact:true}).click();await expect(page.getByRole('heading',{name:'记账',exact:true})).toBeVisible();
});

test('startup dragon shares the eye motion and failed artwork leaves no floating eyes',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.getByRole('heading',{name:'缘缘庄',exact:true}).waitFor();await page.reload();
 await expect(page.locator('.startup-screen .ink-dragon-eyes')).toBeVisible();await page.locator('.startup-screen').waitFor({state:'detached'});
 await page.route('**/themes/si/ink-dragon-opening.png',route=>route.abort());await page.reload();await expect(page.getByRole('dialog',{name:'缘缘庄开场'})).toBeVisible();await expect(page.locator('.startup-screen .ink-dragon-eyes')).toHaveCount(0);await expect(page.locator('.startup-screen')).toHaveCount(0,{timeout:3000});
});
