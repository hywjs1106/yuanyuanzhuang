import {test,expect} from '@playwright/test';
async function openChat(page:import('@playwright/test').Page){await page.goto('/');await page.getByRole('button',{name:'助手',exact:true}).click();}

test('empty conversation opens with the full greeting visible on a narrow phone',async({page})=>{
 for(const [width,height] of [[320,740],[360,640],[375,667],[320,568]]){
  await page.setViewportSize({width,height});await openChat(page);
  const log=await page.getByRole('log',{name:'聊天记录'}).boundingBox();
  const greeting=await page.locator('.chat-bubble').first().boundingBox();
  const message=await page.locator('.chat-message').first().boundingBox();
  expect(message!.y,`${width}x${height} sender`).toBeGreaterThanOrEqual(log!.y);
  expect(greeting!.y).toBeGreaterThanOrEqual(log!.y);
  expect(greeting!.y+greeting!.height,`${width}x${height} greeting`).toBeLessThanOrEqual(log!.y+log!.height);
 }
});

test('conversation starters fill a draft without sending or overwriting existing text',async({page})=>{
 await openChat(page);
 const input=page.getByRole('textbox',{name:'和方宜说说'});
 await page.getByRole('button',{name:'随便聊聊',exact:true}).click();
 await expect(input).toHaveValue('今天想和你随便聊聊。');
 await expect(page.locator('.chat-message.user')).toHaveCount(0);
 await input.fill('我自己写的话');
 await expect(page.getByRole('button',{name:'分享好消息',exact:true})).toBeDisabled();
 await expect(input).toHaveValue('我自己写的话');
 await input.fill('');await page.getByRole('button',{name:'理一理思路',exact:true}).click();
 await expect(input).toHaveValue('我有个想法，想听听你的看法。');
 await page.getByRole('button',{name:'发送',exact:true}).click();
 await expect(page.getByRole('group',{name:'找个话题'})).toHaveCount(0);
});

test('portrait reactions are local, bounded and never create a chat message',async({page})=>{
 await openChat(page);
 await page.getByRole('button',{name:'和方宜打个招呼',exact:true}).click();
 const art=page.locator('.fangyi-presence-art');
 await expect(art).toHaveAttribute('src','/characters/stickers/fy-01-06.webp');
 await expect(page.locator('.chat-message.user')).toHaveCount(0);
 await expect(art).toHaveAttribute('src','/characters/fangyi-bouquet-avatar.png',{timeout:6500});
 await page.getByRole('button',{name:'和方宜打个招呼',exact:true}).click();
 await expect(art).toHaveAttribute('src','/characters/stickers/fy-01-08.webp');
 await page.getByRole('button',{name:'停止人物表情',exact:true}).click();
 await expect(art).toHaveAttribute('src','/characters/fangyi-bouquet-avatar.png');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.getByRole('button',{name:'和方宜打个招呼',exact:true}).click();
 await expect(art).toHaveAttribute('src','/characters/stickers/fy-01-17.jpg');
 await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(art).toHaveAttribute('src','/characters/fangyi-bouquet-avatar.png');
 await page.getByRole('button',{name:'今日',exact:true}).click();
 await page.getByRole('button',{name:'助手',exact:true}).click();
 await expect(art).toHaveAttribute('src','/characters/fangyi-bouquet-avatar.png');
 await page.getByRole('textbox',{name:'和方宜说说'}).fill('你好');await page.getByRole('button',{name:'发送',exact:true}).click();
 const arrival=page.locator('.chat-message[data-arrival=true] .chat-bubble');
 await expect(arrival).toBeVisible();
 expect(await arrival.evaluate(el=>getComputedStyle(el,'::after').animationName)).toBe('none');
});

test('portrait state follows a real pending API request and clears on stop',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('https://example.invalid/**',()=>{});
 await page.goto('/');await page.getByRole('button',{name:'设置',exact:true}).click();
 await page.getByLabel('服务地址').fill('https://example.invalid/v1');await page.getByLabel('模型名称').fill('test-model');await page.getByLabel('API Key',{exact:true}).fill('test-only-key');await page.getByRole('button',{name:'保存设置'}).click();
 await page.getByRole('button',{name:'助手',exact:true}).click();
 await page.getByRole('textbox',{name:'和方宜说说'}).fill('今天想聊一会');await page.getByRole('button',{name:'发送',exact:true}).click();
 await expect(page.locator('.fangyi-contact')).toHaveAttribute('data-busy','true');
 expect(await page.locator('.fangyi-presence-frame').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 await expect(page.getByRole('button',{name:'和方宜打个招呼',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'停止',exact:true}).click();
 await expect(page.locator('.fangyi-contact')).toHaveAttribute('data-busy','false');
 await expect(page.getByRole('button',{name:'和方宜打个招呼',exact:true})).toBeEnabled();
 await expect(page.locator('.chat-message.assistant')).toHaveCount(0);
});
