import {useCallback,useEffect,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {App as NativeApp} from '@capacitor/app';
import {Capacitor,registerPlugin} from '@capacitor/core';
import type {LedgerExpenseType} from '@/types';
import {terminalDb,defaultSettings,initializeTerminal,saveEntry,saveReminder,saveSettingsKeepingVisualTheme,setVisualTheme} from './data';
import {summarizeLedger,localDateKey,type TerminalSettings} from './ledger';
import {LedgerPanel} from './LedgerPanel';import {AssistantPanel} from './AssistantPanel';import {SettingsPanel} from './SettingsPanel';import {ReminderPanel} from './ReminderPanel';import {WeatherPanel,WeatherRefresh} from './WeatherPanel';import {AlmanacPanel} from './AlmanacPanel';
import {getAlmanacSummary} from './almanac';
import {createReminder,completeDeliveredReminder,snoozeDeliveredReminder,nextReminderOccurrence,type Reminder} from './reminders';
import {reminderNotifications,type ReminderNotificationStatus} from './reminderNotifications';
import type {Proposal} from './assistant';
import './terminal.css';
import './assistant-chat.css';
import './sticker-gallery.css';
import './overview-hub.css';
import './reminder-missions.css';
import './terminal-polish.css';
import './si-theme.css';
import {OverviewPanel} from './OverviewPanel';
import {readWeatherCache,type WeatherBundle} from './weather';
import {syncWeatherBriefing} from './weatherBriefing';
import {BottomNavigation,type TerminalPage} from './BottomNavigation';
const TerminalAlarms=registerPlugin<{check:()=>Promise<{granted:boolean}>;request:()=>Promise<{granted:boolean}>}>('TerminalAlarms');
type Page=TerminalPage;
export default function TerminalApp(){
  const [navigationMotion,setNavigationMotion]=useState(false);
  const [routeDirection,setRouteDirection]=useState<'forward'|'back'>('forward');
  useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const stop=()=>{if(media.matches)setNavigationMotion(false);};media.addEventListener('change',stop);return()=>media.removeEventListener('change',stop);},[]);
  const [page,setPage]=useState<Page>('today');const [ready,setReady]=useState(false);const [fatal,setFatal]=useState('');const [notice,setNotice]=useState('');const [note,setNote]=useState('');const [date,setDate]=useState(localDateKey());const [notif,setNotif]=useState<ReminderNotificationStatus>();const [exact,setExact]=useState<boolean>();const [keyboardOpen,setKeyboardOpen]=useState(false);
  const entries=useLiveQuery(()=>terminalDb.entries.toArray(),[],[]);const reminders=useLiveQuery(()=>terminalDb.reminders.toArray(),[],[]);const notes=useLiveQuery(()=>terminalDb.notes.orderBy('createdAt').reverse().toArray(),[],[]);const messages=useLiveQuery(()=>terminalDb.messages.orderBy('createdAt').toArray(),[],[]);const settings=useLiveQuery(()=>terminalDb.settings.get('main'),[])??defaultSettings;
  const brandName=settings.visualTheme==='si'?'缘缘庄':'帝江号';
  useEffect(()=>{document.title=brandName;},[brandName]);
  const summary=summarizeLedger(entries??[],date.slice(0,7));
  const refreshNotifications=useCallback(async()=>{try{setNotif(await reminderNotifications.reconcile(await terminalDb.reminders.toArray()));if(Capacitor.isNativePlatform())setExact((await TerminalAlarms.check()).granted);}catch(e){setNotice(e instanceof Error?e.message:'系统通知排程失败');}},[]);
  useEffect(()=>{let alive=true;initializeTerminal().then(()=>{if(alive)setReady(true);}).catch(e=>{if(alive)setFatal(e instanceof Error?e.message:'本地数据库无法打开');});return()=>{alive=false;};},[]);
  useEffect(()=>{if(!ready)return;void reminderNotifications.init({onComplete:async id=>{const r=await terminalDb.reminders.get(id);if(r)await saveReminder(completeDeliveredReminder(r));await refreshNotifications();},onSnooze:async id=>{const r=await terminalDb.reminders.get(id);if(r)await saveReminder(snoozeDeliveredReminder(r));await refreshNotifications();},onError:e=>setNotice(e instanceof Error?e.message:'通知操作失败')}).then(refreshNotifications).catch(e=>setNotice(String(e)));
    let stop:undefined|(()=>void);if(Capacitor.isNativePlatform())void NativeApp.addListener('appStateChange',s=>{if(s.isActive){setDate(localDateKey());void refreshNotifications();}}).then(h=>{stop=()=>void h.remove();});const timer=setInterval(()=>setDate(localDateKey()),60000);return()=>{stop?.();clearInterval(timer);};
  },[ready,refreshNotifications]);
  useEffect(()=>{if(ready)void refreshNotifications();},[reminders,ready,refreshNotifications]);
  const weatherUpdated=useCallback((bundle:WeatherBundle)=>{void terminalDb.settings.get('main').then(s=>syncWeatherBriefing(bundle,!!s?.weatherBriefing,s?.weatherBriefingTime)).catch(e=>setNotice(String(e)));},[]);
  useEffect(()=>{if(ready)void syncWeatherBriefing(readWeatherCache(settings.weather??{provider:'openmeteo'}),!!settings.weatherBriefing,settings.weatherBriefingTime).catch(e=>setNotice(String(e)));},[ready,settings.weather,settings.weatherBriefing,settings.weatherBriefingTime]);
  useEffect(()=>{document.documentElement.dataset.terminalVisual=settings.visualTheme==='si'?'si':'fangyi';},[settings.visualTheme]);
  useEffect(()=>{document.documentElement.dataset.terminalTheme=settings.theme??'light';document.documentElement.style.colorScheme=settings.theme??'light';},[settings.theme]);
  useEffect(()=>{const viewport=window.visualViewport;let fullHeight=window.innerHeight;
    const update=()=>{const editable=document.activeElement?.matches('textarea,input:not([type=checkbox]):not([type=button]):not([type=submit]),[contenteditable=true]')??false;const height=viewport?.height??window.innerHeight;if(!editable||height>fullHeight)fullHeight=Math.max(window.innerHeight,height);const inset=editable&&(viewport?.scale??1)===1?Math.max(0,fullHeight-height,window.innerHeight-height-(viewport?.offsetTop??0)):0;setKeyboardOpen(inset>120);document.documentElement.style.setProperty('--keyboard-inset',`${inset}px`);};
    const orient=()=>{fullHeight=window.innerHeight;update();};viewport?.addEventListener('resize',update);viewport?.addEventListener('scroll',update);window.addEventListener('resize',update);window.addEventListener('orientationchange',orient);document.addEventListener('focusout',update);update();return()=>{viewport?.removeEventListener('resize',update);viewport?.removeEventListener('scroll',update);window.removeEventListener('resize',update);window.removeEventListener('orientationchange',orient);document.removeEventListener('focusout',update);};},[]);
  useEffect(()=>{if(!Capacitor.isNativePlatform())return;let disposed=false;let remove:undefined|(()=>void);void NativeApp.addListener('backButton',()=>{const event=new Event('terminal-back',{cancelable:true});window.dispatchEvent(event);if(event.defaultPrevented)return;if(keyboardOpen){(document.activeElement as HTMLElement|null)?.blur();return;}if(page!=='today'){setRouteDirection('back');setNavigationMotion(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);setPage('today');window.scrollTo(0,0);}else void NativeApp.exitApp();}).then(handler=>{if(disposed)void handler.remove();else remove=()=>void handler.remove();});return()=>{disposed=true;remove?.();};},[page,keyboardOpen]);
  async function updateSettings(next:TerminalSettings){await saveSettingsKeepingVisualTheme(next);}
  async function confirm(proposal:Proposal,operationId:string=crypto.randomUUID(),signal?:AbortSignal):Promise<string>{
    const cancelled=()=>{if(signal?.aborted)throw new DOMException('已停止','AbortError');};cancelled();
    if(proposal.kind==='ledger'){
      await terminalDb.transaction('rw',terminalDb.entries,async()=>{if(await terminalDb.entries.get(operationId))return;cancelled();await saveEntry({id:operationId,direction:proposal.direction,amount:proposal.amount,date:proposal.date,note:proposal.note,type:proposal.type as LedgerExpenseType,currency:'CNY',source:'ai',createdAt:new Date()});});
      return `已记账：${proposal.date} · ${proposal.direction==='expense'?'支出':'收入'} ¥${proposal.amount.toFixed(2)}。`;
    }
    if(proposal.kind==='note'){
      await terminalDb.transaction('rw',terminalDb.notes,async()=>{if(await terminalDb.notes.get(operationId))return;cancelled();await terminalDb.notes.put({id:operationId,text:proposal.text,createdAt:new Date().toISOString()});});return '已保存备忘。';
    }
    await terminalDb.transaction('rw',terminalDb.reminders,async()=>{if(await terminalDb.reminders.get(operationId))return;const r={...createReminder({title:proposal.title,body:`管理员，到了约定的时间：${proposal.title}。`,startAt:proposal.at,recurrence:proposal.repeat==='none'?'once':proposal.repeat},await terminalDb.reminders.toArray()),id:operationId};if(!nextReminderOccurrence(r))throw new Error('这个单次提醒时间已经过去，请重新指定未来时间');cancelled();await saveReminder(r);});
    const receipt=`已添加提醒：${proposal.title} · ${proposal.at.replace('T',' ')}。`;
    try{const status=await reminderNotifications.reconcile(await terminalDb.reminders.toArray());setNotif(status);return receipt+(status.native?(status.permission==='granted'?'系统通知已安排。':'请到提醒页允许通知，才能到点提醒你。'):'定时通知需要安装安卓应用。');}catch{return receipt+'通知尚未安排成功，请到提醒页重试。';}
  }
  async function addNote(){try{if(!note.trim())return;await terminalDb.notes.put({id:crypto.randomUUID(),text:note.trim(),createdAt:new Date().toISOString()});setNote('');}catch(e){setNotice(String(e));}}
  if(fatal)return <main className="terminal-shell"><h1>本地数据暂时无法打开</h1><p role="alert">{fatal}</p><button onClick={()=>window.location.reload()}>重试</button></main>;
  if(!ready)return <main className="terminal-shell"><p role="status">正在打开你的生活终端…</p></main>;
  const upcoming=(reminders??[]).map(r=>({r,at:nextReminderOccurrence(r)})).filter((x):x is {r:Reminder;at:Date}=>!!x.at).sort((a,b)=>a.at.getTime()-b.at.getTime()).slice(0,4);
  const navigate=(next:Page)=>{if(next!==page){const rank=(value:Page)=>value==='assistant'?1:value==='settings'||value==='notes'?2:0;setRouteDirection(next==='today'||(page==='notes'&&next==='settings')||rank(next)<rank(page)?'back':'forward');setNavigationMotion(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);setPage(next);}window.scrollTo({top:0,behavior:'instant'});};
  const weatherPanel=<WeatherPanel config={settings.weather??{provider:'openmeteo'}} onConfigChange={weather=>updateSettings({...settings,weather})} onBundleChange={weatherUpdated}/>;
  return <div className={`terminal-shell ${page==='assistant'?'is-assistant':''} ${keyboardOpen?'keyboard-open':''}`}><header className="terminal-header"><div className="terminal-brand"><span className="brand-mascot"><img className={`brand-sigil ${settings.visualTheme==='si'?'brand-inn':'brand-ink-spirit'}`} src={settings.visualTheme==='si'?'/themes/si/inn-mark.png':'/characters/ink-spirit-number-one.png'} width="44" height="44" alt=""/></span><h1>{brandName}</h1></div><div className="terminal-header-actions"><button type="button" className="edition-toggle" aria-label="切换角色风格" aria-pressed={settings.visualTheme==='si'} onClick={()=>void setVisualTheme(settings.visualTheme==='si'?'fangyi':'si').catch(e=>setNotice(String(e)))}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h13l-3-3M17 14H4l3 3"/></svg>{settings.visualTheme==='si'?'祀':'方宜'}</button><button className="theme-button" aria-label="切换深浅模式" onClick={()=>void updateSettings({...settings,theme:settings.theme==='dark'?'light':'dark'}).catch(e=>setNotice(String(e)))}>{settings.theme==='dark'?'浅色':'深色'}</button></div></header>
    {notice&&<div className="notice toast" role="status"><p>{notice}</p><button aria-label="关闭提示" onClick={()=>setNotice('')}>关闭</button></div>}
    <main key={page} data-route-direction={routeDirection} onAnimationEnd={event=>{if(event.target===event.currentTarget)setNavigationMotion(false);}} className={`terminal-content page-${page}${navigationMotion?' route-enter':''}`}>
    {page==='today'&&<><OverviewPanel date={date} onNavigate={navigate} visualTheme={settings.visualTheme}/><WeatherRefresh config={settings.weather??{provider:'openmeteo'}} onBundleChange={weatherUpdated}/></>}
    {page==='ledger'&&<LedgerPanel entries={entries??[]} onSave={saveEntry} onDelete={async id=>{await terminalDb.entries.delete(id);}}/>}
    {page==='reminders'&&<><ReminderPanel reminders={reminders??[]} onSave={async r=>{await saveReminder(r);await refreshNotifications();}} onDelete={async id=>{await terminalDb.reminders.delete(id);await refreshNotifications();}} notificationStatus={notif} onRequestPermission={async()=>{setNotif(await reminderNotifications.requestPermission());await refreshNotifications();}} onTestNotification={()=>reminderNotifications.test()}/>{Capacitor.isNativePlatform()&&<div className="notice"><p>准点提醒权限：{exact===undefined?'检查中':exact?'已允许':'尚未允许，提醒可能延迟'}</p>{exact===false&&<button onClick={()=>void TerminalAlarms.request().then(s=>setExact(s.granted)).catch(e=>setNotice(String(e)))}>允许准点提醒</button>}<p className="muted">手机强行停止应用、限制后台或省电设置可能影响通知。可用“测试通知”检查。</p></div>}</>}
    {page==='weather'&&weatherPanel}{page==='almanac'&&<AlmanacPanel/>}
    {page==='assistant'&&<AssistantPanel key={settings.visualTheme??'fangyi'} character={settings.visualTheme??'fangyi'} config={settings.ai} context={`今日${getAlmanacSummary(date)}；本月支出${summary.expense}元；待提醒事项：${upcoming.map(x=>`${x.r.title} ${x.r.startAt}`).join('；')}。`} messages={(messages??[]).filter(m=>(m.character??'fangyi')===(settings.visualTheme??'fangyi'))} onMessage={async m=>{await terminalDb.messages.put({...m,character:settings.visualTheme??'fangyi'});}} onConfirm={confirm}/>}
    {page==='notes'&&<section className="panel"><h2>备忘与购物清单</h2><label>写点什么<textarea value={note} maxLength={10000} rows={4} onChange={e=>setNote(e.target.value)} placeholder="要买的东西、临时想法…"/></label><button disabled={!note.trim()} onClick={()=>void addNote()}>保存备忘</button>{(notes??[]).map(n=><article className="note-item" key={n.id}><p>{n.text}</p><small>{new Date(n.createdAt).toLocaleString('zh-CN')}</small><button className="danger" onClick={()=>void terminalDb.notes.delete(n.id).catch(e=>setNotice(String(e)))}>删除</button></article>)}</section>}
    {page==='settings'&&<SettingsPanel onVisualTheme={visualTheme=>setVisualTheme(visualTheme)} settings={settings} onSave={updateSettings} onNotice={setNotice} onOpenNotes={()=>navigate('notes')}/>}
    </main><BottomNavigation currentPage={page} onNavigate={navigate} keyboardOpen={keyboardOpen}/></div>;
}
