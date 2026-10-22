import {test,expect} from '@playwright/test';
test('Si entries use the six official doodles with static reduced motion and unchanged navigation',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
 for(const [tool,kind] of [['记账','endmin-male'],['提醒','endmin-female'],['天气','perlica'],['黄历','si']])await expect(page.getByRole('button',{name:`打开${tool}`,exact:true}).locator(`[data-doodle="${kind}"] canvas`)).toBeVisible();
 await expect(page.locator('.overview-hub video')).toHaveCount(0);
 await page.getByRole('button',{name:'打开记账',exact:true}).click();await expect(page.locator('.paper-scene [data-doodle="minghe"]')).toBeVisible();
 await page.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开提醒',exact:true}).click();await expect(page.locator('.paper-scene [data-doodle="arcane"]')).toBeVisible();
});
test('only one doodle plays and reduced motion removes the decoder',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await expect(page.locator('.overview-hub video')).toHaveCount(1);await page.waitForTimeout(2300);expect(await page.locator('.overview-hub video').count()).toBeLessThanOrEqual(1);
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.overview-hub video')).toHaveCount(0);await expect(page.locator('.hub-modules [data-doodle] img')).toHaveCount(4);
});

test('greeting ends after four clips; media failure keeps the poster and navigation usable',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
 for(let i=0;i<4;i++){await expect(page.locator('.overview-hub video')).toHaveCount(1);await page.locator('.overview-hub video').dispatchEvent('ended');}
 await expect(page.locator('.overview-hub video')).toHaveCount(0);
 await page.route('**/themes/si/doodles/*.mp4',route=>route.abort());await page.getByRole('button',{name:'打开记账',exact:true}).hover();await expect(page.locator('.overview-hub video')).toHaveCount(0);await expect(page.locator('[data-doodle="endmin-male"] canvas')).toBeVisible();await page.getByRole('button',{name:'打开记账',exact:true}).click();await expect(page.getByRole('heading',{name:'记账',exact:true})).toBeVisible();
});
test('small dark scene fits all four targets, and Fangyi remains unchanged',async({page})=>{
 await page.setViewportSize({width:320,height:568});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.getByRole('button',{name:'切换深浅模式'}).click();await expect(page.locator('html')).toHaveAttribute('data-terminal-theme','dark');
 const nav=await page.locator('.bottom-navigation').boundingBox();for(const button of await page.locator('.hub-plate').all()){const b=await button.boundingBox();expect(b!.x).toBeGreaterThanOrEqual(0);expect(b!.x+b!.width).toBeLessThanOrEqual(320);expect(b!.y+b!.height).toBeLessThanOrEqual(nav!.y);}
 await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await expect(page.getByAltText('帝江号飞船',{exact:true})).toBeVisible();await expect(page.locator('.hub-modules [data-doodle]')).toHaveCount(0);
});
test('startup and background visibility do not leave a playing doodle',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.reload();await expect(page.locator('.startup-screen')).toBeVisible();await expect(page.locator('.overview-hub video')).toHaveCount(0);await page.locator('.startup-screen').waitFor({state:'detached'});await expect(page.locator('.overview-hub video')).toHaveCount(1);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator('.overview-hub video')).toHaveCount(0);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});await page.waitForTimeout(300);await expect(page.locator('.overview-hub video')).toHaveCount(0);
});
test('doodles preserve opaque original colors in both palettes and business headers',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
 const check=async()=>{for(const stage of await page.locator('[data-doodle]').all()){
  for(const media of await stage.locator("img,video").all())expect(await media.evaluate(el=>getComputedStyle(el).filter)).toBe("none");
  const visual=await stage.evaluate(el=>{let node:Element|null=el;const effects=[];while(node&&node!==document.documentElement){const s=getComputedStyle(node);effects.push([s.mixBlendMode,s.filter,s.opacity,s.maskImage]);node=node.parentElement;}return effects;});
  for(const [blend,filter,opacity,mask] of visual){expect(blend).toBe('normal');expect(filter).toBe('none');expect(opacity).toBe('1');expect(mask).toBe('none');}
 }};
 await check();await page.getByRole('button',{name:'切换深浅模式'}).click();await expect(page.locator('html')).toHaveAttribute('data-terminal-theme','dark');await check();
 await page.getByRole('button',{name:'打开记账',exact:true}).click();await check();await page.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开提醒',exact:true}).click();await check();
});

