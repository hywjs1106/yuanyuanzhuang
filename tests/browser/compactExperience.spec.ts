import {test,expect} from '@playwright/test';
test('compact contact keeps the portrait gesture and gives more space to chat on a small screen',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:320,height:568});await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.getByRole('button',{name:'助手',exact:true}).click();
 const contact=page.locator('.fangyi-contact');expect((await contact.boundingBox())!.height).toBeLessThanOrEqual(88);
 await expect(page.getByRole('button',{name:'和祀打个招呼',exact:true})).toBeVisible();await page.getByRole('button',{name:'和祀打个招呼',exact:true}).click();await expect(page.getByRole('figure',{name:'祀的随笔画'})).toBeVisible();
 await page.getByLabel('和祀说说',{exact:true}).fill('帮我记一下午饭花了28元');await page.getByRole('button',{name:'发送',exact:true}).click();
 const reply=page.locator('.chat-message.assistant').last();await expect(reply).toContainText('已记入账簿');await expect(reply.getByText(/已记账：/)).not.toBeVisible();
 await reply.getByText('查看完整回执',{exact:true}).click();await expect(reply.getByText(/已记账：/)).toBeVisible();await expect(page.getByRole('heading',{name:'已保存流水',exact:true})).toBeVisible();
});
test('settings groups keep drafts, budget saves independently, configured AI retains its group on return',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'设置',exact:true}).click();
 const ai=page.locator('details[data-settings-group="ai"]');const backup=page.locator('details[data-settings-group="backup"]');
 await expect(ai).toHaveAttribute('open','');await expect(backup).not.toHaveAttribute('open','');
 await page.getByLabel('模型名称',{exact:true}).fill('还没保存的模型');await ai.locator('summary').click();await expect(page.getByLabel('模型名称',{exact:true})).toHaveValue('还没保存的模型');await ai.locator('summary').click();
 await page.getByLabel('每月预算').fill('888');await page.getByRole('button',{name:'保存预算',exact:true}).click();await expect(page.getByText('预算已保存',{exact:true})).toBeVisible();await expect(page.getByLabel('模型名称',{exact:true})).toHaveValue('还没保存的模型');
 await page.getByLabel('服务地址').fill('https://example.invalid/v1');await page.getByLabel('API Key',{exact:true}).fill('test-key');await page.getByRole('button',{name:'保存设置',exact:true}).click();await expect(page.getByText('设置已保存',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'设置',exact:true}).click();await expect(ai).toHaveAttribute('open','');await expect(ai.locator('summary')).toContainText('已配置');
 await expect(page.getByLabel('模型名称',{exact:true})).toHaveValue('还没保存的模型');await expect(page.getByLabel('每月预算')).toHaveValue('888');
 await backup.locator('summary').click();await expect(page.getByRole('button',{name:'导出备份',exact:true})).toBeVisible();
});

test('folded backup keeps its preview without consuming back meant for the page',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'设置',exact:true}).click();
 const backup=page.locator('details[data-settings-group="backup"]');await backup.locator('summary').click();
 const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'导出备份',exact:true}).click();const file=await(await downloaded).path();
 await page.getByLabel('选择备份文件').setInputFiles(file!);await expect(page.getByText(/准备恢复：/)).toBeVisible();
 await backup.locator('summary').click();await expect(backup.locator('summary')).toHaveAttribute('aria-expanded','false');
 expect(await page.evaluate(()=>window.dispatchEvent(new Event('terminal-back',{cancelable:true})))).toBe(true);
 await backup.locator('summary').click();await expect(backup.locator('summary')).toHaveAttribute('aria-expanded','true');await expect(page.getByText(/准备恢复：/)).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.getByText(/准备恢复：/)).toHaveCount(0);
});
