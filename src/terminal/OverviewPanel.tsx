import type {TerminalPage} from './BottomNavigation';
import {TerminalIcon} from './TerminalVisuals';
import {LiveClock} from './LiveClock';
import type {ReactNode} from 'react';

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

/* Original abstract terrain: ornamental geometry, never a location or live map. */
function HubTerrain() {
  const contour='M-18 72C20 32 42 79 67 54S85 13 127 22S155 72 188 47S255 15 289 49S299 120 275 149S218 140 202 176S213 221 175 242S115 211 87 242S18 248 13 213S42 171 12 142S-30 114-18 72Z';
  return <svg className="hub-terrain" viewBox="0 0 280 280" aria-hidden="true" focusable="false">
    <circle cx="140" cy="140" r="140" className="hub-map-ground"/>
    <g className="hub-topographic-lines" fill="none">
      {[1,.90,.80,.70,.60,.50].map((scale,i)=><path key={scale} d={contour} transform={`translate(${140*(1-scale)} ${140*(1-scale)}) scale(${scale})`} strokeWidth={i%2===0?1.1:.65}/>)}
      <path d="M-6 211C42 184 68 212 80 188S91 145 125 158S158 213 197 196S240 167 283 180M-5 220C42 196 64 224 87 198S89 163 122 170S160 229 202 209S247 183 290 193M-2 230C47 210 66 239 97 211S96 179 122 184S163 245 214 220S255 199 290 207"/>
    </g>
    <path className="hub-terrain-side" d="m70 62 33-10 22 22 32-8 27 18-4 33 23 18-11 23-30 7-11 29-31-8-20 19-30-20-5-32-23-17 13-29-5-24Z" transform="translate(0 9)"/>
    <path className="hub-terrain-land" d="m70 62 33-10 22 22 32-8 27 18-4 33 23 18-11 23-30 7-11 29-31-8-20 19-30-20-5-32-23-17 13-29-5-24Z"/>
    <g className="hub-land-contours" fill="none"><path d="m77 74 24-10 23 24 33-7 14 13-6 27 23 17-6 10-28 8-11 25-25-10-21 17-16-12-6-32-19-15 13-25Z"/><path d="m84 84 17-6 23 25 31-6 5 25 12 16-27 10-8 20-21-12-19 14-9-27-16-12 11-22Z"/><path d="m91 94 11-3 19 24 28-4 2 16-15 13-5 13-20-10-12 9-9-18-10-6 13-14Z"/></g>
    <path className="hub-map-lowland" d="m112 221 18-17 22 12 21-8 23 12 25-15 30 15 7 27-24 21-39-2-19 17-27-4-17-16-33 2-16-22Z"/>
    <g className="hub-map-buildings"><path d="M207 76h21v13h-21zM213 93h12v20h-12zM232 81h13v27h-13zM46 173h17v23H46zM33 178h8v12h-8z"/><path d="M222 116v31h21M46 203v17h38" fill="none"/></g>
    <path className="hub-map-route" d="m88 61 15 23 21 11 18 25 14 29 20 10" fill="none"/>
  </svg>;
}

const modules = [
  {page:'ledger',label:'记账',detail:'记一笔账'},
  {page:'reminders',label:'提醒',detail:'查看安排'},
  {page:'weather',label:'天气',detail:'天气预报'},
  {page:'almanac',label:'黄历',detail:'每日宜忌'},
] as const;
const money=(amount:number)=>amount.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});

export function OverviewPanel({date,reminderCount,expense,balance,budget,almanacSummary,onNavigate,agenda}:OverviewPanelProps) {
  const remaining=budget-expense;
  return <section className="overview-hub" aria-labelledby="overview-hub-title">
    <header className="hub-heading"><h2 id="overview-hub-title">今日总览</h2><div className="hub-heading-meta"><time className="overview-date" dateTime={date}><span>{date.slice(0,4)}</span><strong>{date.slice(5,7)}月{date.slice(8)}日</strong></time><LiveClock/></div></header>
    <div className="hub-orbit">
      <div className="hub-map-stage" aria-hidden="true"><div className="hub-map-base"/><div className="hub-map-rim"><HubTerrain/></div><svg className="hub-rim-detail" viewBox="0 0 300 300" aria-hidden="true"><path d="M43 57A132 132 0 0 1 225 39M273 119A132 132 0 0 1 196 273M90 267A132 132 0 0 1 21 127"/><path d="M76 30A139 139 0 0 1 120 13M278 197A139 139 0 0 1 266 219"/></svg></div>
      <LiveClock variant="dial"/>
    <div className="hub-modules">
      {modules.map(({page,label,detail})=><button key={page} type="button" className={`hub-plate hub-plate-${page}`} aria-label={`打开${label}`} onClick={()=>onNavigate(page)}>
        <span className="hub-plate-content"><TerminalIcon name={page}/><strong>{label}</strong><small>{detail}</small></span>
      </button>)}
    </div>
    </div>
    <button type="button" className="hub-contact" aria-label="与庄方宜对话" onClick={()=>onNavigate('assistant')}><span className="hub-contact-portrait"><img src="/characters/fangyi-avatar.png" width="64" height="64" alt=""/></span><span className="hub-contact-copy"><strong>庄方宜</strong><span>记账、安排提醒，或聊聊今天</span></span><TerminalIcon name="assistant"/></button>
    <p className="hub-reminder-count">{reminderCount} 项待提醒</p>
    {agenda}
    <div className="hub-finance"><div><span>本月支出</span><strong><small>¥</small>{money(expense)}</strong></div><div><span>{budget>0?(remaining<0?'预算超支':'预算剩余'):'记录余额'}</span><strong className={budget>0&&remaining<0?'hub-over-budget':undefined}><small>¥</small>{money(budget>0?Math.abs(remaining):balance)}</strong></div></div>
    <button type="button" className="hub-almanac" aria-label="查看今日黄历" onClick={()=>onNavigate('almanac')}><TerminalIcon name="almanac"/><span>{almanacSummary}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>
  </section>;
}
