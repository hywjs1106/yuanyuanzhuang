import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const dir='references/performance-0.7/'+(process.env.PROFILE_TAG??'production');await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chromium'});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
if(process.env.PROFILE_SKIP_TIME)await context.addInitScript(()=>{const original=Element.prototype.setAttribute;Element.prototype.setAttribute=function(name,value){return original.call(this,name,this instanceof HTMLInputElement&&name==='type'&&value==='time'?'text':value);};});
const page=await context.newPage();await page.goto(process.env.PROFILE_URL??'http://127.0.0.1:5182/');await page.getByRole('heading',{name:'帝江号',exact:true}).waitFor();await page.waitForTimeout(2300);
const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
async function sample(name,act){
 await page.evaluate(()=>{window.__frames=[];window.__sampling=true;let last=performance.now();function tick(now){if(!window.__sampling)return;window.__frames.push(now-last);last=now;requestAnimationFrame(tick)}requestAnimationFrame(tick)});
 const chunks=[];const handler=d=>chunks.push(...d.value);cdp.on('Tracing.dataCollected',handler);
 await cdp.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline',transferMode:'ReportEvents'});
 if(act)await act();else await page.waitForTimeout(3600);
 const ended=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');await ended;cdp.off('Tracing.dataCollected',handler);
 const frames=await page.evaluate(()=>{window.__sampling=false;return window.__frames.slice(2)});frames.sort((a,b)=>a-b);
 const cost={};for(const e of chunks){if(e.ph==='X'&&e.dur&&['Paint','Layout','UpdateLayoutTree','PrePaint','RasterTask','FunctionCall'].includes(e.name)){const x=cost[e.name]??={count:0,ms:0,max:0};x.count++;x.ms+=e.dur/1000;x.max=Math.max(x.max,e.dur/1000)}}
 const result={name,frames:frames.length,p50:frames[Math.floor(frames.length*.5)],p95:frames[Math.floor(frames.length*.95)],over34:frames.filter(x=>x>34).length,max:Math.max(...frames),cost};console.log(JSON.stringify(result));
 await writeFile(dir+'/'+name+'-trace.json',JSON.stringify({traceEvents:chunks}));return result;
}
if(process.env.PROFILE_CSS)await page.addStyleTag({content:process.env.PROFILE_CSS});
const results=[];results.push(await sample('fangyi-idle'));
await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.waitForTimeout(2600);results.push(await sample('si-idle'));
await page.screenshot({path:dir+'/si-baseline.png'});
results.push(await sample('si-navigation',async()=>{for(const name of ['助手','设置','今日','助手','今日']){await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name,exact:true}).click();await page.waitForTimeout(450)}}));
results.push(await sample('si-navigation-warm',async()=>{for(const name of ['助手','设置','今日','助手','今日']){await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name,exact:true}).click();await page.waitForTimeout(450)}}));
const animations=await page.evaluate(()=>document.getAnimations().map(a=>{const el=a.effect?.target;const cs=el&&getComputedStyle(el);return {name:a.animationName,element:el?.tagName,cls:el?.getAttribute('class'),filter:cs?.filter,backdrop:cs?.backdropFilter,keyframes:a.effect?.getKeyframes().map(k=>Object.keys(k))}}));
await writeFile(dir+'/baseline.json',JSON.stringify({results,animations},null,2));await browser.close();
