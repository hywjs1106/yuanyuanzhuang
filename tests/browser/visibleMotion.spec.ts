import {test,expect} from '@playwright/test';

test('startup mark visibly changes position while remaining complete',async({page})=>{
 await page.clock.install();await page.clock.pauseAt(new Date());await page.goto('/');const brand=page.locator('.startup-brand');await expect(brand).toBeVisible();
 const positions=await brand.evaluate(el=>{
  const animations=el.getAnimations();animations.forEach(animation=>animation.pause());
  return [0,350,700,1100].map(time=>{animations.forEach(animation=>animation.currentTime=time);return el.getBoundingClientRect().y;});
 });
 expect(Math.max(...positions)-Math.min(...positions)).toBeGreaterThan(3);
 expect(await page.locator('.startup-emblem').evaluate(el=>getComputedStyle(el).clipPath)).toBe('none');
 await page.clock.runFor(1800);await expect(brand).toHaveCount(0);
});

test('ship motion is clearly visible and does not displace corner touch targets',async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.locator('.startup-screen').waitFor({state:'detached'});
 const buttons=page.locator('.hub-plate');const before=await buttons.evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};}));
 const samples=await page.locator('.hub-ship').evaluate(el=>{
  const animations=el.getAnimations();animations.forEach(animation=>animation.pause());
  return [0,1100,2200,3300,4400].map(time=>{animations.forEach(animation=>animation.currentTime=time);const r=el.getBoundingClientRect();return{top:r.top,bottom:r.bottom};});
 });
 expect(Math.max(...samples.map(s=>s.top))-Math.min(...samples.map(s=>s.top))).toBeGreaterThan(8);
 for(const sample of samples)for(const box of before)expect(box.y+box.height<=sample.top||box.y>=sample.bottom).toBeTruthy();
 expect(await buttons.evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};}))).toEqual(before);
 await page.emulateMedia({reducedMotion:'reduce'});expect(await page.locator('.hub-ship').evaluate(el=>el.getAnimations().length)).toBe(0);
});
