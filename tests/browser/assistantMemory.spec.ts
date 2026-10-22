import {test,expect} from '@playwright/test';

test('memory can be added, edited, disabled and deleted without losing API drafts',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
  await page.getByRole('navigation').getByRole('button',{name:'设置',exact:true}).click();
  await page.getByLabel('模型名称',{exact:true}).fill('unsaved-draft');
  await page.getByLabel('想让助手记住的事').fill('我喜欢热茶，不喝咖啡');
  await page.getByRole('button',{name:'记住这件事',exact:true}).click();
  const region=page.getByRole('region',{name:'角色记忆'});
  await expect(region).toContainText('我喜欢热茶，不喝咖啡');
  await expect(page.getByLabel('模型名称',{exact:true})).toHaveValue('unsaved-draft');
  await region.getByRole('button',{name:'修改',exact:true}).click();
  await page.getByLabel('想让助手记住的事').fill('我喜欢茉莉花茶');
  await page.getByRole('button',{name:'保存记忆',exact:true}).click();
  await region.getByLabel('在 AI 对话中使用这些记忆').uncheck();
  await expect(region).toHaveAttribute('aria-busy','false');await page.reload();await page.getByRole('navigation').getByRole('button',{name:'设置',exact:true}).click();
  await expect(region).toContainText('我喜欢茉莉花茶');
  await expect(region.getByLabel('在 AI 对话中使用这些记忆')).not.toBeChecked();
  await region.getByRole('button',{name:'删除',exact:true}).click();
  await expect(region).toContainText('还没有记下的偏好');
});

test('only enabled memory reaches the configured API as data; local records are unchanged',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.getByRole('navigation').getByRole('button',{name:'设置',exact:true}).click();
  await page.getByLabel('想让助手记住的事').fill('我喜欢茉莉花茶');
  await page.getByRole('button',{name:'记住这件事',exact:true}).click();
  await page.getByLabel('服务地址').fill('https://example.invalid/v1');await page.getByLabel('模型名称',{exact:true}).fill('test-model');await page.getByLabel('API Key',{exact:true}).fill('test-key');await page.getByRole('button',{name:'保存设置',exact:true}).click();
  const bodies:string[]=[];
  await page.route('https://example.invalid/**',async route=>{bodies.push(route.request().postData()??'');await route.fulfill({json:{choices:[{message:{content:JSON.stringify({reply:'喝点茶，慢慢说。',actions:[]})}}]}});});
  await page.getByRole('navigation').getByRole('button',{name:'助手',exact:true}).click();
  await page.getByLabel('和方宜说说',{exact:true}).fill('下午喝点什么');await page.getByRole('button',{name:'发送',exact:true}).click();
  await expect(page.getByRole('log')).toContainText('喝点茶');expect(bodies[0]).toContain('我喜欢茉莉花茶');
  await page.getByRole('navigation').getByRole('button',{name:'设置',exact:true}).click();await page.getByLabel('在 AI 对话中使用这些记忆').uncheck();
  await page.getByRole('navigation').getByRole('button',{name:'助手',exact:true}).click();
  await page.getByLabel('和方宜说说',{exact:true}).fill('你好');await page.getByRole('button',{name:'发送',exact:true}).click();
  await expect.poll(()=>bodies.length).toBe(2);expect(bodies[1]).not.toContain('我喜欢茉莉花茶');
  const counts=await page.evaluate(()=>new Promise<number[]>(resolve=>{const req=indexedDB.open('DailyTerminal');req.onsuccess=()=>{const db=req.result;const tx=db.transaction(['entries','reminders'],'readonly');const values:number[]=[];for(const name of ['entries','reminders']){const count=tx.objectStore(name).count();count.onsuccess=()=>values.push(count.result);}tx.oncomplete=()=>{db.close();resolve(values);};};}));
  expect(counts).toEqual([0,0]);
});

test('failed memory writes keep the draft and roll back the enabled switch',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('navigation').getByRole('button',{name:'设置',exact:true}).click();
  await page.evaluate(()=>{const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args:Parameters<IDBObjectStore['put']>){if(this.name==='settings')throw new Error('模拟保存失败');return put.apply(this,args);};});
  await page.getByLabel('想让助手记住的事').fill('这条不能假装保存成功');await page.getByRole('button',{name:'记住这件事',exact:true}).click();
  const region=page.getByRole('region',{name:'角色记忆'});await expect(region.getByRole('alert')).toContainText('模拟保存失败');await expect(page.getByLabel('想让助手记住的事')).toHaveValue('这条不能假装保存成功');await expect(region).toContainText('还没有记下的偏好');
  await region.getByLabel('在 AI 对话中使用这些记忆').click();await expect(region.getByRole('alert')).toContainText('模拟保存失败');await expect(region.getByLabel('在 AI 对话中使用这些记忆')).toBeChecked();
});
