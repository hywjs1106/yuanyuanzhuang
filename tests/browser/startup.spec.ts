import {test,expect} from '@playwright/test';
import {go} from './navigation';

test('portrait opening retains the complete emblem and contains no buttons through the restrained ghost effect',async({page})=>{
 await page.clock.install();await page.clock.pauseAt(new Date());await page.setViewportSize({width:320,height:740});await page.goto('/');const opening=page.getByRole('dialog',{name:'帝江号开场'});await expect(opening.locator('.startup-emblem')).toBeVisible();expect(await opening.getByRole('button').count()).toBe(0);
 await page.clock.runFor(1000);await expect(opening).toBeVisible();await expect(page.locator('.startup-wipe-layer')).toHaveCount(0);expect(await opening.getByRole('button').count()).toBe(0);await page.clock.runFor(800);await expect(opening).toHaveCount(0);await expect(page.getByRole('navigation',{name:'功能导航'})).toBeVisible();
});

test('opening preserves the existing back and Escape dismissal paths without a skip control',async({page})=>{
 await page.goto('/');const opening=page.getByRole('dialog',{name:'帝江号开场'});await expect(opening).toBeVisible();expect(await page.evaluate(()=>{const event=new Event('terminal-back',{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;})).toBeTruthy();await expect(opening).toHaveCount(0);await go(page,'记账');await expect(page.getByRole('button',{name:'记一笔',exact:true})).toBeVisible();
 await page.reload();await expect(opening).toBeVisible();await page.keyboard.press('Escape');await expect(opening).toHaveCount(0);await expect(page.getByRole('navigation',{name:'功能导航'})).toBeVisible();
});

test('changing motion preference during opening dismisses it without leaving a blocker',async({page})=>{
 await page.goto('/');await expect(page.getByRole('dialog',{name:'帝江号开场'})).toBeVisible();await page.emulateMedia({reducedMotion:'reduce'});await expect(page.getByRole('dialog',{name:'帝江号开场'})).toHaveCount(0);await expect(page.getByRole('navigation',{name:'功能导航'})).toBeVisible();
});

test('opening leaves automatically and reduced motion bypasses it entirely',async({page})=>{
 await page.goto('/');await expect(page.getByRole('dialog',{name:'帝江号开场'})).toBeVisible();await expect(page.getByRole('dialog',{name:'帝江号开场'})).toHaveCount(0,{timeout:3000});await expect(page.getByRole('navigation',{name:'功能导航'})).toBeVisible();await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await expect(page.getByRole('navigation',{name:'功能导航'})).toBeVisible();await expect(page.getByRole('dialog',{name:'帝江号开场'})).toHaveCount(0);
});
