import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chromium'}),errors=[],checks=[];
const p=await browser.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:5180/inn-preview.html');await p.getByRole('button',{name:'助手',exact:true}).click();
const input=p.getByLabel('消息',{exact:true}),person=p.getByRole('button',{name:'和祀打个招呼'});
const send=async(text)=>{await input.fill(text);await input.press('Enter');await p.getByLabel('祀正在准备演示回复',{exact:true}).waitFor({state:'hidden'})};
for(const [text,action] of [['你好呀','happy'],['今天有点累','comfort'],['你真可爱','shy'],['你觉得该怎么办？','thinking'],['明天提醒我出门','serious'],['给我倒杯茶','tea']]){
 await send(text);await p.locator(`.si-person[data-action="${action}"]`).waitFor();
 const pose=p.locator('.si-action-pose');await p.waitForTimeout(180);assert.equal(await pose.evaluate(e=>getComputedStyle(e).opacity),'1');
 await p.screenshot({path:`references/inn-preview/rooms/si-action-${action}.png`});checks.push(`${text} → ${action}`);
}
await p.locator('.si-person[data-action="idle"]').waitFor();checks.push('gesture ends and returns to idle');
await send('我不开心，不要逗我');assert.equal(await person.getAttribute('data-action'),'comfort');
await send('我不难过，也不累，今天很开心');assert.equal(await person.getAttribute('data-action'),'happy');checks.push('negated distress and negative happiness are handled separately');
await input.fill('再说一句');await input.press('Enter');await p.getByRole('button',{name:'停止演示回复'}).click();await p.waitForTimeout(750);assert.equal(await person.getAttribute('data-action'),'idle');checks.push('cancel clears prior action and cannot trigger late gesture');
await p.emulateMedia({reducedMotion:'reduce'});await send('给我倒杯茶');assert.equal(await p.locator('.si-action-pose').evaluate(e=>getComputedStyle(e).animationName),'none');checks.push('reduced motion uses still pose');
await p.getByRole('button',{name:'设置',exact:true}).click();await p.getByRole('button',{name:'助手',exact:true}).click();assert.equal(await person.getAttribute('data-action'),'idle');checks.push('navigation does not replay old gesture');
assert.deepEqual(errors,[]);await writeFile('references/inn-preview/si-actions-verification.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors}));await browser.close();
