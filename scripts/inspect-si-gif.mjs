import {chromium} from '@playwright/test';
const b=await chromium.launch({channel:'chromium'});const p=await b.newPage({viewport:{width:1200,height:720}});
await p.setContent('<style>body{margin:0;background:#ddd}video{width:1138px;height:640px}</style><video muted preload="auto" src="https://video.twimg.com/tweet_video/HUkyn3UbAAADgdM.mp4"></video>');
await p.locator('video').evaluate(v=>new Promise((resolve,reject)=>{v.onloadeddata=resolve;v.onerror=()=>reject(Error('video failed'));if(v.readyState>=2)resolve();}));
console.log(await p.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight})));
for(const t of [0,1,2,3,4]){await p.locator('video').evaluate((v,t)=>new Promise(resolve=>{v.onseeked=resolve;v.currentTime=t;if(t===0)resolve();}),t);await p.screenshot({path:`../references/ui-44/selfportrait-motion-${t}.png`});}
await b.close();
