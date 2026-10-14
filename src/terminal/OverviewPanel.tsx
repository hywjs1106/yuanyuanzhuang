import type {TerminalPage} from './BottomNavigation';
import {TerminalIcon} from './TerminalVisuals';
import {LiveClock} from './LiveClock';
import {useEffect,useRef,useState,type ReactNode} from 'react';

export interface OverviewPanelProps {
  date:string;
  reminderCount:number;
  expense:number;
  balance:number;
  budget:number;
  almanacSummary:string;
  onNavigate:(page:TerminalPage)=>void;
  agenda?:ReactNode;
}

const modules = [
  {page:'ledger',label:'记账',detail:'记一笔账'},
  {page:'reminders',label:'提醒',detail:'查看安排'},
  {page:'weather',label:'天气',detail:'天气预报'},
  {page:'almanac',label:'黄历',detail:'每日宜忌'},
] as const;
const money=(amount:number)=>amount.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});

function HubMotion({children}:{children:ReactNode}) {
  const orbit=useRef<HTMLDivElement>(null);
  const [motionPaused,setMotionPaused]=useState(false);
  useEffect(()=>{
    let visible=true;
    const update=()=>setMotionPaused(document.hidden||!visible);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();});
    if(orbit.current)observer.observe(orbit.current);
    document.addEventListener('visibilitychange',update);update();
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);};
  },[]);
  return <div className={`hub-orbit${motionPaused?' hub-motion-paused':''}`} ref={orbit}>{children}</div>;
}

export function OverviewPanel({date,reminderCount,expense,balance,budget,almanacSummary,onNavigate,agenda}:OverviewPanelProps) {
  const remaining=budget-expense;
  return <section className="overview-hub" aria-labelledby="overview-hub-title">
    <header className="hub-heading"><h2 id="overview-hub-title">今日总览</h2><div className="hub-heading-meta"><time className="overview-date" dateTime={date}><span>{date.slice(0,4)}</span><strong>{date.slice(5,7)}月{date.slice(8)}日</strong></time><LiveClock/></div></header>
    <HubMotion>
      <svg className="hub-navigation-wires" viewBox="0 0 360 308" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M55 64V82H110L126 98M305 64V82H250L234 98M55 244V226H110L126 210M305 244V226H250L234 210"/><path d="M180 15V31M180 277V293M18 154H34M326 154H342"/></svg>
      <div className="hub-map-stage" aria-hidden="true"><div className="hub-map-base"/><div className="hub-map-rim"/><svg className="hub-rim-detail" viewBox="0 0 300 300" aria-hidden="true"><path d="M43 57A132 132 0 0 1 225 39M273 119A132 132 0 0 1 196 273M90 267A132 132 0 0 1 21 127"/><path d="M76 30A139 139 0 0 1 120 13M278 197A139 139 0 0 1 266 219"/></svg></div>
      <LiveClock variant="dial"/>
      <img className="hub-ship" src="/branding/dijiang-ship.png" alt="帝江号飞船" width="1536" height="1024" draggable="false"/>
      <span className="hub-ship-caption" aria-hidden="true">O.M.V. <strong>帝江号</strong></span>
    <div className="hub-modules">
      {modules.map(({page,label,detail})=><button key={page} type="button" className={`hub-plate hub-plate-${page}`} aria-label={`打开${label}`} onClick={()=>onNavigate(page)}>
        <span className="hub-plate-surface"><span className="hub-plate-content"><TerminalIcon name={page}/><strong>{label}</strong><small>{detail}</small></span></span>
      </button>)}
    </div>
    </HubMotion>
    <button type="button" className="hub-contact" aria-label="与庄方宜对话" onClick={()=>onNavigate('assistant')}><span className="hub-contact-portrait"><img src="/characters/fangyi-avatar.png" width="64" height="64" alt=""/></span><span className="hub-contact-copy"><strong>庄方宜</strong><span>记账、安排提醒，或聊聊今天</span></span><span className="hub-contact-action"><TerminalIcon name="assistant"/><span>对话</span></span></button>
    <p className="hub-reminder-count">{reminderCount} 项待提醒</p>
    {agenda}
    <div className="hub-finance"><div><span>本月支出</span><strong><small>¥</small>{money(expense)}</strong></div><div><span>{budget>0?(remaining<0?'预算超支':'预算剩余'):'记录余额'}</span><strong className={budget>0&&remaining<0?'hub-over-budget':undefined}><small>¥</small>{money(budget>0?Math.abs(remaining):balance)}</strong></div></div>
    <button type="button" className="hub-almanac" aria-label="查看今日黄历" onClick={()=>onNavigate('almanac')}><TerminalIcon name="almanac"/><span>{almanacSummary}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>
    <button type="button" className="hub-almanac hub-notes" aria-label="打开备忘" onClick={()=>onNavigate('notes')}><TerminalIcon name="notes"/><span>备忘</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>
  </section>;
}
