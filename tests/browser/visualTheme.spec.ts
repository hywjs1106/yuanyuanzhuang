import {test,expect} from '@playwright/test';

test('painting edition persists, restores Fangyi and does not discard settings drafts',async({page})=>{
  await page.goto('/');
  await expect(page.getByAltText('帝江号飞船')).toBeVisible();
  const toggle=page.getByRole('button',{name:'切换角色风格',exact:true});
  await toggle.click();await expect(page.locator('html')).toHaveAttribute('data-terminal-visual','si');
  await expect(page.getByAltText('祀主题山水画')).toBeVisible();
  await page.reload();await expect(page.locator('html')).toHaveAttribute('data-terminal-visual','si');
  await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'设置',exact:true}).click();
  await page.getByLabel('模型名称',{exact:true}).fill('draft-model');
  await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
  await expect(page.getByLabel('模型名称',{exact:true})).toHaveValue('draft-model');
  await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'今日',exact:true}).click();
  await expect(page.getByAltText('帝江号飞船')).toBeVisible();
  await expect(page.getByAltText('祀主题山水画')).toHaveCount(0);
});

test('switching companion aborts a pending request and never moves its response to the new chat',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  let requested=false;await page.route('https://example.invalid/**',()=>{requested=true;});
  await page.goto('/');await page.getByRole('button',{name:'设置',exact:true}).click();
  await page.getByLabel('服务地址').fill('https://example.invalid/v1');await page.getByLabel('模型名称').fill('test-model');await page.getByLabel('API Key',{exact:true}).fill('test-only-key');await page.getByRole('button',{name:'保存设置'}).click();
  await page.getByRole('button',{name:'助手',exact:true}).click();
  await page.getByLabel('和方宜说说',{exact:true}).fill('只属于方宜的问题');await page.getByRole('button',{name:'发送',exact:true}).click();
  await expect.poll(()=>requested).toBe(true);await expect(page.locator('.fangyi-contact')).toHaveAttribute('data-busy','true');
  await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
  await expect(page.getByRole('heading',{name:'祀',exact:true})).toBeVisible();
  await expect(page.locator('.fangyi-contact')).toHaveAttribute('data-busy','false');
  await expect(page.locator('.chat-log')).not.toContainText('只属于方宜的问题');
  await expect(page.getByRole('button',{name:'发送',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
  await expect(page.locator('.chat-message.user')).toContainText('只属于方宜的问题');
  await expect(page.locator('.chat-message.assistant')).toHaveCount(0);
});

test('each companion retains its own chat and legacy Fangyi messages never appear as Si',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'助手',exact:true}).click();
  await page.getByLabel('和方宜说说',{exact:true}).fill('你好，方宜');await page.getByRole('button',{name:'发送',exact:true}).click();
  await expect(page.locator('.chat-message.user')).toHaveCount(1);await expect(page.locator('.chat-message.assistant')).toHaveCount(1);
  await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
  await expect(page.getByRole('heading',{name:'祀',exact:true})).toBeVisible();
  await expect(page.locator('.chat-message.user')).toHaveCount(0);
  await page.getByLabel('和祀说说',{exact:true}).fill('你好，小葱');await page.getByRole('button',{name:'发送',exact:true}).click();
  await expect(page.locator('.chat-message.user')).toHaveCount(1);await expect(page.locator('.chat-message.assistant')).toHaveCount(1);
  await expect(page.locator('.chat-log')).not.toContainText('你好，方宜');
  await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
  await expect(page.locator('.chat-log')).toContainText('你好，方宜');await expect(page.locator('.chat-log')).not.toContainText('你好，小葱');
  await page.reload();await page.getByRole('button',{name:'助手',exact:true}).click();
  await expect(page.locator('.chat-log')).toContainText('你好，方宜');
});

test('Si keeps tools shared and its own interactions fit a small keyboard viewport',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
  expect(await page.locator('.si-painted-world').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  await page.getByRole('button',{name:'助手',exact:true}).click();
  await page.getByLabel('和祀说说',{exact:true}).fill('帮我记一下午饭花了28元');await page.getByRole('button',{name:'发送',exact:true}).click();
  await expect(page.getByRole('log',{name:'聊天记录'})).toContainText('已记账');
  await page.setViewportSize({width:320,height:400});await page.locator('.terminal-shell').evaluate(el=>el.classList.add('keyboard-open'));
  await page.getByRole('button',{name:'祀表情',exact:true}).click();await page.getByRole('button',{name:'叫墨魉来',exact:true}).click();
  await expect(page.getByAltText('墨魉探头',{exact:true})).toBeVisible();
  const input=await page.getByLabel('和祀说说',{exact:true}).boundingBox();expect(input!.y+input!.height).toBeLessThanOrEqual(400);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.setViewportSize({width:390,height:844});await page.locator('.terminal-shell').evaluate(el=>el.classList.remove('keyboard-open'));
  await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await expect(page.locator('.chat-message.user')).toHaveCount(0);
  await page.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'打开记账',exact:true}).click();
  await expect(page.locator('main')).toContainText('28.00');
});
