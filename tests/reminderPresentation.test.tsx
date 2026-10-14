import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ReminderPanel} from '../src/terminal/ReminderPanel';
import {createReminder, completeReminder} from '../src/terminal/reminders';
import type {Reminder} from '../src/terminal/reminders';

const reminder=(title:string,startAt:string)=>createReminder({title,startAt,recurrence:'once'},[],new Date('2098-01-01'));
const render=(reminders:Reminder[])=>renderToStaticMarkup(createElement(ReminderPanel,{reminders,onSave:async()=>{throw new Error('Rendering must not save');},onDelete:async()=>{throw new Error('Rendering must not delete');}}));

test('mission list initially selects the earliest reminder and exposes one detail heading',()=>{
  const html=render([reminder('较晚提醒','2099-06-02T09:00'),reminder('最早提醒','2099-06-01T09:00')]);
  assert.match(html,/aria-label="查看提醒：最早提醒" aria-pressed="true"/);
  assert.match(html,/aria-label="查看提醒：较晚提醒" aria-pressed="false"/);
  assert.match(html,/<h3[^>]*>最早提醒<\/h3>/);
  assert.doesNotMatch(html,/<h3[^>]*>较晚提醒<\/h3>/);
  assert.equal((html.match(/>10 分钟后<\/button>/g)??[]).length,1);
});

test('mission detail distinguishes completed once reminders from paused reminders',()=>{
  const value=reminder('一次事项','2099-06-01T09:00');
  assert.match(render([completeReminder(value,new Date('2098-01-01'))]),/class="mission-status">已完成/);
  assert.match(render([{...value,enabled:false}]),/class="mission-status">已暂停/);
});

test('calendar help is collapsed and empty reminder list offers an honest empty state',()=>{
  const html=render([]);
  assert.match(html,/<details class="mission-help"><summary>时间与重复规则<\/summary>/);
  assert.match(html,/给重要的事留个提醒/);
  assert.doesNotMatch(html,/mission-detail|查看提醒：/);
});
