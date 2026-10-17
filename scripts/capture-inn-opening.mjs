import {chromium} from '@playwright/test';
import fs from 'node:fs';
const out='../references/ui-33';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chromium'});
const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:out,size:{width:390,height:844}}});
const setup=await context.newPage();await setup.goto('http://127.0.0.1:5180');
await setup.getByRole('button',{name:'切换角色风格',exact:true}).click();await setup.getByRole('heading',{name:'缘缘庄',exact:true}).waitFor();await setup.evaluate(()=>document.fonts.ready);await setup.close();
const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
async function shot(name){await page.goto('http://127.0.0.1:5180');await page.getByAltText('缘缘庄水墨小龙',{exact:true}).waitFor();await page.locator('.startup-inn').evaluate(img=>img.decode());await page.waitForTimeout(650);await page.screenshot({path:`${out}/${name}.png`});await page.locator('.startup-screen').waitFor({state:'detached'});}
await shot('inn-opening-light');await page.waitForTimeout(500);
await page.getByRole('button',{name:'切换深浅模式'}).click();await shot('inn-opening-dark');
await page.getByRole('button',{name:'切换深浅模式'}).click();await page.setViewportSize({width:320,height:740});await shot('inn-opening-320');
await page.setViewportSize({width:740,height:360});await shot('inn-opening-landscape');
if(errors.length)throw Error(errors.join('\n'));
const video=page.video();await page.close();await video.saveAs(`${out}/inn-opening-preview.webm`);await context.close();await browser.close();console.log('Light/dark/320px/landscape captured; no page errors.');
