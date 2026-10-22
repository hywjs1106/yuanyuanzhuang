import {chromium} from '@playwright/test';
const b=await chromium.launch({channel:'chromium'});const p=await b.newPage({viewport:{width:600,height:900}});
await p.goto('http://127.0.0.1:5180/inn-preview.html');
await p.setContent('<style>body{margin:0;background:#ddd}video{display:block;max-width:600px;max-height:900px}</style><video muted preload="auto" src="http://127.0.0.1:5180/references/inn-preview/reference-screen-recording.mp4"></video>');
await p.locator('video').evaluate(v=>new Promise((resolve,reject)=>{v.onloadeddata=resolve;v.onerror=()=>reject(Error('video failed'));if(v.readyState>=2)resolve();}));
console.log(await p.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight})));
for(const t of [0.2,3,7,12]){await p.locator('video').evaluate((v,t)=>new Promise(resolve=>{v.onseeked=resolve;v.currentTime=t;}),t);await p.screenshot({path:`references/inn-preview/reference-${t}.png`});}
await b.close();
