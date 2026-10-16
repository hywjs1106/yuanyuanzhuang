import {test,expect,type Page} from '@playwright/test';
const nav=async(page:Page,name:string)=>page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name,exact:true}).click();
async function siChat(page:Page){await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await nav(page,'助手');await expect(page.getByRole('heading',{name:'祀',exact:true})).toBeVisible();}

test('Si gallery previews six decoded static moods and kaomoji append to the draft without sending',async({page})=>{
 await siChat(page);await page.getByRole('button',{name:'祀表情',exact:true}).click();
 const picker=page.getByRole('region',{name:'祀表情库'});await expect(picker.getByRole('button',{name:/预览祀表情/})).toHaveCount(6);
 await picker.locator('img').evaluateAll(async images=>{for(const img of images){await (img as HTMLImageElement).decode();if(!(img as HTMLImageElement).naturalWidth)throw Error('Missing sticker');}});
 await page.getByRole('button',{name:'预览祀表情：得意眨眼',exact:true}).click();
 const preview=page.getByRole('group',{name:'表情预览',exact:true});await expect(preview.getByAltText('祀表情：得意眨眼')).toBeVisible();await expect(preview.getByRole('button',{name:/播放|停止/})).toHaveCount(0);await expect(page.locator('.chat-message.user')).toHaveCount(0);
 await page.getByRole('button',{name:'收起表情预览',exact:true}).click();
 await page.getByLabel('和祀说说',{exact:true}).fill('我想到一个主意');await page.getByRole('button',{name:'祀表情',exact:true}).click();await page.getByRole('button',{name:'插入颜文字 (・ω・)？',exact:true}).click();
 await expect(page.getByLabel('和祀说说',{exact:true})).toHaveValue('我想到一个主意 (・ω・)？');await expect(page.locator('.chat-message.user')).toHaveCount(0);
 await page.setViewportSize({width:320,height:400});await page.locator('.terminal-shell').evaluate(el=>el.classList.add('keyboard-open'));
 await page.getByRole('button',{name:'祀表情',exact:true}).click();await expect(page.getByRole('button',{name:'祀表情',exact:true})).toHaveAttribute('aria-expanded','true');await page.locator('.terminal-shell').evaluate(el=>el.classList.add('keyboard-open'));const composer=await page.getByLabel('和祀说说',{exact:true}).boundingBox();expect(composer!.y+composer!.height).toBeLessThanOrEqual(400);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});

test('Si provider sticker and kaomoji persist, repeat is suppressed and foreign art is ignored',async({page})=>{
 let stickerId='si-proud',requestPrompt='';
 await page.route('https://example.invalid/**',async route=>{const body=route.request().postDataJSON();requestPrompt=body.messages[0].content;await route.fulfill({json:{choices:[{message:{content:JSON.stringify({reply:'这眼光不错。(￣▽￣)',actions:[],stickerId})}}]}});});
 await siChat(page);await nav(page,'设置');await page.getByLabel('服务地址').fill('https://example.invalid/v1');await page.getByLabel('模型名称').fill('test');await page.getByLabel('API Key',{exact:true}).fill('test-key');await page.getByRole('button',{name:'保存设置',exact:true}).click();await nav(page,'助手');
 const send=async(text:string)=>{await page.getByLabel('和祀说说',{exact:true}).fill(text);await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.getByRole('button',{name:'发送',exact:true})).toBeVisible();};
 await send('你画得真好');await expect(page.locator('.chat-message.assistant')).toContainText('(￣▽￣)');await expect(page.locator('.chat-message.assistant .sticker-message')).toHaveCount(1);expect(requestPrompt).toContain('si-proud');expect(requestPrompt).toContain('颜文字');expect(requestPrompt).not.toContain('fy-01-');
 await send('真的很好');await expect(page.locator('.chat-message.assistant .sticker-message')).toHaveCount(1);
 stickerId='fy-01-08';await send('再聊聊');await expect(page.locator('.chat-message.assistant')).toHaveCount(3);await expect(page.locator('.chat-message.assistant .sticker-message')).toHaveCount(1);
 await page.reload();await nav(page,'助手');await expect(page.getByAltText('祀表情：得意眨眼')).toHaveCount(1);
 await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await expect(page.locator('.chat-message.user')).toHaveCount(0);await expect(page.getByAltText('祀表情：得意眨眼')).toHaveCount(0);
});