test('cutout clears the paper while retaining opaque colors in posters and video frames',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
 for(const stage of await page.locator('.hub-modules [data-doodle]').all()){
  await expect(stage).toHaveAttribute('data-cutout','true');
  const counts=await stage.locator('canvas').evaluate((canvas:HTMLCanvasElement)=>{const data=canvas.getContext('2d')!.getImageData(0,0,canvas.width,canvas.height).data;let solid=0,paper=0;for(let i=0;i<data.length;i+=4){if(data[i+3]===0)paper++;if(data[i+3]===255)solid++;}return {corner:data[3],solid,paper};});
  expect(counts.corner).toBe(0);expect(counts.solid).toBeGreaterThan(1500);expect(counts.paper).toBeGreaterThan(50000);expect(await stage.evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
 }
 await page.emulateMedia({reducedMotion:'no-preference'});await page.getByRole('button',{name:'打开黄历',exact:true}).hover();await expect(page.locator('.overview-hub video')).toHaveCount(1);await page.waitForTimeout(300);const alpha=await page.locator('[data-doodle="si"] canvas').evaluate((canvas:HTMLCanvasElement)=>canvas.getContext('2d')!.getImageData(0,0,1,1).data[3]);expect(alpha).toBe(0);
});
test('Perlica turning frame keeps the pale crown opaque while removing surrounding paper',async({page})=>{
 await page.goto('/');const sample=await page.evaluate(async()=>{
  const {renderDoodlePaper}=await import('/src/terminal/doodlePaperRenderer.ts');const video=document.createElement('video');video.src='/themes/si/doodles/perlica.mp4';await new Promise<void>(resolve=>video.onloadeddata=()=>resolve());video.currentTime=1.2;await new Promise<void>(resolve=>video.onseeked=()=>resolve());
  const canvas=document.createElement('canvas');canvas.width=384;canvas.height=216;const context=canvas.getContext('2d')!;context.drawImage(video,0,0,384,216);const frame=context.getImageData(0,0,384,216);const p=(43*384+210)*4;const original=Array.from(frame.data.slice(p,p+4));const pixels=await renderDoodlePaper(frame.data,384,216);video.removeAttribute('src');video.load();return {original,result:Array.from(pixels.slice(p,p+4)),corner:pixels[3]};
 });expect(sample.result).toEqual(sample.original);expect(sample.corner).toBe(0);
});
test('weather and almanac reject opaque tinted frames instead of displaying white paper',async({page})=>{
 await page.goto('/');const frames=await page.evaluate(async()=>{
  const {renderDoodlePaper}=await import('/src/terminal/doodlePaperRenderer.ts');const frames=[];
  for(const [kind,times] of [['perlica',[1.41,1.46,1.51]],['si',[1.16,1.21,1.26]]] as const){
   const video=document.createElement('video');video.src=`/themes/si/doodles/${kind}.mp4`;await new Promise<void>(resolve=>video.onloadeddata=()=>resolve());const canvas=document.createElement('canvas');canvas.width=384;canvas.height=216;const context=canvas.getContext('2d')!;
   for(const time of times){video.currentTime=time;await new Promise<void>(resolve=>video.onseeked=()=>resolve());context.drawImage(video,0,0,384,216);const image=context.getImageData(0,0,384,216);try{const pixels=await renderDoodlePaper(image.data,384,216);let transparent=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]===0)transparent++;frames.push({kind,time,corner:pixels[3],transparent,rejected:false});}catch{frames.push({kind,time,rejected:true});}}
   video.removeAttribute('src');video.load();
  }return frames;
 });for(const frame of frames){if((frame.kind==='perlica'&&frame.time===1.46)||(frame.kind==='si'&&[1.16,1.21].includes(frame.time)))expect(frame.rejected).toBe(true);else{expect(frame.rejected).toBe(false);expect(frame.corner).toBe(0);expect(frame.transparent!).toBeGreaterThan(50000);}}
});

