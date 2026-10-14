import {test,expect,type Page} from '@playwright/test';
const ai={baseUrl:'https://192.168.10.2:11435/v1',model:'qwen3.5-fast:latest',apiKey:'dt-local-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',provider:'custom',protocol:'openai'};
const profile={format:'daily-terminal-local-ai',version:1,ai};
async function settings(page:Page){await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'更多',exact:true}).click();await page.getByRole('dialog',{name:'更多功能'}).getByRole('button',{name:'设置',exact:true}).click();}
async function upload(page:Page,value:unknown){await page.getByLabel('导入电脑连接',{exact:true}).setInputFiles({name:'电脑连接.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});}
test('connection import fills draft fields and persists only after Save',async({page})=>{
  await page.goto('/');await settings(page);await page.getByLabel('每月预算').fill('888');
  await upload(page,profile);await expect(page.getByText('导入完成，请保存设置',{exact:true})).toBeVisible();
  await expect(page.getByLabel('服务地址',{exact:true})).toHaveValue(ai.baseUrl);await expect(page.getByLabel('模型名称')).toHaveValue(ai.model);await expect(page.getByLabel('API Key')).toHaveValue(ai.apiKey);await expect(page.getByRole('combobox',{name:'协议',exact:true})).toHaveValue('openai');await expect(page.getByLabel('每月预算')).toHaveValue('888');await expect(page.getByLabel('API Key')).toHaveAttribute('type','password');
  await page.reload();await settings(page);await expect(page.getByLabel('服务地址',{exact:true})).toHaveValue('');await expect(page.getByLabel('API Key')).toHaveValue('');
  await upload(page,profile);await page.getByRole('button',{name:'保存设置',exact:true}).click();await expect(page.getByText('设置已保存',{exact:true})).toBeVisible();await page.reload();await settings(page);await expect(page.getByLabel('服务地址',{exact:true})).toHaveValue(ai.baseUrl);await expect(page.getByLabel('API Key')).toHaveValue(ai.apiKey);
});
test('invalid and oversized connections preserve the entire current draft',async({page})=>{
  await page.goto('/');await settings(page);await page.getByRole('combobox',{name:'协议',exact:true}).selectOption('anthropic');await page.getByLabel('服务地址',{exact:true}).fill('https://provider.invalid/v1');await page.getByLabel('模型名称').fill('draft-model');await page.getByLabel('API Key').fill('draft-key');
  for(const value of [{...profile,ai:{...ai,baseUrl:'https://evil.invalid/v1'}}, {format:'daily-terminal-backup',version:1}]){await upload(page,value);await expect(page.getByRole('alert')).toBeVisible();await expect(page.getByLabel('服务地址',{exact:true})).toHaveValue('https://provider.invalid/v1');await expect(page.getByLabel('模型名称')).toHaveValue('draft-model');await expect(page.getByLabel('API Key')).toHaveValue('draft-key');await expect(page.getByRole('combobox',{name:'协议',exact:true})).toHaveValue('anthropic');}
  await page.getByLabel('导入电脑连接',{exact:true}).setInputFiles({name:'large.json',mimeType:'application/json',buffer:Buffer.alloc(32769,32)});await expect(page.getByRole('alert')).toContainText('32KB');await expect(page.getByLabel('API Key')).toHaveValue('draft-key');
});
test('editing imported target prevents both connection testing and saving',async({page})=>{
  let requests=0;await page.route('https://evil.invalid/**',async route=>{requests++;await route.abort();});
  await page.goto('/');await settings(page);await upload(page,profile);await page.getByLabel('服务地址',{exact:true}).fill('https://evil.invalid/v1');await page.getByRole('button',{name:'测试连接',exact:true}).click();await expect(page.getByRole('alert')).toContainText('电脑连接');await page.getByRole('button',{name:'保存设置',exact:true}).click();await expect(page.getByRole('alert')).toContainText('电脑连接');expect(requests).toBe(0);
  await page.reload();await settings(page);await expect(page.getByLabel('API Key')).toHaveValue('');
});
