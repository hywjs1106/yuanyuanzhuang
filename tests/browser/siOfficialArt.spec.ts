import {test,expect} from '@playwright/test';
async function openSi(page:any){await page.goto('/');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();await page.getByRole('button',{name:'助手',exact:true}).click();}
test('official avatar and eight local stickers stay available without remote media',async({page})=>{
 await page.route('https://video.twimg.com/**',r=>r.abort());await openSi(page);
 await expect(page.locator('.si-presence img')).toHaveAttribute('src','/themes/si/official/01.png');
 await page.getByRole('button',{name:'祀表情',exact:true}).click();const picker=page.getByRole('region',{name:'祀表情库'});await expect(picker.locator('.sticker-picker__item')).toHaveCount(8);
 await picker.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(img=>(img as HTMLImageElement).decode())));
 await page.getByRole('button',{name:'预览祀表情：得意',exact:true}).click();await expect(page.getByRole('group',{name:'表情预览'}).locator('img')).toHaveAttribute('src','/themes/si/official/02.png');
});
test('avatar gesture plays local drawing once, changes no messages and respects reduced motion',async({page})=>{
 await openSi(page);await expect(page.locator('.chat-message.assistant')).toHaveCount(1);const before=await page.locator('.chat-message').count();await page.getByRole('button',{name:'和祀打个招呼',exact:true}).click();const video=page.locator('.si-selfportrait video');await expect(video).toBeVisible();
 await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.readyState)).toBeGreaterThanOrEqual(2);
 expect(await video.evaluate((v:HTMLVideoElement)=>v.loop)).toBe(false);await expect.poll(()=>video.count()).toBe(0);
 await expect(page.locator('.chat-message')).toHaveCount(before);await page.getByRole('button',{name:'收起祀的随笔画',exact:true}).click();
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:320,height:568});await page.getByRole('button',{name:'和祀打个招呼',exact:true}).click();await expect(page.locator('.si-selfportrait img')).toBeVisible();await expect(video).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});

test('a failed animation keeps the official still image and Escape closes the paper',async({page})=>{
 await page.route('**/themes/si/official/selfportrait.mp4',r=>r.abort());await openSi(page);const avatar=page.getByRole('button',{name:'和祀打个招呼',exact:true});await avatar.click();
 await expect(page.locator('.si-selfportrait img')).toBeVisible();await expect(page.locator('.si-selfportrait video')).toHaveCount(0);await page.keyboard.press('Escape');await expect(page.locator('.si-selfportrait')).toHaveCount(0);await expect(avatar).toBeFocused();
});
