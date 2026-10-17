import type {CSSProperties} from 'react';
import {TerminalIcon} from './TerminalVisuals';
import {PaperIcon} from './PaperIcon';

export type TerminalPage='today'|'ledger'|'assistant'|'reminders'|'weather'|'almanac'|'notes'|'settings';
const primary=[['today','今日'],['assistant','助手'],['settings','设置']] as const;

export function BottomNavigation({currentPage,onNavigate,keyboardOpen=false,visualTheme}:{currentPage:TerminalPage;onNavigate:(page:TerminalPage)=>void;keyboardOpen?:boolean;visualTheme?:string}){
  const activePage=currentPage==='assistant'||currentPage==='settings'?currentPage:'today';
  const activeIndex=primary.findIndex(([page])=>page===activePage);
  return <nav className="bottom-navigation" aria-label="功能导航" hidden={keyboardOpen} style={{'--active-index':activeIndex} as CSSProperties}>
    <span className="navigation-marker" aria-hidden="true"/>
    {primary.map(([page,label])=><button key={page} type="button" className={`bottom-destination ${page==='assistant'?'destination-assistant ':''}${activePage===page?'active':''}`} aria-label={label} aria-current={activePage===page?(currentPage===page?'page':'location'):undefined} onClick={()=>onNavigate(page)}><span className="destination-icon">{visualTheme==='si'?<PaperIcon kind={page}/>:<TerminalIcon name={page}/>}</span><span>{label}</span></button>)}
  </nav>;
}
