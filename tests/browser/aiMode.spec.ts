import {test,expect,type Page} from '@playwright/test';
import {go} from './navigation';
const local={baseUrl:'https://computer.invalid/v1',model:'pc-model',apiKey:'dt-remote-'+'L'.repeat(40),provider:'custom',protocol:'openai'};
const api={baseUrl:'https://provider.invalid/v1',model:'api-model',apiKey:'API_TEST_SECRET',provider:'custom',protocol:'openai'};
async function seed(page:Page,both=true){await page.goto('/');await page.evaluate(async({local,api,both})=>{const {terminalDb}=await import('/src/terminal/data.ts');await terminalDb.settings.put({id:'main',budget:0,visualTheme:'si',theme:'dark',ai:local,aiMode:'local',aiProfiles:both?{local,api}:{local}});},{local,api,both});}
async function form(page:Page){await go(page,'设置');const group=page.locator('details[data-settings-group=ai]');if(!await group.evaluate(el=>(el as HTMLDetailsElement).open))await group.locator('summary').click();}
test('switching keeps draft/history and routes actual requests only to selected profile',async({page})=>{
 const targets:string[]=[];let pending:(()=>Promise<void>)|undefined;
 await page.route('https://**.invalid/**',async route=>{const url=route.request().url();if(!url.includes('/chat/completions'))return route.abort();targets.push(url);await new Promise<void>(resolve=>{pending=async()=>{await route.fulfill({json:{choices:[{message:{content:'{"reply":"听到了。","actions":[]}'}}]}});resolve();};});});
 await seed(page);await go(page,'助手');const modes=page.getByRole('group',{name:'对话模型'});
 const input=page.locator('.assistant-composer textarea');await input.fill('这句话先不发');await modes.getByRole('button',{name:'API',exact:true}).click();await expect(modes.getByRole('button',{name:'API',exact:true})).toHaveAttribute('aria-pressed','true');await expect(input).toHaveValue('这句话先不发');
 await input.fill('你好');await page.getByRole('button',{name:'发送',exact:true}).click();await expect(modes.getByRole('button',{name:'本地模型',exact:true})).toBeDisabled();await expect.poll(()=>targets.length).toBe(1);expect(targets[0]).toContain('provider.invalid');await pending!();
 await expect(modes.getByRole('button',{name:'本地模型',exact:true})).toBeEnabled();await modes.getByRole('button',{name:'本地模型',exact:true}).click();await input.fill('再聊一句');await page.getByRole('button',{name:'发送',exact:true}).click();await expect.poll(()=>targets.length).toBe(2);expect(targets[1]).toContain('computer.invalid');await pending!();await expect(modes.getByRole('button',{name:'API',exact:true})).toBeEnabled();
 await page.reload();await go(page,'助手');await expect(page.getByRole('group',{name:'对话模型'}).getByRole('button',{name:'本地模型',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.getByRole('log')).toContainText('你好');
});
test('settings retains separate unsaved drafts and save activates only that profile',async({page})=>{
 await seed(page);await form(page);const mode=page.getByRole('group',{name:'编辑模型连接'});
 await page.getByLabel('模型名称',{exact:true}).fill('pc-draft');await mode.getByRole('button',{name:'API',exact:true}).click();await expect(page.getByLabel('模型名称',{exact:true})).toHaveValue('api-model');await page.getByLabel('模型名称',{exact:true}).fill('api-draft');await mode.getByRole('button',{name:'本地模型',exact:true}).click();await expect(page.getByLabel('模型名称',{exact:true})).toHaveValue('pc-draft');await mode.getByRole('button',{name:'API',exact:true}).click();await page.getByRole('button',{name:'保存设置',exact:true}).click();await expect(page.getByText('设置已保存',{exact:true})).toBeVisible();
 await page.reload();await form(page);await expect(page.getByLabel('模型名称',{exact:true})).toHaveValue('api-draft');await page.getByRole('group',{name:'编辑模型连接'}).getByRole('button',{name:'本地模型',exact:true}).click();await expect(page.getByLabel('模型名称',{exact:true})).toHaveValue('pc-model');
 await go(page,'助手');await page.screenshot({path:'references/ai-mode-dark-mobile.png',fullPage:true});
});
test('unconfigured target does not replace active source or clear the input',async({page})=>{
 await seed(page,false);await go(page,'助手');const input=page.locator('.assistant-composer textarea');await input.fill('留下这个草稿');await page.getByRole('group',{name:'对话模型'}).getByRole('button',{name:'API',exact:true}).click();await expect(page.getByRole('alert')).toContainText('尚未配置');await expect(page.getByRole('group',{name:'对话模型'}).getByRole('button',{name:'本地模型',exact:true})).toHaveAttribute('aria-pressed','true');await expect(input).toHaveValue('留下这个草稿');
});
test('light narrow layout keeps both model controls inside the screen',async({page})=>{
 await page.setViewportSize({width:320,height:740});await seed(page);await page.evaluate(async()=>{const {terminalDb}=await import('/src/terminal/data.ts');await terminalDb.settings.update('main',{theme:'light',visualTheme:'fangyi'});});await go(page,'助手');
 const group=page.getByRole('group',{name:'对话模型'});await expect(group).toBeVisible();const bounds=await group.boundingBox();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(320);await page.screenshot({path:'references/ai-mode-light-narrow.png',fullPage:true});
});
