import {test,expect} from '@playwright/test';

test('returning home reuses the four finished cutouts without worker or pixel readback work',async({page})=>{
 await page.addInitScript(()=>{
  (window as any).cutoutJobs=0;(window as any).pixelReads=0;
  const OriginalWorker=window.Worker;
  window.Worker=class extends OriginalWorker{postMessage(message:any,options?:any){(window as any).cutoutJobs++;super.postMessage(message,options);}};
  const read=CanvasRenderingContext2D.prototype.getImageData;
  CanvasRenderingContext2D.prototype.getImageData=function(...args:Parameters<typeof read>){(window as any).pixelReads++;return read.apply(this,args);};
 });
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
 await expect(page.locator('.hub-modules [data-cutout=true]')).toHaveCount(4);
 const before=await page.evaluate(()=>({jobs:(window as any).cutoutJobs,reads:(window as any).pixelReads}));
 await page.getByRole('button',{name:'助手',exact:true}).click();
 await page.getByRole('button',{name:'今日',exact:true}).click();
 await expect(page.locator('.hub-modules [data-cutout=true]')).toHaveCount(4);
 expect(await page.evaluate(()=>({jobs:(window as any).cutoutJobs,reads:(window as any).pixelReads}))).toEqual(before);
});

test('touch expression drawer never animates layout and survives interrupted close with its draft intact',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();
 await page.goto('/');await page.keyboard.press('Escape');await page.getByRole('button',{name:'助手',exact:true}).click();
 await page.getByLabel('和方宜说说',{exact:true}).fill('不要丢掉这句话');
 await page.evaluate(()=>{const animate=Element.prototype.animate;Element.prototype.animate=function(frames,options){const a=animate.call(this,frames,options);if(typeof options==='object'&&options?.id?.startsWith('panel-'))a.pause();return a;};});
 const toggle=page.getByRole('button',{name:'方宜表情',exact:true});await toggle.click();
 const keys=await page.locator('.panel-motion').evaluate(el=>el.getAnimations({subtree:true}).flatMap(a=>Object.keys((a.effect as KeyframeEffect).getKeyframes()[0])));
 expect(keys).not.toContain('height');expect(keys).not.toContain('width');
 await toggle.click();expect(await page.locator('.panel-motion').evaluate(el=>(el as HTMLElement).inert)).toBe(true);
 await toggle.click();await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.fangyi-expression-drawer')).toBeVisible();
 await toggle.click();await expect(page.locator('.panel-motion')).toHaveCount(0);await expect(page.getByLabel('和方宜说说',{exact:true})).toHaveValue('不要丢掉这句话');await context.close();
});

test('drawer keeps long-chat reading anchors and stays reachable at the bottom',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
 await page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');await terminalDb.messages.bulkPut(Array.from({length:24},(_,i)=>({id:`smooth-${i}`,role:i%2?'assistant':'user',character:'si',text:`这是一段验证阅读位置的合成聊天 ${i}。`.repeat(4),createdAt:new Date(Date.UTC(2026,9,20,1,i)).toISOString()})));});
 await page.getByRole('button',{name:'助手',exact:true}).click();const log=page.getByRole('log');await expect(page.locator('[data-message-id]')).toHaveCount(24);
 const toggle=page.getByRole('button',{name:'祀表情',exact:true});
 await log.evaluate(el=>{el.scrollTop=600;el.dispatchEvent(new Event('scroll'));});
 const before=await log.evaluate(el=>el.scrollTop);await page.emulateMedia({reducedMotion:'no-preference'});
 await toggle.click();await page.waitForTimeout(240);expect(await log.evaluate(el=>el.scrollTop)).toBeCloseTo(before,0);
 await toggle.click();await expect(page.locator('.panel-motion')).toHaveCount(0);expect(await log.evaluate(el=>el.scrollTop)).toBeCloseTo(before,0);
 await log.evaluate(el=>{el.scrollTop=el.scrollHeight;el.dispatchEvent(new Event('scroll'));});
 await expect.poll(()=>log.evaluate(el=>el.scrollHeight-el.clientHeight-el.scrollTop)).toBeLessThan(2);
 await toggle.click();await page.waitForTimeout(240);
 expect(await log.evaluate(el=>el.scrollHeight-el.clientHeight-el.scrollTop)).toBeLessThan(2);
 await expect(page.getByRole('group',{name:'插入颜文字'})).toBeInViewport();
 await page.getByRole('button',{name:'插入颜文字 (￣▽￣)',exact:true}).click();await expect(page.getByLabel('和祀说说',{exact:true})).toHaveValue('(￣▽￣)');await expect(page.getByLabel('和祀说说',{exact:true})).toBeFocused();
});
