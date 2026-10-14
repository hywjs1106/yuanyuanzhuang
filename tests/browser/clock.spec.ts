import {test,expect} from '@playwright/test';
test('local clock ticks from real time, moves its marker and keeps updating with reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
 const clock=page.locator('.hub-clock time');await expect(clock).toBeVisible();
 const before=await clock.getAttribute('datetime');const hand=await page.locator('.hub-clock-hand').getAttribute('style');
 await expect.poll(()=>clock.getAttribute('datetime'),{timeout:4000}).not.toBe(before);
 await expect.poll(()=>page.locator('.hub-clock-hand').getAttribute('style')).not.toBe(hand);
 await expect.poll(()=>page.locator('.hub-topographic-lines').evaluate(el=>getComputedStyle(el).transform)).not.toBe('none');
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(()=>page.locator('.hub-topographic-lines').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 const later=await clock.getAttribute('datetime');await expect.poll(()=>clock.getAttribute('datetime'),{timeout:4000}).not.toBe(later);
 expect(await page.locator('.hub-clock').getAttribute('aria-live')).toBeNull();
});
