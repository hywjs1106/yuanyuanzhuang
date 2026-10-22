import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const dir=`references/performance-0.7/drawer-${process.env.PROFILE_TAG??'baseline'}`;await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chromium'});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const page=await context.newPage();await page.goto(process.env.PROFILE_URL??'http://127.0.0.1:5182/');
await page.getByRole('heading',{name:'帝江号',exact:true}).waitFor();await page.waitForTimeout(2300);
await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
await page.getByRole('button',{name:'助手',exact:true}).click();await page.waitForTimeout(800);
const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
const events=[];cdp.on('Tracing.dataCollected',e=>events.push(...e.value));
await cdp.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline',transferMode:'ReportEvents'});
await page.evaluate(()=>{window.__frames=[];window.__sampling=true;let last=performance.now();function tick(t){if(!window.__sampling)return;window.__frames.push(t-last);last=t;requestAnimationFrame(tick)}requestAnimationFrame(tick)});
for(let i=0;i<4;i++){await page.getByRole('button',{name:'祀表情',exact:true}).click();await page.waitForTimeout(350)}
const frames=await page.evaluate(()=>{window.__sampling=false;return window.__frames.slice(2)});
const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');await done;
const cost={};for(const e of events)if(e.ph==='X'&&['Layout','Paint','UpdateLayoutTree','FunctionCall'].includes(e.name)){const x=cost[e.name]??={count:0,ms:0,max:0};x.count++;x.ms+=(e.dur??0)/1000;x.max=Math.max(x.max,(e.dur??0)/1000)}
frames.sort((a,b)=>a-b);const result={frames:frames.length,p95:frames[Math.floor(frames.length*.95)],max:Math.max(...frames),over34:frames.filter(x=>x>34).length,cost};
console.log(JSON.stringify(result));await writeFile(`${dir}/metrics.json`,JSON.stringify(result,null,2));await writeFile(`${dir}/trace.json`,JSON.stringify({traceEvents:events}));await browser.close();
