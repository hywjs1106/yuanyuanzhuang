import {test,expect} from '@playwright/test';
async function si(page:any){await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();}
test('ink ledger keeps dated records, editing, search and reload persistence',async({page})=>{
 await si(page);await page.getByRole('button',{name:'打开记账',exact:true}).click();
 await page.getByRole('button',{name:'记一笔',exact:true}).click();await page.getByLabel('金额',{exact:true}).fill('28.50');await page.getByLabel('备注',{exact:true}).fill('午饭与一杯茶');await page.getByLabel('分类',{exact:true}).selectOption('food');await page.getByRole('button',{name:'保存流水',exact:true}).click();
 await expect(page.getByText('已记入账簿',{exact:true})).toBeVisible();await expect(page.locator('.ledger-day')).toHaveCount(1);await expect(page.locator('.ledger-item .paper-icon')).toHaveCount(1);
 await page.getByRole('button',{name:'编辑午饭与一杯茶',exact:true}).click();await page.getByLabel('金额',{exact:true}).fill('30');await page.getByRole('button',{name:'保存流水',exact:true}).click();await expect(page.locator('.ledger-item>strong')).toHaveText('-¥30.00');
 await page.getByLabel('搜索流水',{exact:true}).fill('不存在');await expect(page.getByText('没有找到这笔流水',{exact:true})).toBeVisible();await page.getByLabel('搜索流水',{exact:true}).fill('');await page.reload();await page.getByRole('button',{name:'打开记账',exact:true}).click();await expect(page.getByText('午饭与一杯茶',{exact:true})).toBeVisible();
});
test('ink reminders open one paper at a time, return focus, complete and preserve status after reload',async({page})=>{
 await si(page);await page.getByRole('button',{name:'打开提醒',exact:true}).click();await page.getByRole('button',{name:'新增提醒',exact:true}).click();await page.getByLabel('事项',{exact:true}).fill('浇花');await page.getByRole('button',{name:'保存提醒',exact:true}).click();
 await expect(page.getByText('提醒已收好',{exact:true})).toBeVisible();await expect(page.getByRole('article',{name:'选中提醒详情'})).toHaveCount(0);
 const row=page.getByRole('button',{name:'查看提醒：浇花',exact:true});await row.click();await expect(page.getByRole('heading',{name:'浇花',exact:true})).toBeFocused();await expect(page.getByRole('navigation',{name:'提醒事项列表'})).toHaveCount(0);
 await page.getByRole('button',{name:'返回便笺',exact:true}).click();await expect(row).toBeFocused();await row.click();await page.getByRole('button',{name:'完成',exact:true}).click();await expect(page.locator('.mission-status')).toHaveText('已完成');await page.getByRole('button',{name:'返回便笺',exact:true}).click();await expect(page.getByRole('region',{name:'已完成',exact:true})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'打开提醒',exact:true}).click();await expect(page.getByRole('region',{name:'已完成',exact:true})).toBeVisible();
});
test('ink forms and paper lists fit short phones in both palettes',async({page})=>{
 await page.setViewportSize({width:320,height:568});await si(page);
 for(const tool of ['记账','提醒']){await page.getByRole('button',{name:`打开${tool}`,exact:true}).click();await page.getByRole('button',{name:tool==='记账'?'记一笔':'新增提醒',exact:true}).click();for(let i=0;i<2;i++){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();for(const input of await page.locator('.terminal-form input,.terminal-form select,.terminal-form textarea').all()){const b=await input.boundingBox();expect(b!.x).toBeGreaterThanOrEqual(0);expect(b!.x+b!.width).toBeLessThanOrEqual(320);}await page.getByRole('button',{name:'切换深浅模式'}).click();}await page.getByRole('button',{name:'今日',exact:true}).click();}
});
