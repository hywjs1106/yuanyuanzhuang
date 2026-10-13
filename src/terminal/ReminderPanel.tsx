import {useState} from 'react';
import type {FormEvent} from 'react';
import {completeReminder, createReminder, localDateTime, nextReminderOccurrence, snoozeReminder, validateReminder} from './reminders';
import type {Reminder, ReminderRecurrence} from './reminders';
import type {ReminderNotificationStatus} from './reminderNotifications';

export interface ReminderPanelProps {
  reminders:Reminder[];
  onSave:(reminder:Reminder)=>Promise<void>;
  onDelete:(id:string)=>Promise<void>;
  notificationStatus?:ReminderNotificationStatus;
  onRequestPermission?:()=>Promise<unknown>;
  onTestNotification?:()=>Promise<unknown>;
}
const names:Record<ReminderRecurrence,string>={once:'仅一次',daily:'每天',weekly:'每周',monthly:'每月',yearly:'每年 · 公历生日'};
export function ReminderPanel({reminders,onSave,onDelete,notificationStatus,onRequestPermission,onTestNotification}:ReminderPanelProps) {
  const [editing,setEditing]=useState<Reminder|null>(null);
  const [formOpen,setFormOpen]=useState(false);
  const [title,setTitle]=useState('');
  const [body,setBody]=useState('');
  const [startAt,setStartAt]=useState(()=>localDateTime(new Date(Date.now()+3600000)));
  const [recurrence,setRecurrence]=useState<ReminderRecurrence>('once');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  async function run(action:()=>Promise<unknown>) {
    if (busy) return;
    setBusy(true);setError('');
    try {await action();} catch (e) {setError(e instanceof Error?e.message:'操作失败，请重试');} finally {setBusy(false);}
  }
  function open(reminder?:Reminder) {
    setEditing(reminder??null);setTitle(reminder?.title??'');setBody(reminder?.body??'');setStartAt(reminder?.startAt??localDateTime(new Date(Date.now()+3600000)));setRecurrence(reminder?.recurrence??'once');setError('');setFormOpen(true);
  }
  function submit(event:FormEvent) {
    event.preventDefault();
    void run(async()=>{
      const saved=editing?validateReminder({...editing,title,body,startAt,recurrence,completedAt:undefined,skipUntil:undefined,snoozedUntil:undefined,updatedAt:new Date().toISOString()}):createReminder({title,body,startAt,recurrence},reminders);
      if (recurrence==='once' && new Date(startAt).getTime()<=Date.now()) throw new Error('一次提醒请选择未来时间');
      await onSave(saved);setFormOpen(false);setEditing(null);
    });
  }
  const sorted=[...reminders].sort((a,b)=>(nextReminderOccurrence(a)?.getTime()??Infinity)-(nextReminderOccurrence(b)?.getTime()??Infinity));
  return <section className="terminal-panel" aria-label="提醒">
    <div className="panel-heading"><div><p className="eyebrow">REMINDERS</p><h2>提醒与生日</h2></div><button type="button" onClick={()=>open()} disabled={busy}>新增提醒</button></div>
    <p className="muted">以设备当地时间执行。每月 31 日跳过没有 31 日的月份；2 月 29 日生日仅在闰年提醒。</p>
    <div className="notice" role="status"><p>{notificationStatus?.message??'网页预览可管理提醒；定时通知需要 Android 应用。'}</p>
      {notificationStatus?.native && notificationStatus.permission!=='granted' && onRequestPermission && <button type="button" disabled={busy} onClick={()=>void run(onRequestPermission)}>允许系统通知</button>}
      {notificationStatus?.native && notificationStatus.permission==='granted' && onTestNotification && <button type="button" disabled={busy} onClick={()=>void run(onTestNotification)}>测试通知</button>}
    </div>
    {error && <p role="alert" className="error">{error}</p>}
    {formOpen && <form className="terminal-form" onSubmit={submit} aria-label={editing?'编辑提醒':'新增提醒'}>
      <h3>{editing?'编辑提醒':'新增提醒'}</h3>
      <label>事项<input name="reminder-title" required maxLength={200} value={title} onChange={e=>setTitle(e.target.value)} autoFocus /></label>
      <label>内容<textarea name="reminder-body" maxLength={4000} value={body} onChange={e=>setBody(e.target.value)} /></label>
      <label>日期与时间<input name="reminder-time" type="datetime-local" min="1900-01-01T00:00" max="9999-12-31T23:59" required value={startAt} onChange={e=>setStartAt(e.target.value)} /></label>
      <label>重复<select name="reminder-recurrence" value={recurrence} onChange={e=>setRecurrence(e.target.value as ReminderRecurrence)}>{Object.entries(names).map(([value,name])=><option key={value} value={value}>{name}</option>)}</select></label>
      <div className="button-row"><button type="submit" disabled={busy}>{busy?'保存中…':'保存提醒'}</button><button type="button" onClick={()=>setFormOpen(false)} disabled={busy}>取消</button></div>
    </form>}
    {sorted.length===0 && <div className="empty-state"><h3>给重要的事留个提醒</h3><p>添加待办、每日习惯，或每年的公历生日。</p></div>}
    <div className="reminder-list">{sorted.map(reminder=>{
      const next=nextReminderOccurrence(reminder);
      const snoozed=reminder.snoozedUntil && Date.parse(reminder.snoozedUntil)>Date.now();
      return <article className={`reminder-card ${reminder.enabled?'':'is-disabled'}`} key={reminder.id}>
        <div className="panel-heading"><h3>{reminder.title}</h3><label className="toggle-label"><input type="checkbox" checked={reminder.enabled} disabled={busy} onChange={e=>void run(()=>onSave({...reminder,enabled:e.target.checked,completedAt:e.target.checked?undefined:reminder.completedAt,updatedAt:new Date().toISOString()}))} />启用</label></div>
        {reminder.body && <p>{reminder.body}</p>}
        <p className="muted">{names[reminder.recurrence]} · {next?`下次 ${next.toLocaleString('zh-CN')}`:reminder.completedAt&&reminder.recurrence==='once'?'已完成':reminder.enabled?'已到期':'已暂停'}</p>
        {snoozed && <p className="muted">稍后提醒：{new Date(reminder.snoozedUntil!).toLocaleString('zh-CN')}</p>}
        <div className="button-row"><button type="button" disabled={busy || !reminder.enabled} onClick={()=>void run(()=>onSave(completeReminder(reminder)))}>{reminder.recurrence==='once'?'完成':'完成本次'}</button><button type="button" disabled={busy} onClick={()=>void run(()=>onSave(snoozeReminder(reminder)))}>10 分钟后</button><button type="button" disabled={busy} onClick={()=>open(reminder)}>编辑</button><button className="danger" type="button" disabled={busy} onClick={()=>void run(()=>onDelete(reminder.id))}>删除</button></div>
      </article>;
    })}</div>
  </section>;
}
