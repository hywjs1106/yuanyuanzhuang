import {chromium} from '@playwright/test';
import fs from 'node:fs';
const out='../references/ui-28';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chromium'});const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const nav=async name=>page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name,exact:true}).click();
async function shot(name){await page.waitForTimeout(400);await page.screenshot({path:`${out}/${name}.png`});if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))throw Error('Overflow');}
await page.goto('http://127.0.0.1:5180');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await nav('助手');
await page.getByRole('button',{name:'祀表情',exact:true}).click();await page.getByRole('region',{name:'祀表情库'}).locator('img').evaluateAll(async imgs=>{for(const img of imgs)await img.decode();});await shot('si-stickers-light');
await page.getByRole('button',{name:'切换深浅模式'}).click();await shot('si-stickers-dark');await page.getByRole('button',{name:'切换深浅模式'}).click();
await page.setViewportSize({width:320,height:740});await shot('si-stickers-320');
await page.getByRole('button',{name:'插入颜文字 (・ω・)？',exact:true}).click();await shot('si-kaomoji-draft-320');
await page.setViewportSize({width:320,height:400});await page.getByRole('button',{name:'祀表情',exact:true}).click();await page.locator('.terminal-shell').evaluate(el=>el.classList.add('keyboard-open'));console.log(await page.evaluate(()=>({drawer:!!document.querySelector('.fangyi-expression-drawer'),expanded:document.querySelector('.expression-toggle').getAttribute('aria-expanded'),logHeight:document.querySelector('.chat-log').clientHeight,scrollTop:document.querySelector('.chat-log').scrollTop,scrollHeight:document.querySelector('.chat-log').scrollHeight})));await shot('si-stickers-keyboard');
await page.setViewportSize({width:390,height:844});await page.locator('.terminal-shell').evaluate(el=>el.classList.remove('keyboard-open'));await page.getByRole('button',{name:'祀表情',exact:true}).click();
await page.getByLabel('和祀说说',{exact:true}).fill('今天真开心');await page.getByRole('button',{name:'发送',exact:true}).click();await page.locator('.chat-message.assistant .sticker-message__image').evaluate(async el=>el.decode());await shot('si-offline-sticker');
await nav('设置');await page.getByLabel('服务地址').fill('https://example.invalid/v1');await page.getByLabel('模型名称').fill('preview-mock');await page.getByLabel('API Key',{exact:true}).fill('preview-only-key');await page.getByRole('button',{name:'保存设置',exact:true}).click();await page.getByRole('button',{name:'关闭提示',exact:true}).click();await page.evaluate(()=>window.scrollTo(0,0));
await page.route('https://example.invalid/**',route=>route.fulfill({json:{choices:[{message:{content:JSON.stringify({reply:'这眼光不错。夸到我拿手的地方了，这句我收下。',actions:[],stickerId:'si-proud'})}}]}}));await nav('助手');await page.getByLabel('和祀说说',{exact:true}).fill('你的画真好看');await page.getByRole('button',{name:'发送',exact:true}).click();await page.getByAltText('祀表情：得意眨眼',{exact:true}).evaluate(async el=>el.decode());await shot('si-api-mock-sticker');
if(errors.length)throw Error(errors.join('\n'));console.log('Six local expressions decoded; light/dark/320/keyboard, draft kaomoji, offline and mock-provider sticker preview captured.');await browser.close();
