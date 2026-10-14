import {chromium} from '@playwright/test';
import fs from 'node:fs';
const out='../references/ui-14';fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({channel:'chromium'});const c=await b.newContext({viewport:{width:390,height:844},recordVideo:{dir:out+'/video',size:{width:390,height:844}}});const p=await c.newPage();
await p.clock.install();await p.clock.pauseAt(new Date());await p.goto('http://127.0.0.1:5180/');await p.locator('.startup-emblem').waitFor();await p.waitForTimeout(300);await p.clock.runFor(700);await p.screenshot({path:out+'/opening.png'});await p.clock.resume();await p.locator('.startup-screen').waitFor({state:'detached'});
await p.waitForTimeout(500);await p.screenshot({path:out+'/home-390.png'});await p.waitForTimeout(1800);await p.getByRole('button',{name:'助手',exact:true}).click();await p.waitForTimeout(500);await p.getByRole('button',{name:'今日',exact:true}).click();await p.waitForTimeout(500);await p.getByRole('button',{name:'切换深浅模式'}).click();await p.waitForTimeout(300);await p.screenshot({path:out+'/home-dark.png'});await p.setViewportSize({width:320,height:844});await p.screenshot({path:out+'/home-320.png'});
await p.setViewportSize({width:390,height:844});await p.getByRole('button',{name:'设置',exact:true}).click();await p.screenshot({path:out+'/settings.png'});
const video=p.video();await c.close();await video.saveAs(out+'/dijiang-preview.webm');
await b.close();
