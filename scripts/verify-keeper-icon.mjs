import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chromium'}),errors=[],checks=[];
for(const width of [390,320])for(const theme of ['light','dark']){
 const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5180/inn-preview.html');await page.evaluate(()=>document.fonts.ready);
 if(theme==='dark')await page.getByRole('button',{name:'切换深色',exact:true}).click();
 await page.getByRole('button',{name:'设置',exact:true}).click();
 const icon=await page.locator('.inn-nav [data-pose="6"]').evaluate(e=>({image:getComputedStyle(e).backgroundImage,size:getComputedStyle(e).backgroundSize,position:getComputedStyle(e).backgroundPosition}));
 assert.ok(icon.image.includes('tea-keeper-icon.webp'));assert.equal(icon.size,'contain');assert.equal(icon.position,'50% 50%');
 assert.ok(await page.locator('.inn-nav [data-pose="4"]').evaluate(e=>getComputedStyle(e).backgroundImage.includes('tea-character-icons.webp')));
 await page.evaluate(()=>new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=reject;i.src='/previews/tea-keeper-icon.webp'}));
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:`references/inn-preview/rooms/keeper-${width}-${theme}.png`,fullPage:true});checks.push({width,theme,icon});await page.close();
}
assert.deepEqual(errors,[]);await writeFile('references/inn-preview/keeper-verification.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks:checks.length,errors}));await browser.close();
