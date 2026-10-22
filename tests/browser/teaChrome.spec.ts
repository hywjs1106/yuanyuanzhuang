import {test,expect} from '@playwright/test';
test('tea chrome uses clear character navigation and new wording without changing other modes',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const mode=page.getByRole('button',{name:'切换角色风格',exact:true});await mode.click();await mode.click();await page.getByRole('button',{name:'助手',exact:true}).click();
 await expect(page.getByRole('heading',{name:'茶馆闲话',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'往日对话',exact:true})).toHaveText('往日对话');await expect(page.locator('.brand-tea')).toHaveAttribute('src','/previews/tea-number-one-chibi.webp');
 const nav=page.getByRole('navigation',{name:'功能导航',exact:true});
 for(const [width,height] of [[870,676],[390,844],[320,640]]){await page.setViewportSize({width,height});for(const dark of [false,true]){
  if((await page.locator('html').getAttribute('data-terminal-theme')==='dark')!==dark)await page.getByRole('button',{name:'切换深浅模式',exact:true}).click();
  await page.evaluate(()=>document.fonts.ready);const buttons=nav.getByRole('button');await expect(buttons).toHaveCount(3);
  for(const button of await buttons.all()){const icon=button.locator('.destination-icon'),label=button.locator(':scope > span:last-child');expect(await icon.evaluate(e=>getComputedStyle(e).borderTopWidth)).toBe('0px');const ib=await icon.boundingBox(),lb=await label.boundingBox();expect(ib!.y+ib!.height).toBeLessThanOrEqual(lb!.y+1);expect(await button.evaluate(e=>getComputedStyle(e,'::before').content)).toBe('none');}
  const input=await page.getByLabel('和祀说说',{exact:true}).boundingBox(),box=await nav.boundingBox();expect(input!.y+input!.height).toBeLessThanOrEqual(box!.y);expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width);await page.screenshot({path:`references/inn-preview/rooms/tea-chrome-${width}-${dark?'dark':'light'}.png`});
 }}
 await page.getByRole('button',{name:'往日对话',exact:true}).click();await expect(page.getByRole('log',{name:'聊天记录',exact:true})).toBeVisible();await page.getByRole('button',{name:'回到茶桌',exact:true}).click();await expect(page.getByRole('heading',{name:'茶馆闲话',exact:true})).toBeVisible();
 await nav.getByRole('button',{name:'今日',exact:true}).click();await expect(page.locator('.tea-home')).toBeVisible();await nav.getByRole('button',{name:'设置',exact:true}).click();await expect(page.getByRole('heading',{name:'设置',exact:true})).toBeVisible();await mode.click();await expect(nav).not.toHaveClass(/tea-navigation/);await mode.click();await nav.getByRole('button',{name:'助手',exact:true}).click();await expect(page.locator('.si-live-heading')).toHaveCount(0);await expect(page.locator('.brand-tea')).toHaveCount(0);
});


