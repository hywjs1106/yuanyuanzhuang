import {go} from './navigation';
import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
mkdirSync('../references/ui-08',{recursive:true});

test('ledger report prioritizes real balance while long monthly totals fit narrow viewports',async({page})=>{
 await page.goto('/');await go(page,'记账');
 await page.getByRole('button',{name:'记一笔',exact:true}).click();await page.getByRole('combobox',{name:'方向',exact:true}).selectOption('income');await page.getByLabel('金额',{exact:true}).fill('90000000');await page.getByLabel('备注',{exact:true}).fill('测试收入');await page.getByRole('button',{name:'保存流水',exact:true}).click();
 const summary=page.locator('.stat-row');await expect(summary).toContainText('90000000.00');
 for(const width of [320,414]){
  await page.setViewportSize({width,height:740});const primary=summary.locator('strong').first();const secondary=summary.locator('strong').nth(1);
  const sizes=await Promise.all([primary,secondary].map(el=>el.evaluate(node=>parseFloat(getComputedStyle(node).fontSize))));expect(sizes[0]).toBeGreaterThanOrEqual(sizes[1]*1.25);
  for(const value of await summary.locator('strong').all()){expect(await value.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBeTruthy();}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 }
 await page.screenshot({path:'../references/ui-08/ledger-large-value.png'});await page.reload();await go(page,'记账');await expect(summary).toContainText('90000000.00');
});

test('selected navigation has readable contrast immediately after changing destinations',async({page})=>{
 const rgb=(value:string)=>value.match(/[\d.]+/g)!.map(Number);
 const luminance=(color:number[])=>color.slice(0,3).map(v=>{const n=v/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
 await page.goto('/');
 for(const name of ['设置','助手','今日']){
  const nav=page.getByRole('navigation',{name:'功能导航'});await nav.getByRole('button',{name,exact:true}).click();
  const colors=await nav.locator('[aria-current=page]').evaluate(el=>({text:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor,parent:getComputedStyle(el.parentElement!).backgroundColor}));
  const fg=rgb(colors.text),raw=rgb(colors.background),parent=rgb(colors.parent),alpha=raw[3]??1;const bg=raw.slice(0,3).map((v,i)=>v*alpha+parent[i]*(1-alpha));
  const values=[luminance(fg),luminance(bg)].sort((a,b)=>b-a);expect((values[0]+.05)/(values[1]+.05)).toBeGreaterThanOrEqual(4.5);
 }
});

test('reminder selection and deselection preserve text contrast on the first frame',async({page})=>{
 const rgb=(value:string)=>value.match(/[\d.]+/g)!.map(Number);
 const luminance=(color:number[])=>color.slice(0,3).map(v=>{const n=v/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
 await page.goto('/');await go(page,'提醒');
 for(const title of ['测试甲','测试乙']){await page.getByRole('button',{name:'新增提醒',exact:true}).click();await page.getByLabel('事项',{exact:true}).fill(title);await page.getByLabel('日期与时间').fill('2027-03-15T09:00');await page.getByRole('button',{name:'保存提醒',exact:true}).click();}
 for(const title of ['测试乙','测试甲']){
  await page.getByRole('button',{name:`查看提醒：${title}`,exact:true}).click();
  for(const row of await page.locator('.mission-row').all()){
   const colors=await row.evaluate(el=>({text:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor}));const values=[luminance(rgb(colors.text)),luminance(rgb(colors.background))].sort((a,b)=>b-a);expect((values[0]+.05)/(values[1]+.05)).toBeGreaterThanOrEqual(4.5);
  }
 }
});