test('rejected weather and almanac frames retain their last cutout without revealing raw posters',async({page})=>{
 await page.addInitScript(()=>{
  (window as any).rejectDoodleFrames=false;(window as any).rejectedDoodleCount=0;const OriginalWorker=window.Worker;
  window.Worker=class extends OriginalWorker{postMessage(message:any,options?:any){if((window as any).rejectDoodleFrames){(window as any).rejectedDoodleCount++;queueMicrotask(()=>this.dispatchEvent(new MessageEvent('message',{data:{id:message.id,error:'Incomplete cutout'}})));}else super.postMessage(message,options);}};
 });
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await expect(page.locator('.hub-modules [data-cutout=true]')).toHaveCount(4);await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(10000);
 const checksum=async(kind:string)=>page.locator(`[data-doodle="${kind}"] canvas`).evaluate((canvas:HTMLCanvasElement)=>{const data=canvas.getContext('2d')!.getImageData(0,0,canvas.width,canvas.height).data;return data.reduce((sum,value,index)=>(sum+value*(index%13+1))%2147483647,0);});
 for(const [kind,label] of [['perlica','天气'],['si','黄历']]){
  const before=await checksum(kind);await page.evaluate(()=>(window as any).rejectDoodleFrames=true);await page.getByRole('button',{name:`打开${label}`,exact:true}).hover();const figure=page.locator(`[data-doodle="${kind}"]`);await expect(figure).toHaveAttribute('data-render-error','true');await page.waitForTimeout(200);await expect(figure).toHaveAttribute('data-cutout','true');expect(await checksum(kind)).toBe(before);await expect(figure.locator('img')).toBeHidden();await expect(figure.locator('canvas')).toBeVisible();await page.evaluate(()=>(window as any).rejectDoodleFrames=false);await page.mouse.move(190,400);await page.waitForTimeout(1800);
 }
 expect(await page.evaluate(()=>(window as any).rejectedDoodleCount)).toBeGreaterThanOrEqual(2);
});
test('independent ink sparrow replaces duplicate Minghe and animates on hover without a video',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();const bird=page.getByRole('button',{name:'让小团雀动一动',exact:true});await expect(bird).toBeVisible();await expect(page.locator('.si-heading-companion [data-doodle]')).toHaveCount(0);expect((await bird.boundingBox())!.width).toBeGreaterThanOrEqual(80);await expect(bird).toHaveAttribute('data-animating','false');await page.emulateMedia({reducedMotion:'no-preference'});await bird.hover();await expect(bird).toHaveAttribute('data-animating','true');expect(await bird.locator('.ink-sparrow-poses').evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0);await expect(bird.locator('video')).toHaveCount(0);await page.mouse.move(190,400);await expect(bird).toHaveAttribute('data-animating','false');await bird.click();await expect(bird).toHaveAttribute('data-animating','true');await page.mouse.move(190,400);await expect(bird).toHaveAttribute('data-animating','false',{timeout:2200});await page.emulateMedia({reducedMotion:'reduce'});await bird.hover();await expect(bird).toHaveAttribute('data-animating','false');
});

test('ink sparrow stops when hidden or outside the viewport and leaves the clock clear',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();const bird=page.getByRole('button',{name:'让小团雀动一动',exact:true});await bird.hover();await expect(bird).toHaveAttribute('data-animating','true');await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await expect(bird).toHaveAttribute('data-animating','false');await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});await page.mouse.move(190,400);await bird.hover();await expect(bird).toHaveAttribute('data-animating','true');await bird.evaluate(el=>{el.style.transform='translateY(-2000px)';});await expect(bird).toHaveAttribute('data-animating','false');await bird.evaluate(el=>{el.style.transform='';});await page.setViewportSize({width:320,height:568});const bounds=await bird.boundingBox(),clock=await page.locator('.hub-heading-meta').boundingBox();expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(clock!.x);
});
