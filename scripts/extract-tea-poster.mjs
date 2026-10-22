import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const b=await chromium.launch({channel:'chromium'});const p=await b.newPage();
await p.goto('http://127.0.0.1:5180/previews/tea-original.mp4');
const data=await p.locator('video').evaluate(v=>new Promise((resolve,reject)=>{
 const capture=()=>{const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);resolve(c.toDataURL('image/webp',.88).split(',')[1])};
 v.onseeked=capture;v.onerror=()=>reject(Error('Video unavailable'));const seek=()=>{v.pause();v.currentTime=12};if(v.readyState>=2)seek();else v.onloadeddata=seek;
}));
await writeFile('terminal-public/previews/tea-original-poster.webp',Buffer.from(data,'base64'));await b.close();
