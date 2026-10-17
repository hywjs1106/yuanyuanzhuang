import {chromium} from '@playwright/test';
import fs from 'node:fs';
const out='../references/ui-39';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chromium'});const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5180');await page.getByRole('navigation',{name:'功能导航'}).waitFor();
const old=await page.locator('.terminal-brand img').getAttribute('src');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.getByRole('heading',{name:'缘缘庄',exact:true}).waitFor();
await page.locator('.brand-inn').evaluate(async img=>{await img.decode();if(!img.naturalWidth)throw Error('Inn icon missing');});await page.evaluate(()=>document.fonts.ready);
async function shot(name){await page.waitForTimeout(350);const box=await page.locator('.brand-inn').boundingBox();const wrapper=await page.locator('.brand-mascot').boundingBox();if(!box||box.width!==40||box.height!==40||box.x<wrapper.x||box.x+box.width>wrapper.x+wrapper.width)throw Error('Inn clipping');if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))throw Error('Overflow');await page.screenshot({path:`${out}/${name}.png`});}
await shot('scroll-home-light');await page.locator('.terminal-header').screenshot({path:`${out}/scroll-header-light.png`});
await page.getByRole('button',{name:'切换深浅模式'}).click();await shot('scroll-home-dark');await page.getByRole('button',{name:'切换深浅模式'}).click();await page.setViewportSize({width:320,height:740});await shot('scroll-home-320');
await page.getByRole('button',{name:'助手',exact:true}).click();await shot('scroll-chat-320');
await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.waitForFunction(()=>document.documentElement.dataset.terminalVisual==='fangyi');if(await page.locator('.terminal-brand img').getAttribute('src')!==old)throw Error('Fangyi icon changed');
if(errors.length)throw Error(errors.join('\n'));console.log('Inn header decoded at40px; light/dark/320px and Fangyi icon restoration verified.');await browser.close();
