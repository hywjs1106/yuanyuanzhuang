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

/* Decorative framing adapted from the supplied in-game ship menu. */
function HubSceneFrame() {
  return <>
    <svg className="hub-panel-links" viewBox="0 0 360 600" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M54 100V146H96L124 174M306 100V146H264L236 174M54 500V454H96L124 426M306 500V454H264L236 426"/>
      <path className="hub-link-echo" d="M60 100V140H98L126 168M300 100V140H262L234 168M60 500V460H98L126 432M300 500V460H262L234 432"/>
    </svg>
    <div className="hub-map-stage" aria-hidden="true">
      <svg className="hub-scene-frame" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
        <circle className="hub-frame-guide" cx="200" cy="200" r="188"/>
        <g className="hub-frame-segments"><path d="M70 70A184 184 0 0 1 292 40M344 84A184 184 0 0 1 377 249M317 342A184 184 0 0 1 100 355M48 304A184 184 0 0 1 18 174"/></g>
        <circle className="hub-frame-inner" cx="200" cy="200" r="169"/>
        <g className="hub-frame-ticks">{Array.from({length:48},(_,i)=><path key={i} d={i%4===0?'M200 31V41':'M200 32V36'} transform={`rotate(${i*7.5} 200 200)`} opacity={i%4===0?'.8':'.35'}/>)}</g>
        <g className="hub-frame-index"><path d="M177 8 191 24 170 28ZM382 274 398 264 396 285Z"/><path d="M132 24A188 188 0 0 1 160 16M379 262A188 188 0 0 1 364 291"/></g>
        <g className="hub-frame-crosshair"><path d="M65 103H81M73 95V111M318 299H334M326 291V307M195 15H205M200 10V20"/></g>
        <g className="hub-frame-sector"><path d="M66 227A136 136 0 0 1 85 126M313 125A136 136 0 0 1 332 232M136 321A136 136 0 0 0 264 321"/></g>
      </svg>
    </div>
    <span className="hub-vessel-name" aria-hidden="true"><span>O.M.V.</span><strong>帝江号</strong></span>
  </>;
}

export function OverviewPanel({date,onNavigate}:OverviewPanelProps) {
  return <section className="overview-hub" aria-labelledby="overview-hub-title">
    <header className="hub-heading"><h2 id="overview-hub-title">今日总览</h2><div className="hub-heading-meta"><time className="overview-date" dateTime={date}><span>{date.slice(0,4)}</span><strong>{date.slice(5,7)}月{date.slice(8)}日</strong></time><LiveClock/></div></header>
    <HubMotion>
      <HubSceneFrame/>
      <img className="hub-ship" src="/branding/dijiang-ship.png" alt="帝江号飞船" width="1536" height="1024" draggable="false"/>
    <div className="hub-modules">
      {modules.map(({page,label})=><button key={page} type="button" className={`hub-plate hub-plate-${page}`} aria-label={`打开${label}`} onClick={()=>onNavigate(page)}>
        <span className="hub-plate-surface"><span className="hub-plate-content"><TerminalIcon name={page}/><strong>{label}</strong></span></span>
      </button>)}
    </div>
    </HubMotion>
  </section>;
}
