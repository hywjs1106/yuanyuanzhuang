import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const dir='../references/ui-47';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chromium'});
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:5180/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
await page.getByRole('navigation').getByRole('button',{name:'设置',exact:true}).click();
await page.getByLabel('想让助手记住的事').fill('喜欢茉莉花茶，下午尽量不喝咖啡。');await page.getByRole('button',{name:'记住这件事',exact:true}).click();
for(const theme of ['light','dark']){
 if(theme==='dark')await page.getByRole('button',{name:'切换深浅模式'}).click();
 await page.getByRole('region',{name:'角色记忆'}).scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/memory-${theme}.png`});
 await page.getByRole('navigation').getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开记账',exact:true}).click();await page.getByRole('button',{name:'记一笔',exact:true}).click();
 await page.getByLabel('金额',{exact:true}).fill('28');await page.getByLabel('备注',{exact:true}).fill('茉莉花茶与点心');await page.getByRole('button',{name:'保存流水',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/ledger-${theme}.png`});
 await page.getByRole('navigation').getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开提醒',exact:true}).click();await page.getByRole('button',{name:'新增提醒',exact:true}).click();await page.getByLabel('事项',{exact:true}).fill('给窗边的小花浇水');await page.getByRole('button',{name:'保存提醒',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/reminder-${theme}.png`});
 await page.getByRole('navigation').getByRole('button',{name:'设置',exact:true}).click();
}
await page.setViewportSize({width:320,height:568});await page.getByRole('region',{name:'角色记忆'}).getByRole('button',{name:'修改',exact:true}).click();await page.getByRole('button',{name:'保存记忆',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/memory-small.png`});
await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.getByRole('region',{name:'角色记忆'}).scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/fangyi-small.png`});
await browser.close();
