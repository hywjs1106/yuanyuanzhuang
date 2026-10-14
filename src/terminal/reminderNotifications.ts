import {Capacitor} from '@capacitor/core';
import {LocalNotifications} from '@capacitor/local-notifications';
import type {LocalNotificationsPlugin, LocalNotificationSchema} from '@capacitor/local-notifications';
import {nextReminderOccurrence, validateReminder} from './reminders';
import type {Reminder} from './reminders';

export interface ReminderNotificationStatus {native:boolean; permission:string; message:string}
export interface ReminderNotificationActions {onComplete?:(id:string)=>Promise<void>; onSnooze?:(id:string)=>Promise<void>; onError?:(error:unknown)=>void}

/** Android publisher consumes extra.recurrence/startAt and reschedules indefinitely.
 * Never use Capacitor5 at+repeats: Android interprets that as (at-now), not a calendar rule.
 */
export function buildReminderNotifications(reminders:Reminder[], now=new Date()):LocalNotificationSchema[] {
  const notifications:LocalNotificationSchema[]=[];
  const ids=new Set<number>();
  for (const raw of reminders) {
    const r=validateReminder(raw);
    if (ids.has(r.notificationId)) throw new Error('提醒通知编号重复');
    ids.add(r.notificationId);
    if (!r.enabled) continue;
    const signature=JSON.stringify([r.id,r.notificationId,r.title,r.body,r.startAt,r.recurrence,r.enabled,r.completedAt??null,r.skipUntil??null,r.snoozedUntil??null]);
    const at=nextReminderOccurrence(r,now);
    const shared={title:r.title,body:r.body || '帝江号提醒',actionTypeId:'terminal-reminder',channelId:'terminal-reminders',autoCancel:true};
    if (at && !(r.recurrence==='once' && r.snoozedUntil)) notifications.push({...shared,id:r.notificationId,schedule:{at,repeats:false,allowWhileIdle:true},extra:{terminal:true,reminderId:r.id,signature,recurrence:r.recurrence,startAt:r.startAt,skipUntil:r.skipUntil}});
    if (r.snoozedUntil && Date.parse(r.snoozedUntil)>now.getTime()) notifications.push({...shared,id:r.notificationId+1,schedule:{at:new Date(r.snoozedUntil),repeats:false,allowWhileIdle:true},extra:{terminal:true,reminderId:r.id,signature,recurrence:'once',snooze:true}});
  }
  return notifications;
}

type NotificationAPI=Pick<LocalNotificationsPlugin,'checkPermissions'|'requestPermissions'|'getPending'|'cancel'|'schedule'|'registerActionTypes'|'createChannel'|'addListener'>;
export function createReminderNotificationService(api:NotificationAPI=LocalNotifications,native:()=>boolean=()=>Capacitor.isNativePlatform(),now:()=>Date=()=>new Date()) {
  let queue=Promise.resolve();
  let initialized=false;
  let actions:ReminderNotificationActions={};
  const web:ReminderNotificationStatus={native:false,permission:'unavailable',message:'网页预览可管理提醒；定时通知需要 Android 应用。'};
  async function getStatus():Promise<ReminderNotificationStatus> {
    if (!native()) return web;
    const result=await api.checkPermissions();
    return {native:true,permission:result.display,message:result.display==='granted'?'系统通知已允许；实际送达时间受系统省电与精确闹钟设置影响。':'请允许系统通知，提醒已保存但不能发送通知。'};
  }
  async function init(callbacks:ReminderNotificationActions={}) {
    actions=callbacks;
    if (!native() || initialized) return;
    await api.createChannel({id:'terminal-reminders',name:'日常提醒',importance:4,visibility:1,vibration:true});
    await api.registerActionTypes({types:[{id:'terminal-reminder',actions:[{id:'complete',title:'完成',foreground:true},{id:'snooze',title:'10 分钟后',foreground:true}]}]});
    await api.addListener('localNotificationActionPerformed', event=>{
      const id=event.notification.extra?.reminderId;
      if (!event.notification.extra?.terminal || typeof id!=='string') return;
      const callback=event.actionId==='complete'?actions.onComplete:event.actionId==='snooze'?actions.onSnooze:undefined;
      if (callback) void callback(id).catch(error=>actions.onError?.(error));
    });
    initialized=true;
  }
  async function reconcileNow(reminders:Reminder[]) {
    if (!native()) return web;
    // Validate the complete snapshot before cancelling a previously working schedule.
    const notifications=buildReminderNotifications(reminders,now());
    const status=await getStatus();
    const pending=await api.getPending();
    const desired=new Map(notifications.map(n=>[n.id,n]));
    const owned=pending.notifications.filter(n=>n.extra?.terminal);
    const changed=owned.filter(n=>!desired.has(n.id) || n.extra?.signature!==desired.get(n.id)?.extra?.signature);
    if (changed.length) await api.cancel({notifications:changed.map(n=>({id:n.id}))});
    const current=new Map(owned.map(n=>[n.id,n]));
    const unscheduled=notifications.filter(n=>!current.has(n.id) || current.get(n.id)?.extra?.signature!==n.extra?.signature);
    if (status.permission==='granted') {
      await init(actions);
      if (unscheduled.length) await api.schedule({notifications:unscheduled});
    }
    return status;
  }
  function reconcile(reminders:Reminder[]):Promise<ReminderNotificationStatus> {
    const task=queue.then(()=>reconcileNow(reminders));
    queue=task.then(()=>undefined,()=>undefined);
    return task;
  }
  async function requestPermission() {
    if (!native()) return web;
    await api.requestPermissions();
    return getStatus();
  }
  async function testNotification() {
    const status=await getStatus();
    if (!status.native || status.permission!=='granted') throw new Error(status.message);
    await init(actions);
    await api.schedule({notifications:[{id:-2147483647,title:'帝江号',body:'通知测试成功',channelId:'terminal-reminders',schedule:{at:new Date(now().getTime()+5000),allowWhileIdle:true},extra:{terminal:true,test:true}}]});
  }
  return {init,reconcile,getStatus,requestPermission,test:testNotification};
}
export const reminderNotifications=createReminderNotificationService();
