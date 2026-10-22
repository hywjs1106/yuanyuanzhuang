import {test,expect} from '@playwright/test';

test('leaving settings batches animation inspection instead of forcing every hidden form to resolve',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'设置',exact:true}).click();await expect(page.getByLabel('模型名称',{exact:true})).toBeVisible();
 await page.emulateMedia({reducedMotion:'no-preference'});
 const work=await page.evaluate(()=>{
  const original=Element.prototype.getAnimations;const inspected:string[]=[];
  Element.prototype.getAnimations=function(options){if(this.closest('main.terminal-content'))inspected.push(this.tagName);return original.call(this,options);};
  try{(document.querySelector('.bottom-navigation button') as HTMLButtonElement).click();return {inspected};}finally{Element.prototype.getAnimations=original;}
 });
 expect(work.inspected.length,JSON.stringify(work.inspected)).toBeLessThanOrEqual(2);
 await expect(page.getByRole('button',{name:'打开记账',exact:true})).toBeVisible();await page.locator('.ink-route-previous').waitFor({state:'detached'});
});

test('outgoing snapshot never resolves styles or layout of closed settings contents',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'设置',exact:true}).click();
 await page.locator('[data-settings-group=ai] summary').click();await page.emulateMedia({reducedMotion:'no-preference'});
 const hiddenReads=await page.evaluate(()=>{
  const original=window.getComputedStyle;const reads:string[]=[];
  window.getComputedStyle=function(element,pseudo){if(element.matches('input,textarea,select')&&element.closest('details:not([open])'))reads.push(element.tagName);return original.call(window,element,pseudo);};
  try{(document.querySelector('.bottom-navigation button') as HTMLButtonElement).click();return reads;}finally{window.getComputedStyle=original;}
 });
 expect(hiddenReads).toEqual([]);
});

test('settings folds settle layout once and move following content without scaling text',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'设置',exact:true}).click();
 const ai=page.locator('[data-settings-group=ai]');const next=page.locator('[data-settings-group=weather]');
 await ai.locator('summary').scrollIntoViewIfNeeded();const before=await next.boundingBox();expect(before).not.toBeNull();
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>{const original=Element.prototype.animate;Element.prototype.animate=function(frames,options){const a=original.call(this,frames,options);if(typeof options==='object'&&options?.id?.startsWith('panel-')){a.pause();a.currentTime=0;}return a;};});
 await ai.locator('summary').click();
 const motion=await ai.evaluate(el=>el.getAnimations().flatMap(a=>(a.effect as KeyframeEffect).getKeyframes()));
 expect(motion.some(frame=>'height' in frame)).toBe(false);
 const first=await next.boundingBox();expect(Math.abs(first!.y-before!.y)).toBeLessThan(1);
 await page.evaluate(()=>document.getAnimations().filter(a=>a.id.startsWith('panel-')).forEach(a=>a.finish()));
 await expect(ai).not.toHaveAttribute('open','');
 const end=await next.boundingBox();expect(end!.y).toBeLessThan(before!.y-100);
 await ai.locator('summary').click();await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.getByLabel('模型名称',{exact:true})).toBeVisible();
});

test('overlapping folds keep downstream motion additive and restore shared scroll policy',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'设置',exact:true}).click();
 const result=await page.evaluate(async()=>{
  const ai=document.querySelector<HTMLElement>('[data-settings-group=ai]')!;const weather=document.querySelector<HTMLElement>('[data-settings-group=weather]')!;const after=document.querySelector<HTMLElement>('[data-settings-group=backup]')!;
  const parent=ai.parentElement!;const anchor=parent.style.overflowAnchor;
  const original=Element.prototype.animate;Element.prototype.animate=function(frames,options){const a=original.call(this,frames,options);if(typeof options==='object'&&options?.id?.startsWith('panel-')){a.pause();a.currentTime=0;}return a;};
  return {anchor};
 });
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('[data-settings-group=ai] summary').scrollIntoViewIfNeeded();
 await page.evaluate(()=>(document.querySelector('[data-settings-group=ai] summary') as HTMLElement).click());
 const top=await page.locator('[data-settings-group=backup]').evaluate(el=>el.getBoundingClientRect().top);
 await page.evaluate(()=>(document.querySelector('[data-settings-group=weather] summary') as HTMLElement).click());
 expect(await page.locator('[data-settings-group=backup]').evaluate(el=>el.getBoundingClientRect().top)).toBeCloseTo(top,0);
 await page.evaluate(()=>document.getAnimations().filter(a=>a.id.startsWith('panel-')).forEach(a=>a.finish()));
 await expect.poll(()=>page.locator('[data-settings-group=ai]').evaluate(el=>(el.parentElement as HTMLElement).style.overflowAnchor)).toBe(result.anchor);
});

test('touch navigation uses one live page with a composited arrival instead of a duplicate page painting',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();await page.goto('/');await page.getByRole('heading',{name:'帝江号',exact:true}).waitFor();await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'设置',exact:true}).click();
 await expect(page.locator('main.terminal-content')).toHaveAttribute('data-motion-render','direct');
 await expect(page.locator('.ink-route-previous')).toHaveCount(0);
 const clip=await page.locator('main.terminal-content').evaluate(el=>getComputedStyle(el).clipPath);expect(clip).toBe('none');
 await expect(page.getByLabel('模型名称',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'今日',exact:true}).click();await expect(page.locator('main.terminal-content')).toHaveAttribute('data-route-kind','tab');
 await page.getByRole('button',{name:'打开记账',exact:true}).click();await expect(page.locator('main.terminal-content')).toHaveAttribute('data-route-kind','push');
 await page.getByRole('button',{name:'今日',exact:true}).click();await expect(page.locator('main.terminal-content')).toHaveAttribute('data-route-kind','pop');
 await page.getByRole('button',{name:'助手',exact:true}).click();await expect(page.getByLabel('和方宜说说',{exact:true})).toBeVisible();await context.close();
});

test('first visits at the top never force a redundant synchronous scroll layout',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'打开记账',exact:true}).waitFor();
 await page.evaluate(()=>{(window as any).__scrollCalls=0;const original=window.scrollTo;window.scrollTo=function(...args:any[]){(window as any).__scrollCalls++;return (original as any).apply(window,args);};});
 await page.getByRole('button',{name:'助手',exact:true}).click();await page.getByRole('button',{name:'设置',exact:true}).click();await page.getByRole('button',{name:'今日',exact:true}).click();
 expect(await page.evaluate(()=>(window as any).__scrollCalls)).toBe(0);
});
