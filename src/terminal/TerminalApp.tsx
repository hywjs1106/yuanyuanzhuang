import {useCallback,useEffect,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {App as NativeApp} from '@capacitor/app';
import {Capacitor,registerPlugin} from '@capacitor/core';
import type {LedgerExpenseType} from '@/types';
import {terminalDb,defaultSettings,initializeTerminal,saveEntry,saveReminder,saveSettings} from './data';
import {summarizeLedger,localDateKey,type TerminalSettings} from './ledger';
import {LedgerPanel} from './LedgerPanel';import {AssistantPanel} from './AssistantPanel';import {SettingsPanel} from './SettingsPanel';import {ReminderPanel} from './ReminderPanel';import {WeatherPanel} from './WeatherPanel';import {AlmanacPanel} from './AlmanacPanel';
import {getAlmanacSummary} from './almanac';
import {createReminder,completeDeliveredReminder,snoozeDeliveredReminder,nextReminderOccurrence,type Reminder} from './reminders';
import {reminderNotifications,type ReminderNotificationStatus} from './reminderNotifications';
import type {Proposal} from './assistant';
import {assistantConfigured} from './assistant';
import './terminal.css';
import {readWeatherCache,type WeatherBundle} from './weather';
import {syncWeatherBriefing} from './weatherBriefing';
import {BottomNavigation,type TerminalPage} from './BottomNavigation';
import {TerminalStatusStrip,TerminalInstrument} from './TerminalVisuals';
const TerminalAlarms=registerPlugin<{check:()=>Promise<{granted:boolean}>;request:()=>Promise<{granted:boolean}>}>('TerminalAlarms');
type Page=TerminalPage;
const titles:Record<Page,string>={today:'今日总览',ledger:'记账',reminders:'提醒',weather:'天气',almanac:'黄历',assistant:'庄方宜',notes:'备忘',settings:'设置'};
export default function TerminalApp(){
  const [page,setPage]=useState<Page>('today');const [ready,setReady]=useState(false);const [fatal,setFatal]=useState('');const [notice,setNotice]=useState('');const [note,setNote]=useState('');const [date,setDate]=useState(localDateKey());const [notif,setNotif]=useState<ReminderNotificationStatus>();const [exact,setExact]=useState<boolean>();const [keyboardOpen,setKeyboardOpen]=useState(false);
  const entries=useLiveQuery(()=>terminalDb.entries.toArray(),[],[]);const reminders=useLiveQuery(()=>terminalDb.reminders.toArray(),[],[]);const notes=useLiveQuery(()=>terminalDb.notes.orderBy('createdAt').reverse().toArray(),[],[]);const messages=useLiveQuery(()=>terminalDb.messages.orderBy('createdAt').toArray(),[],[]);const settings=useLiveQuery(()=>terminalDb.settings.get('main'),[])??defaultSettings;
  const summary=summarizeLedger(entries??[],date.slice(0,7));
  const refreshNotifications=useCallback(async()=>{try{setNotif(await reminderNotifications.reconcile(await terminalDb.reminders.toArray()));if(Capacitor.isNativePlatform())setExact((await TerminalAlarms.check()).granted);}catch(e){setNotice(e instanceof Error?e.message:'系统通知排程失败');}},[]);
  useEffect(()=>{let alive=true;initializeTerminal().then(()=>{if(alive)setReady(true);}).catch(e=>{if(alive)setFatal(e instanceof Error?e.message:'本地数据库无法打开');});return()=>{alive=false;};},[]);
  useEffect(()=>{if(!ready)return;void reminderNotifications.init({onComplete:async id=>{const r=await terminalDb.reminders.get(id);if(r)await saveReminder(completeDeliveredReminder(r));await refreshNotifications();},onSnooze:async id=>{const r=await terminalDb.reminders.get(id);if(r)await saveReminder(snoozeDeliveredReminder(r));await refreshNotifications();},onError:e=>setNotice(e instanceof Error?e.message:'通知操作失败')}).then(refreshNotifications).catch(e=>setNotice(String(e)));
    let stop:undefined|(()=>void);if(Capacitor.isNativePlatform())void NativeApp.addListener('appStateChange',s=>{if(s.isActive){setDate(localDateKey());void refreshNotifications();}}).then(h=>{stop=()=>void h.remove();});const timer=setInterval(()=>setDate(localDateKey()),60000);return()=>{stop?.();clearInterval(timer);};
  },[ready,refreshNotifications]);
  useEffect(()=>{if(ready)void refreshNotifications();},[reminders,ready,refreshNotifications]);
  const weatherUpdated=useCallback((bundle:WeatherBundle)=>{void terminalDb.settings.get('main').then(s=>syncWeatherBriefing(bundle,!!s?.weatherBriefing,s?.weatherBriefingTime)).catch(e=>setNotice(String(e)));},[]);
  useEffect(()=>{if(ready)void syncWeatherBriefing(readWeatherCache(settings.weather??{provider:'openmeteo'}),!!settings.weatherBriefing,settings.weatherBriefingTime).catch(e=>setNotice(String(e)));},[ready,settings.weather,settings.weatherBriefing,settings.weatherBriefingTime]);
  useEffect(()=>{document.documentElement.dataset.terminalTheme=settings.theme??'light';document.documentElement.style.colorScheme=settings.theme??'light';},[settings.theme]);
  useEffect(()=>{const viewport=window.visualViewport;let fullHeight=window.innerHeight;
    const update=()=>{const editable=document.activeElement?.matches('textarea,input:not([type=checkbox]):not([type=button]):not([type=submit]),[contenteditable=true]')??false;const height=viewport?.height??window.innerHeight;if(!editable||height>fullHeight)fullHeight=Math.max(window.innerHeight,height);const inset=editable&&(viewport?.scale??1)===1?Math.max(0,fullHeight-height,window.innerHeight-height-(viewport?.offsetTop??0)):0;setKeyboardOpen(inset>120);document.documentElement.style.setProperty('--keyboard-inset',`${inset}px`);};
    const orient=()=>{fullHeight=window.innerHeight;update();};viewport?.addEventListener('resize',update);viewport?.addEventListener('scroll',update);window.addEventListener('resize',update);window.addEventListener('orientationchange',orient);document.addEventListener('focusout',update);update();return()=>{viewport?.removeEventListener('resize',update);viewport?.removeEventListener('scroll',update);window.removeEventListener('resize',update);window.removeEventListener('orientationchange',orient);document.removeEventListener('focusout',update);};},[]);
  useEffect(()=>{if(!Capacitor.isNativePlatform())return;let disposed=false;let remove:undefined|(()=>void);void NativeApp.addListener('backButton',()=>{const event=new Event('terminal-back',{cancelable:true});window.dispatchEvent(event);if(event.defaultPrevented)return;if(keyboardOpen){(document.activeElement as HTMLElement|null)?.blur();return;}if(page!=='today'){setPage('today');window.scrollTo(0,0);}else void NativeApp.exitApp();}).then(handler=>{if(disposed)void handler.remove();else remove=()=>void handler.remove();});return()=>{disposed=true;remove?.();};},[page,keyboardOpen]);
  async function updateSettings(next:TerminalSettings){await saveSettings(next);}
  async function confirm(proposal:Proposal){
    if(proposal.kind==='ledger')await saveEntry({id:crypto.randomUUID(),direction:proposal.direction,amount:proposal.amount,date:proposal.date,note:proposal.note,type:proposal.type as LedgerExpenseType,currency:'CNY',source:'ai',createdAt:new Date()});
    if(proposal.kind==='note')await terminalDb.notes.put({id:crypto.randomUUID(),text:proposal.text,createdAt:new Date().toISOString()});
    if(proposal.kind==='reminder'){const r=createReminder({title:proposal.title,startAt:proposal.at,recurrence:proposal.repeat==='none'?'once':proposal.repeat},await terminalDb.reminders.toArray());if(!nextReminderOccurrence(r))throw new Error('这个单次提醒时间已经过去，请重新指定未来时间');await saveReminder(r);await refreshNotifications();}
  }
  async function addNote(){try{if(!note.trim())return;await terminalDb.notes.put({id:crypto.randomUUID(),text:note.trim(),createdAt:new Date().toISOString()});setNote('');}catch(e){setNotice(String(e));}}
  if(fatal)return <main className="terminal-shell"><h1>本地数据暂时无法打开</h1><p role="alert">{fatal}</p><button onClick={()=>window.location.reload()}>重试</button></main>;
  if(!ready)return <main className="terminal-shell"><p role="status">正在打开你的日常终端…</p></main>;
  const upcoming=(reminders??[]).map(r=>({r,at:nextReminderOccurrence(r)})).filter((x):x is {r:Reminder;at:Date}=>!!x.at).sort((a,b)=>a.at.getTime()-b.at.getTime()).slice(0,4);
  const reminderCount=(reminders??[]).filter(r=>r.enabled&&!!nextReminderOccurrence(r)).length;
  const navigate=(next:Page)=>{setPage(next);window.scrollTo({top:0,behavior:'instant'});};
  const weatherPanel=<WeatherPanel config={settings.weather??{provider:'openmeteo'}} onConfigChange={weather=>updateSettings({...settings,weather})} onBundleChange={weatherUpdated}/>;
  return <div className={`terminal-shell ${keyboardOpen?'keyboard-open':''}`}><header className="terminal-header"><div><span className="eyebrow">PERSONAL / OPERATIONS TERMINAL</span><h1>日常终端</h1></div><button className="theme-button" aria-label="切换深浅模式" onClick={()=>void updateSettings({...settings,theme:settings.theme==='dark'?'light':'dark'}).catch(e=>setNotice(String(e)))}>{settings.theme==='dark'?'浅色':'深色'}</button></header>
    <TerminalStatusStrip date={date} reminderCount={reminderCount} aiConfigured={assistantConfigured(settings.ai)}/>
    <div className="page-route"><span className="route-code">{page.toUpperCase()}</span><span>{titles[page]}</span><span className="route-rule" aria-hidden="true"/></div>
    {notice&&<div className="notice toast" role="status"><p>{notice}</p><button aria-label="关闭提示" onClick={()=>setNotice('')}>关闭</button></div>}
    <main className={`terminal-content page-${page}`}>
    {page==='today'&&<><section className="panel today-intro"><div className="hero-body"><div className="hero-copy"><p className="eyebrow">DAILY BRIEF / 今日简报</p><h2>日常总控</h2><p className="hero-greeting">管理员，今天的安排放在这里。<br/>先看眼前，再慢慢往前走。</p><button className="almanac-summary" onClick={()=>navigate('almanac')}>{getAlmanacSummary(date)} →</button></div><TerminalInstrument expense={summary.expense} budget={settings.budget} reminderCount={reminderCount}/></div><div className="stat-row"><div><small>本月支出</small><strong>¥{summary.expense.toFixed(2)}</strong></div><div><small>{settings.budget>0?'预算剩余':'记录余额'}</small><strong>¥{(settings.budget>0?settings.budget-summary.expense:summary.balance).toFixed(2)}</strong></div></div></section>
    <section className="panel"><div className="panel-heading"><h2>接下来</h2><button onClick={()=>setPage('reminders')}>管理提醒</button></div>{upcoming.length?upcoming.map(({r,at})=><button className="agenda-item" key={r.id} onClick={()=>setPage('reminders')}><span>{r.title}</span><time>{at.toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</time></button>):<p className="muted">目前没有即将到来的提醒。</p>}<div className="quick-actions"><button onClick={()=>setPage('ledger')}>记一笔账</button><button onClick={()=>setPage('assistant')}>告诉助手</button></div></section>{weatherPanel}</>}
    {page==='ledger'&&<LedgerPanel entries={entries??[]} onSave={saveEntry} onDelete={async id=>{await terminalDb.entries.delete(id);}}/>}
    {page==='reminders'&&<><ReminderPanel reminders={reminders??[]} onSave={async r=>{await saveReminder(r);await refreshNotifications();}} onDelete={async id=>{await terminalDb.reminders.delete(id);await refreshNotifications();}} notificationStatus={notif} onRequestPermission={async()=>{setNotif(await reminderNotifications.requestPermission());await refreshNotifications();}} onTestNotification={()=>reminderNotifications.test()}/>{Capacitor.isNativePlatform()&&<div className="notice"><p>准点提醒权限：{exact===undefined?'检查中':exact?'已允许':'尚未允许，提醒可能延迟'}</p>{exact===false&&<button onClick={()=>void TerminalAlarms.request().then(s=>setExact(s.granted)).catch(e=>setNotice(String(e)))}>允许准点提醒</button>}<p className="muted">手机强行停止应用、限制后台或省电设置可能影响通知。可用“测试通知”检查。</p></div>}</>}
    {page==='weather'&&weatherPanel}{page==='almanac'&&<AlmanacPanel/>}
    {page==='assistant'&&<AssistantPanel config={settings.ai} context={`今日${getAlmanacSummary(date)}；本月支出${summary.expense}元；待提醒事项：${upcoming.map(x=>`${x.r.title} ${x.r.startAt}`).join('；')}。`} messages={messages??[]} onMessage={async m=>{await terminalDb.messages.put(m);}} onConfirm={confirm}/>}
    {page==='notes'&&<section className="panel"><h2>备忘与购物清单</h2><label>写点什么<textarea value={note} maxLength={10000} rows={4} onChange={e=>setNote(e.target.value)} placeholder="要买的东西、临时想法…"/></label><button disabled={!note.trim()} onClick={()=>void addNote()}>保存备忘</button>{(notes??[]).map(n=><article className="note-item" key={n.id}><p>{n.text}</p><small>{new Date(n.createdAt).toLocaleString('zh-CN')}</small><button className="danger" onClick={()=>void terminalDb.notes.delete(n.id).catch(e=>setNotice(String(e)))}>删除</button></article>)}</section>}
    {page==='settings'&&<SettingsPanel settings={settings} onSave={updateSettings} onNotice={setNotice}/>}
    </main><footer className="terminal-footer"><span>LOCAL ARCHIVE / 本地保存</span><span>你的生活，你来安排</span></footer><BottomNavigation currentPage={page} onNavigate={navigate} keyboardOpen={keyboardOpen}/></div>;
}
