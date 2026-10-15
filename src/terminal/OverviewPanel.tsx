import type {TerminalPage} from './BottomNavigation';
import {TerminalIcon} from './TerminalVisuals';
import {LiveClock} from './LiveClock';
import {useEffect,useRef,useState,type ReactNode} from 'react';

export interface OverviewPanelProps {
  date:string;
  onNavigate:(page:TerminalPage)=>void;
}

const modules = [
  {page:'ledger',label:'记账'},
  {page:'reminders',label:'提醒'},
  {page:'weather',label:'天气'},
  {page:'almanac',label:'黄历'},
] as const;

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

export function OverviewPanel({date,onNavigate}:OverviewPanelProps) {
  return <section className="overview-hub" aria-labelledby="overview-hub-title">
    <header className="hub-heading"><h2 id="overview-hub-title">今日总览</h2><div className="hub-heading-meta"><time className="overview-date" dateTime={date}><span>{date.slice(0,4)}</span><strong>{date.slice(5,7)}月{date.slice(8)}日</strong></time><LiveClock/></div></header>
    <HubMotion>
      <div className="hub-map-stage" aria-hidden="true"><div className="hub-map-base"/><div className="hub-map-rim"/><svg className="hub-rim-detail" viewBox="0 0 300 300" aria-hidden="true"><path d="M43 57A132 132 0 0 1 225 39M273 119A132 132 0 0 1 196 273M90 267A132 132 0 0 1 21 127"/><path d="M76 30A139 139 0 0 1 120 13M278 197A139 139 0 0 1 266 219"/></svg></div>
      <img className="hub-ship" src="/branding/dijiang-ship.png" alt="帝江号飞船" width="1536" height="1024" draggable="false"/>
    <div className="hub-modules">
      {modules.map(({page,label})=><button key={page} type="button" className={`hub-plate hub-plate-${page}`} aria-label={`打开${label}`} onClick={()=>onNavigate(page)}>
        <span className="hub-plate-surface"><span className="hub-plate-content"><TerminalIcon name={page}/><strong>{label}</strong></span></span>
      </button>)}
    </div>
    </HubMotion>
  </section>;
}
