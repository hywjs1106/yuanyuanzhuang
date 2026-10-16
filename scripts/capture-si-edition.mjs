import {chromium} from '@playwright/test';
import fs from 'node:fs';
const out='../references/ui-25';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chromium'});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5180');
await page.getByRole('navigation',{name:'功能导航'}).waitFor();
async function shot(name){await page.waitForTimeout(550);await page.screenshot({path:`${out}/${name}.png`});if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))throw Error(`Overflow: ${name}`);}
async function nav(name){await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name,exact:true}).click();}
async function brightness(){const old=await page.locator('html').getAttribute('data-terminal-theme');await page.getByRole('button',{name:'切换深浅模式'}).click();await page.waitForFunction(value=>document.documentElement.dataset.terminalTheme!==value,old);}
await nav('助手');await shot('number-one-fangyi-chat');
await nav('今日');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
await page.waitForFunction(()=>document.documentElement.dataset.terminalVisual==='si');
await page.locator('.si-painted-mountains').evaluate(async el=>{await el.decode();});
await page.evaluate(()=>document.fonts.ready);await shot('si-home-light');
await brightness();await shot('si-home-dark');await brightness();
await nav('助手');await shot('si-chat-light');await brightness();await shot('si-chat-dark');await brightness();
await page.setViewportSize({width:320,height:740});await shot('si-chat-320');
await page.setViewportSize({width:320,height:400});await page.locator('.terminal-shell').evaluate(el=>el.classList.add('keyboard-open'));await shot('si-keyboard-320');
await page.setViewportSize({width:320,height:740});await page.locator('.terminal-shell').evaluate(el=>el.classList.remove('keyboard-open'));
await nav('今日');await shot('si-home-320');
for(const name of ['记账','提醒','天气','黄历']){await page.getByRole('button',{name:`打开${name}`,exact:true}).click();await shot(`si-tool-${name}`);await nav('今日');}
await nav('设置');await shot('si-settings-320');
if(errors.length)throw Error(errors.join('\n'));console.log('All Si surfaces captured; no page errors or horizontal overflow.');
await browser.close();
