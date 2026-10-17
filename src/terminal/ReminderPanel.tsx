import {useState,useRef,useEffect} from 'react';
import {InkDragon} from './InkDragon';
import {PaperIcon} from './PaperIcon';
import {paperGroupOrder,reminderPaperGroup} from './paperRecords';
import type {FormEvent} from 'react';
import {completeReminder, createReminder, localDateTime, nextReminderOccurrence, snoozeReminder, validateReminder} from './reminders';
import type {Reminder, ReminderRecurrence} from './reminders';
import type {ReminderNotificationStatus} from './reminderNotifications';

export interface ReminderPanelProps {
  visualTheme?:string;
  reminders:Reminder[];
  onSave:(reminder:Reminder)=>Promise<void>;
  onDelete:(id:string)=>Promise<void>;
  notificationStatus?:ReminderNotificationStatus;
  onRequestPermission?:()=>Promise<unknown>;
  onTestNotification?:()=>Promise<unknown>;
}
const names:Record<ReminderRecurrence,string>={once:'仅一次',daily:'每天',weekly:'每周',monthly:'每月',yearly:'每年 · 公历生日'};
export function ReminderPanel({visualTheme,reminders,onSave,onDelete,notificationStatus,onRequestPermission,onTestNotification}:ReminderPanelProps) {
  const isSi=visualTheme==='si';
  const [detailOpen,setDetailOpen]=useState(false);
  const [saved,setSaved]=useState(false);
  const detailHeading=useRef<HTMLHeadingElement>(null);
  const rowRefs=useRef(new Map<string,HTMLButtonElement>());
  useEffect(()=>{if(isSi&&detailOpen)detailHeading.current?.focus();},[isSi,detailOpen]);
  function closeDetail(){setDetailOpen(false);requestAnimationFrame(()=>{if(selectedId)rowRefs.current.get(selectedId)?.focus();});}
  const sorted=[...reminders].sort((a,b)=>(nextReminderOccurrence(a)?.getTime()??Infinity)-(nextReminderOccurrence(b)?.getTime()??Infinity));
  const [selectedId,setSelectedId]=useState<string|null>(()=>sorted[0]?.id??null);
  const selected=sorted.find(reminder=>reminder.id===selectedId)??sorted[0];
  const next=selected?nextReminderOccurrence(selected):null;
  const status=(reminder:Reminder)=>reminder.completedAt&&reminder.recurrence==='once'?'已完成':!reminder.enabled?'已暂停':nextReminderOccurrence(reminder)?'待提醒':'已到期';
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
    setBusy(true);setError('');setSaved(false);
    try {await action();} catch (e) {setError(e instanceof Error?e.message:'操作失败，请重试');} finally {setBusy(false);}
  }
  function open(reminder?:Reminder) {
    setSaved(false);setEditing(reminder??null);setTitle(reminder?.title??'');setBody(reminder?.body??'');setStartAt(reminder?.startAt??localDateTime(new Date(Date.now()+3600000)));setRecurrence(reminder?.recurrence??'once');setError('');setFormOpen(true);
  }
  function submit(event:FormEvent) {
    event.preventDefault();
    void run(async()=>{
      const saved=editing?validateReminder({...editing,title,body,startAt,recurrence,completedAt:undefined,skipUntil:undefined,snoozedUntil:undefined,updatedAt:new Date().toISOString()}):createReminder({title,body,startAt,recurrence},reminders);
      if (recurrence==='once' && new Date(startAt).getTime()<=Date.now()) throw new Error('一次提醒请选择未来时间');
      await onSave(saved);setSelectedId(saved.id);setFormOpen(false);setEditing(null);setDetailOpen(false);setSaved(true);
    });
  }
  return <section className="terminal-panel reminder-missions" aria-label="提醒">
    <div className="panel-heading"><div><h2>提醒与生日</h2></div><button type="button" onClick={()=>open()} disabled={busy}>新增提醒</button></div>
    {isSi&&<div className="paper-scene reminder-scene"><InkDragon className="si-dragon-glyph" kind="reminders"/><span className="paper-scene-title">挂一盏灯，留个念想。</span><span className="paper-seal" aria-hidden="true">记</span></div>}
    <details className="mission-help"><summary>时间与重复规则</summary><p className="muted">以设备当地时间执行。每月 31 日跳过没有 31 日的月份；2 月 29 日生日仅在闰年提醒。</p></details>
    <div className="notice" role="status"><p>{notificationStatus?.message??'网页预览可管理提醒；定时通知需要 Android 应用。'}</p>
      {notificationStatus?.native && notificationStatus.permission!=='granted' && onRequestPermission && <button type="button" disabled={busy} onClick={()=>void run(onRequestPermission)}>允许系统通知</button>}
      {notificationStatus?.native && notificationStatus.permission==='granted' && onTestNotification && <button type="button" disabled={busy} onClick={()=>void run(onTestNotification)}>测试通知</button>}
    </div>
    {saved&&<p className="paper-save-feedback" role="status">提醒已收好</p>}
    {error && <p role="alert" className="error">{error}</p>}
    {formOpen && <form className="terminal-form" onSubmit={submit} aria-label={editing?'编辑提醒':'新增提醒'}>
      <h3>{isSi&&<PaperIcon kind="brush"/>}{editing?'编辑提醒':'新增提醒'}</h3>
      <label>事项<input name="reminder-title" required maxLength={200} value={title} onChange={e=>setTitle(e.target.value)} autoFocus /></label>
      <label>内容<textarea name="reminder-body" maxLength={4000} value={body} onChange={e=>setBody(e.target.value)} /></label>
      <label>日期与时间<input name="reminder-time" type="datetime-local" min="1900-01-01T00:00" max="9999-12-31T23:59" required value={startAt} onChange={e=>setStartAt(e.target.value)} /></label>
      <label>重复<select name="reminder-recurrence" value={recurrence} onChange={e=>setRecurrence(e.target.value as ReminderRecurrence)}>{Object.entries(names).map(([value,name])=><option key={value} value={value}>{name}</option>)}</select></label>
      <div className="button-row"><button type="submit" disabled={busy}>{busy?'保存中…':'保存提醒'}</button><button type="button" onClick={()=>setFormOpen(false)} disabled={busy}>取消</button></div>
    </form>}
    {sorted.length===0 && <div className="empty-state">{isSi&&<PaperIcon kind="bell"/>}<h3>给重要的事留个提醒</h3><p>添加待办、每日习惯，或每年的公历生日。</p></div>}
    {selected && <div className="mission-workspace">
      {(!isSi||!detailOpen)&&<nav className="mission-list" aria-label="提醒事项列表"><p className="mission-list-caption">提醒事项 <span>{sorted.length}</span></p>{(isSi?paperGroupOrder:['全部']).map(group=>{
        const items=isSi?sorted.filter(r=>reminderPaperGroup(r)===group):sorted;
        return items.length>0&&<section className="reminder-day" style={isSi?undefined:{display:'contents'}} key={group} aria-label={group}>{isSi&&<h3 className="paper-day-heading">{group}<span>{items.length} 件</span></h3>}{items.map(reminder=>{
        const occurrence=nextReminderOccurrence(reminder);
        return <button type="button" className="mission-row" key={reminder.id} ref={node=>{if(node)rowRefs.current.set(reminder.id,node);else rowRefs.current.delete(reminder.id);}} aria-label={`查看提醒：${reminder.title}`} aria-pressed={(!isSi||detailOpen)&&selected.id===reminder.id} onClick={()=>{setSelectedId(reminder.id);setDetailOpen(true);}}>
          {isSi&&<PaperIcon kind="bell"/>}<span className="mission-row-title">{reminder.title}</span><span className="mission-row-meta">{names[reminder.recurrence]} · {status(reminder)}</span>
          <time dateTime={occurrence?.toISOString()??reminder.startAt}>{occurrence?occurrence.toLocaleString('zh-CN',{year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):reminder.startAt.replace('T',' ')}</time>
        </button>;
      })}</section>})}</nav>}

      {(!isSi||detailOpen)&&<article className="mission-detail" aria-label="选中提醒详情">
        {isSi&&<div className="button-row paper-back"><button type="button" onClick={closeDetail}>返回便笺</button></div>}
        <header className="mission-detail-header"><span className="mission-status">{status(selected)}</span><h3 ref={detailHeading} tabIndex={-1}>{selected.title}</h3><label className="toggle-label"><input type="checkbox" checked={selected.enabled} disabled={busy} onChange={e=>void run(()=>onSave({...selected,enabled:e.target.checked,completedAt:e.target.checked?undefined:selected.completedAt,updatedAt:new Date().toISOString()}))} />启用</label></header>
        <div className="mission-next"><p>{next?'下次提醒':'提醒状态'}</p>{next?<time dateTime={next.toISOString()}>{next.toLocaleString('zh-CN',{year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</time>:<strong>{status(selected)}</strong>}</div>
        <p className="mission-recurrence">{names[selected.recurrence]} · 设备当地时间</p>
        {selected.body && <p className="mission-body">{selected.body}</p>}
        {selected.snoozedUntil && Date.parse(selected.snoozedUntil)>Date.now() && <p className="muted">稍后提醒：{new Date(selected.snoozedUntil).toLocaleString('zh-CN')}</p>}
        <div className="mission-actions"><button type="button" disabled={busy || !selected.enabled} onClick={()=>void run(()=>onSave(completeReminder(selected)))}>{selected.recurrence==='once'?'完成':'完成本次'}</button><button type="button" disabled={busy} onClick={()=>void run(()=>onSave(snoozeReminder(selected)))}>10 分钟后</button><button type="button" disabled={busy} onClick={()=>open(selected)}>编辑</button><button className="danger" type="button" disabled={busy} onClick={()=>void run(async()=>{await onDelete(selected.id);setDetailOpen(false);setSelectedId(sorted.find(reminder=>reminder.id!==selected.id)?.id??null);})}>删除</button></div>
      </article>}
    </div>}
  </section>;
}
