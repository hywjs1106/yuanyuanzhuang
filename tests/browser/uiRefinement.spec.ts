import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
mkdirSync('../references/ui-07',{recursive:true});

test('corner controls and navigation remain readable and separated on small phones',async({page})=>{
 for(const width of [320,390,414]){
  await page.setViewportSize({width,height:844});await page.goto('/');
  const map=await page.locator('.hub-map-stage').boundingBox();
  for(const plate of await page.locator('.hub-plate').all()){
   const rect=await plate.boundingBox();expect(rect!.height).toBeGreaterThanOrEqual(48);
   expect(await plate.locator('small').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(11);
   expect(rect!.y+rect!.height<=map!.y-3||rect!.y>=map!.y+map!.height+3).toBeTruthy();
   const icon=await plate.locator('svg').boundingBox();expect(icon!.x).toBeGreaterThanOrEqual(rect!.x+8);expect(icon!.x+icon!.width).toBeLessThanOrEqual(rect!.x+rect!.width-8);
  }
  for(const target of await page.getByRole('navigation',{name:'功能导航'}).getByRole('button').all()){
   const rect=await target.boundingBox();expect(rect!.height).toBeGreaterThanOrEqual(48);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 }
});

test('conversation body stays legible in both themes and when the keyboard reduces the viewport',async({page})=>{
 await page.goto('/');await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'助手',exact:true}).click();
 expect(await page.locator('.chat-bubble p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(15);
 await page.getByRole('button',{name:'切换深浅模式'}).click();await expect(page.locator('html')).toHaveAttribute('data-terminal-theme','dark');
 await page.setViewportSize({width:320,height:520});await page.locator('.terminal-shell').evaluate(el=>el.classList.add('keyboard-open'));
 const input=await page.getByRole('textbox',{name:'和方宜说说'}).boundingBox();const button=await page.getByRole('button',{name:'发送',exact:true}).boundingBox();
 expect(input!.y+input!.height).toBeLessThanOrEqual(520);expect(button!.y+button!.height).toBeLessThanOrEqual(520);expect(button!.height).toBeGreaterThanOrEqual(48);
 await page.getByRole('button',{name:'方宜表情',exact:true}).click();await expect(page.getByRole('textbox',{name:'和方宜说说'})).toBeVisible();await page.screenshot({path:'../references/ui-07/keyboard-chat-dark.png'});
});
