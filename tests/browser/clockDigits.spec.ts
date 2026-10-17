import {test,expect} from '@playwright/test';
test.use({timezoneId:'Asia/Shanghai'});
for(const [from,to,changed] of [
 ['14:08:08','14:08:09',[5]],
 ['14:08:09','14:08:10',[4,5]],
 ['14:08:59','14:09:00',[3,4,5]],
 ['14:59:59','15:00:00',[1,2,3,4,5]],
 ['23:59:59','00:00:00',[0,1,2,3,4,5]],
] as const){
 test(`only changed digits animate for ${from} to ${to}`,async({page})=>{
  const date=new Date(`2026-10-17T${from}+08:00`);await page.clock.install({time:date});await page.clock.pauseAt(date);await page.goto('/');await page.getByRole('dialog',{name:'帝江号开场',exact:true}).waitFor();await page.keyboard.press('Escape');
  const clock=page.locator('.hub-clock-readout');await expect(clock).toHaveAttribute('aria-label',`当前时间 ${from}`);await expect(clock.locator('.clock-digit-value')).toHaveCount(6);await expect(clock.locator('.clock-digit-changing')).toHaveCount(0);
  await clock.evaluate(el=>{(window as any).__previousClockDigits=[...el.querySelectorAll('.clock-digit-value')];});
  await page.clock.runFor(1000);await expect(clock).toHaveAttribute('aria-label',`当前时间 ${to}`);
  expect(await clock.evaluate(el=>Array.from(el.querySelectorAll('.clock-digit-value')).flatMap((node,i)=>node!==(window as any).__previousClockDigits[i]?[i]:[]))).toEqual([...changed]);
  expect(await clock.evaluate(el=>Array.from(el.querySelectorAll('.clock-digit')).flatMap((node,i)=>node.querySelector('.clock-digit-changing')?[i]:[]))).toEqual([...changed]);
  await page.emulateMedia({reducedMotion:'reduce'});expect(await clock.evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);expect(await clock.getAttribute('aria-live')).toBeNull();
 });
}
