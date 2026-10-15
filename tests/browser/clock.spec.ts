import {test,expect} from '@playwright/test';

test('header clock ticks from real time and stays live under reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
 const clock=page.locator('.hub-heading .hub-clock-readout');await expect(clock).toBeVisible();
 await expect(page.locator('.hub-orbit time')).toHaveCount(0);
 const before=await clock.getAttribute('datetime');await expect.poll(()=>clock.getAttribute('datetime'),{timeout:4000}).not.toBe(before);
 await expect.poll(()=>page.locator('.hub-ship').evaluate(el=>getComputedStyle(el).transform)).not.toBe('none');
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(()=>page.locator('.hub-ship').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 const later=await clock.getAttribute('datetime');await expect.poll(()=>clock.getAttribute('datetime'),{timeout:4000}).not.toBe(later);
 expect(await clock.getAttribute('aria-live')).toBeNull();
});
