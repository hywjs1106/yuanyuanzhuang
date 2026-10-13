import test from 'node:test';
import assert from 'node:assert/strict';
import {createReminder} from '../src/terminal/reminders';
import {buildReminderNotifications,createReminderNotificationService} from '../src/terminal/reminderNotifications';
import type {LocalNotificationSchema} from '@capacitor/local-notifications';

test('scheduler carries native calendar metadata and preserves a future start', () => {
  const r=createReminder({title:'生日',startAt:'2028-02-29T09:00',recurrence:'yearly'});
  const [n]=buildReminderNotifications([r],new Date('2026-01-01'));
  assert.equal(n.schedule?.at?.getTime(),new Date('2028-02-29T09:00').getTime());
  assert.equal(n.schedule?.repeats,false);
  assert.equal(n.extra.recurrence,'yearly');
  assert.equal(n.extra.startAt,'2028-02-29T09:00');
});
test('snooze uses separate reserved ID without suppressing regular recurring alarms', () => {
  const r={...createReminder({title:'喝水',startAt:'2026-01-01T09:00',recurrence:'daily'}),snoozedUntil:'2026-01-02T10:10:00Z'};
  const notifications=buildReminderNotifications([r],new Date('2026-01-02T10:00:00Z'));
  assert.equal(notifications.length,2); assert.equal(notifications[1].id,r.notificationId+1);
  assert.equal(notifications[1].extra.recurrence,'once');
  assert.equal(notifications[1].schedule?.at?.toISOString(),'2026-01-02T10:10:00.000Z');
});
test('one-time snooze replaces its pending original notification', () => {
  const r={...createReminder({title:'稍后吃药',startAt:'2026-01-02T09:00',recurrence:'once'}),snoozedUntil:'2026-01-02T10:10:00Z'};
  const scheduled=buildReminderNotifications([r],new Date('2026-01-01T10:00:00Z'));
  assert.equal(scheduled.length,1);assert.equal(scheduled[0].schedule?.at?.toISOString(),'2026-01-02T10:10:00.000Z');
});
function device(permission='granted', initial:LocalNotificationSchema[]=[{id:200,title:'deleted',body:'',extra:{terminal:true}},{id:201,title:'other',body:'',extra:{another:true}}]) {
  let pending:LocalNotificationSchema[]=initial;
  const delivered=new Set(initial.map(n=>n.id));
  const canceled:number[]=[];
  const scheduled:LocalNotificationSchema[]=[];
  const api={checkPermissions:async()=>({display:permission}),requestPermissions:async()=>({display:permission}),getPending:async()=>({notifications:pending}),cancel:async({notifications}:{notifications:{id:number}[]})=>{canceled.push(...notifications.map(n=>n.id));notifications.forEach(n=>delivered.delete(n.id));pending=pending.filter(n=>!notifications.some(id=>id.id===n.id));},schedule:async({notifications}:{notifications:LocalNotificationSchema[]})=>{scheduled.push(...notifications);pending.push(...notifications);return {notifications:notifications.map(n=>({id:n.id}))};},registerActionTypes:async()=>{},createChannel:async()=>{},addListener:async()=>({remove:async()=>{}})};
  return {api,scheduled,canceled,delivered,pending:()=>pending};
}
test('reconcile cancels deleted alarms, leaves unrelated notifications and reports permission denial', async () => {
  const d=device();const svc=createReminderNotificationService(d.api as never,()=>true,()=>new Date('2026-01-01'));
  await svc.reconcile([createReminder({title:'明天',startAt:'2026-01-02T09:00',recurrence:'once'})]);
  assert.deepEqual(d.canceled,[200]); assert.ok(d.pending().some(n=>n.id===201)); assert.equal(d.scheduled.length,1);
  const denied=device('denied'); const noPermission=createReminderNotificationService(denied.api as never,()=>true);
  const status=await noPermission.reconcile([]); assert.equal(status.permission,'denied'); assert.equal(denied.scheduled.length,0);
  assert.deepEqual(denied.pending().map(n=>n.id),[201]);
});
test('foreground reconciliation retains an unchanged delivered recurring prompt and its native next alarm', async () => {
  const r=createReminder({title:'喝水',startAt:'2026-01-01T09:00',recurrence:'daily'});
  const initial=buildReminderNotifications([r],new Date('2026-01-01T08:00'));
  // Publisher advances the timestamp without changing the reminder's persisted metadata.
  initial[0].schedule!.at=new Date('2026-01-02T09:00');
  const d=device('granted',initial);
  const svc=createReminderNotificationService(d.api as never,()=>true,()=>new Date('2026-01-01T10:00'));
  await svc.reconcile([r]);
  assert.equal(d.delivered.has(r.notificationId),true);
  assert.deepEqual(d.canceled,[]);assert.equal(d.scheduled.length,0);
  assert.equal(d.pending()[0].schedule?.at?.getTime(),new Date('2026-01-02T09:00').getTime());
});
test('queued reconciliation cancels edited or deleted reminders and leaves unchanged neighbors', async () => {
  const a=createReminder({title:'A',startAt:'2026-01-01T09:00',recurrence:'daily'});
  const b=createReminder({title:'B',startAt:'2026-01-01T09:00',recurrence:'daily'},[a]);
  const d=device('granted',buildReminderNotifications([a,b],new Date('2026-01-01T08:00')));
  const svc=createReminderNotificationService(d.api as never,()=>true,()=>new Date('2026-01-01T10:00'));
  const edited={...a,title:'edited'};
  await Promise.all([svc.reconcile([edited,b]),svc.reconcile([edited])]);
  assert.deepEqual(d.canceled,[a.notificationId,b.notificationId]);
  assert.equal(d.scheduled.length,1);assert.equal(d.pending()[0].title,'edited');
});
test('web reports native limitation without invoking a notification plugin', async () => {
  const svc=createReminderNotificationService({} as never,()=>false);
  assert.equal((await svc.getStatus()).native,false);
  assert.equal((await svc.reconcile([])).permission,'unavailable');
});
