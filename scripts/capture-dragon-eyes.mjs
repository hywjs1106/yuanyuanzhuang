import {chromium} from '@playwright/test';
import fs from 'node:fs';
const out='../references/ui-36';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chromium'});
const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:out,size:{width:390,height:844}}});
const setup=await context.newPage();await setup.goto('http://127.0.0.1:5180');await setup.getByRole('button',{name:'切换角色风格',exact:true}).click();await setup.getByRole('heading',{name:'缘缘庄',exact:true}).waitFor();await setup.close();
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5180');await page.locator('.startup-screen .ink-dragon-eyes').waitFor();const startup=await page.locator('.ink-dragon-opening').evaluate(el=>el.outerHTML);await page.waitForTimeout(300);await page.screenshot({path:`${out}/opening-eyes.png`});await page.locator('.startup-screen').waitFor({state:'detached'});await page.waitForTimeout(8500);await page.screenshot({path:`${out}/home-eyes-light.png`});
await page.getByRole('button',{name:'切换深浅模式'}).click();await page.waitForTimeout(500);await page.screenshot({path:`${out}/home-eyes-dark.png`});
await page.setViewportSize({width:320,height:568});await page.waitForTimeout(200);await page.screenshot({path:`${out}/home-eyes-320.png`});
await page.setViewportSize({width:1000,height:620});await page.evaluate(startup=>{
 const art=[startup,...Array.from(document.querySelectorAll('.hub-modules .ink-dragon')).map(el=>el.outerHTML)];
 const gallery=document.createElement('div');gallery.id='eye-gallery';gallery.style.cssText='position:fixed;inset:0;z-index:1000;background:#f5efe2;display:grid;grid-template-columns:repeat(3,1fr);place-items:center;gap:12px;padding:12px';
 gallery.innerHTML=art.map(html=>`<div style="width:240px;height:240px">${html}</div>`).join('');document.body.append(gallery);
 for(const el of gallery.querySelectorAll('.ink-dragon')){el.style.cssText='width:240px;height:240px;animation:none;background:transparent;filter:none';}
 const pupils=gallery.querySelectorAll('.ink-dragon-pupil');for(const el of pupils){const animation=el.getAnimations()[0];animation?.pause();if(animation)animation.currentTime=Number(animation.effect?.getTiming().delay??0)+350;}
},startup);await page.screenshot({path:`${out}/five-dragon-eye-alignment.png`});await page.evaluate(()=>document.querySelector('#eye-gallery').remove());
if(errors.length)throw Error(errors.join('\n'));const video=page.video();await page.close();await video.saveAs(`${out}/dragon-eyes-preview.webm`);await context.close();await browser.close();console.log('All five eye overlays, light/dark/320px and video captured without page errors.');
