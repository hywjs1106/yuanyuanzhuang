import {test,expect} from '@playwright/test';
import {mkdirSync,copyFileSync} from 'node:fs';
const out='../references/ui-07';
test('eight surfaces retain task entry points in the new visual system',async({page,browser})=>{
 mkdirSync(out,{recursive:true});await page.goto('/');
 await page.screenshot({path:`${out}/home.png`});const agenda=await page.locator('.overview-agenda').boundingBox();const dock=await page.locator('.bottom-navigation').boundingBox();expect(agenda!.y+agenda!.height).toBeLessThan(dock!.y);
 for(const [name,file] of [['记账','ledger'],['提醒','reminders'],['助手','assistant']] as const){await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name,exact:true}).click();await page.screenshot({path:`${out}/${file}.png`});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();}
 for(const [name,file] of [['天气','weather'],['黄历','almanac'],['备忘','notes'],['设置','settings']] as const){await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'更多',exact:true}).click();await page.getByRole('dialog',{name:'更多功能'}).getByRole('button',{name,exact:true}).click();await page.screenshot({path:`${out}/${file}.png`});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();}
 await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'切换深浅模式'}).click();await expect(page.locator('html')).toHaveAttribute('data-terminal-theme','dark');await page.mouse.move(1,1);await page.screenshot({path:`${out}/home-dark.png`,animations:'disabled'});
 await page.getByRole('button',{name:'助手',exact:true}).click();await page.screenshot({path:`${out}/assistant-dark.png`});
 await page.getByRole('button',{name:'今日',exact:true}).click();await page.setViewportSize({width:320,height:844});await page.screenshot({path:`${out}/home-320.png`});const narrowAgenda=await page.locator('.overview-agenda').boundingBox();const narrowDock=await page.locator('.bottom-navigation').boundingBox();expect(narrowAgenda!.y+narrowAgenda!.height).toBeLessThan(narrowDock!.y);
 await page.setViewportSize({width:768,height:960});await page.screenshot({path:`${out}/home-wide.png`});
 // Enlarge text to exercise geometry, without changing the user's device settings.
 await page.setViewportSize({width:320,height:844});await page.evaluate(()=>{document.documentElement.style.fontSize='19.5px';});await page.screenshot({path:`${out}/home-large-text.png`});
 const videoContext=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:`${out}/motion`,size:{width:390,height:844}},reducedMotion:'no-preference'});
 const motion=await videoContext.newPage();await motion.goto('http://127.0.0.1:5180/');await expect(motion.locator('.hub-clock')).toBeVisible();await motion.screenshot({path:`${out}/motion-start.png`});const start=await motion.locator('.hub-topographic-lines').evaluate(el=>getComputedStyle(el).transform);
 await motion.waitForTimeout(2200);const finish=await motion.locator('.hub-topographic-lines').evaluate(el=>getComputedStyle(el).transform);expect(finish).not.toBe(start);await motion.screenshot({path:`${out}/motion-end.png`});await motion.waitForTimeout(2000);
 const video=motion.video();await videoContext.close();if(video)copyFileSync(await video.path(),`${out}/home-motion.webm`);
});
