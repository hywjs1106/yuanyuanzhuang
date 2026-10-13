import test from 'node:test';
import assert from 'node:assert/strict';
import { createReminder, validateReminder, nextReminderOccurrence, completeReminder, snoozeReminder, completeDeliveredReminder, snoozeDeliveredReminder } from '../src/terminal/reminders';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ReminderPanel} from '../src/terminal/ReminderPanel';

const make = (recurrence: 'once'|'daily'|'weekly'|'monthly'|'yearly', startAt='2026-01-31T09:00') => createReminder({title:'吃药', startAt, recurrence}, [], new Date('2026-01-01T00:00'));
test('rejects malformed dates and allocates distinct native ID pairs', () => {
  assert.throws(() => make('once', '2026-02-30T09:00'));
  assert.throws(() => make('once', 'not-date'));
  const a = make('once'); const b = createReminder({title:'生日', startAt:'2026-02-02T09:00', recurrence:'yearly'}, [a]);
  assert.notEqual(a.id,b.id); assert.notEqual(a.notificationId,b.notificationId);
  assert.equal(a.notificationId % 2, 0); assert.ok(a.notificationId > 0 && a.notificationId < 2147483647);
  assert.throws(() => validateReminder({...a, title:' '}));
  assert.throws(() => validateReminder({...a, notificationId:2147483647}));
});
test('once reminders expire; daily and weekly retain future start boundaries', () => {
  assert.equal(nextReminderOccurrence(make('once'), new Date('2026-02-01')), null);
  assert.equal(nextReminderOccurrence(make('daily', '2027-06-01T09:00'), new Date('2026-02-01'))?.getTime(), new Date('2027-06-01T09:00').getTime());
  assert.equal(nextReminderOccurrence(make('weekly', '2026-01-05T09:00'), new Date('2026-01-12T10:00'))?.getTime(), new Date('2026-01-19T09:00').getTime());
});
test('month 31 and Feb29 skip nonexistent Gregorian dates', () => {
  assert.equal(nextReminderOccurrence(make('monthly'), new Date('2026-02-01'))?.getTime(),new Date('2026-03-31T09:00').getTime());
  assert.equal(nextReminderOccurrence(make('yearly','2024-02-29T09:00'),new Date('2025-01-01'))?.getTime(),new Date('2028-02-29T09:00').getTime());
});
test('complete skips one recurring occurrence and snooze does not erase recurrence', () => {
  const daily=make('daily','2026-01-01T09:00');
  const done=completeReminder(daily,new Date('2026-01-01T08:00'));
  assert.equal(done.enabled,true);
  assert.equal(nextReminderOccurrence(done,new Date('2026-01-01T08:01'))?.getTime(), new Date('2026-01-02T09:00').getTime());
  const late=completeReminder(daily,new Date('2026-01-02T10:00'));
  assert.equal(nextReminderOccurrence(late,new Date('2026-01-02T10:01'))?.getTime(),new Date('2026-01-03T09:00').getTime());
  assert.equal(completeReminder(make('once'),new Date()).enabled,false);
  assert.equal(snoozeReminder(daily,10,new Date('2026-01-02T10:00')).snoozedUntil, new Date('2026-01-02T10:10').toISOString());
});
test('completing an upcoming weekly occurrence skips it even when it is not today', () => {
  const weekly=make('weekly','2026-01-05T09:00');
  const done=completeReminder(weekly,new Date('2026-01-14T10:00'));
  assert.equal(nextReminderOccurrence(done,new Date('2026-01-14T10:01'))?.getTime(),new Date('2026-01-26T09:00').getTime());
});
test('one-time snooze exposes its postponed time and cannot resurrect the original time', () => {
  const r=snoozeReminder(make('once','2026-01-31T09:00'),10,new Date('2026-01-01T10:00'));
  assert.equal(nextReminderOccurrence(r,new Date('2026-01-01T10:01'))?.getTime(),new Date('2026-01-01T10:10').getTime());
  assert.equal(nextReminderOccurrence(r,new Date('2026-01-01T10:11')),null);
});
test('snoozing before delivery postpones that occurrence while keeping later repeats', () => {
  const daily=make('daily','2026-01-01T09:00');
  const r=snoozeReminder(daily,10,new Date('2026-01-02T08:59'));
  assert.equal(nextReminderOccurrence(r,new Date('2026-01-02T08:59'))?.getTime(),new Date('2026-01-03T09:00').getTime());
  assert.equal(r.snoozedUntil,new Date('2026-01-02T09:09').toISOString());
});
test('late completion of a delivered weekly notification does not skip next week', () => {
  const r=make('weekly','2026-01-05T09:00');
  const done=completeDeliveredReminder(r,new Date('2026-01-06T10:00'));
  assert.equal(nextReminderOccurrence(done,new Date('2026-01-06T10:01'))?.getTime(),new Date('2026-01-12T09:00').getTime());
});
test('late snooze of a delivered weekly notification preserves next week and creates a short snooze', () => {
  const r=make('weekly','2026-01-05T09:00');
  const snoozed=snoozeDeliveredReminder(r,10,new Date('2026-01-06T10:00'));
  assert.equal(nextReminderOccurrence(snoozed,new Date('2026-01-06T10:01'))?.getTime(),new Date('2026-01-12T09:00').getTime());
  assert.equal(snoozed.snoozedUntil,new Date('2026-01-06T10:10').toISOString());
});
test('reminder panel exposes persisted reminder controls and repeat rules', () => {
  const html=renderToStaticMarkup(createElement(ReminderPanel,{reminders:[make('yearly','2028-02-29T09:00')],onSave:async()=>{},onDelete:async()=>{}}));
  assert.match(html,/吃药/);assert.match(html,/每年/);assert.match(html,/编辑/);assert.match(html,/10 分钟后/);assert.match(html,/新增提醒/);
});
