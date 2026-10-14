import React,{useCallback,useEffect,useRef} from 'react';
import {TerminalIcon} from './TerminalVisuals';

export type TerminalPage='today'|'ledger'|'assistant'|'reminders'|'weather'|'almanac'|'notes'|'settings';
const primary=[['today','今日'],['ledger','记账'],['assistant','助手'],['reminders','提醒'],['more','更多']] as const;
const secondary=[['weather','天气','查看天气与预报'],['almanac','黄历','农历与每日宜忌'],['notes','备忘','想法与购物清单'],['settings','设置','连接、预算与备份']] as const;

export function BottomNavigation({currentPage,onNavigate,keyboardOpen=false}:{currentPage:TerminalPage;onNavigate:(page:TerminalPage)=>void;keyboardOpen?:boolean}){
  const dialog=useRef<HTMLDialogElement>(null);const more=useRef<HTMLButtonElement>(null);const [open,setOpen]=React.useState(false);
  const close=useCallback(()=>{dialog.current?.close();setOpen(false);more.current?.focus({preventScroll:true});},[]);
  useEffect(()=>{if(open&&!dialog.current?.open)dialog.current?.showModal();},[open]);
  useEffect(()=>{const back=(event:Event)=>{if(dialog.current?.open){event.preventDefault();close();}};window.addEventListener('terminal-back',back);return()=>window.removeEventListener('terminal-back',back);},[close]);
  useEffect(()=>{if(keyboardOpen&&dialog.current?.open)close();},[keyboardOpen,close]);
  const secondaryActive=secondary.some(([page])=>page===currentPage);
  return <><nav className="bottom-navigation" aria-label="功能导航" hidden={keyboardOpen}>
    {primary.map(([page,label])=>{const active=page==='more'?secondaryActive:currentPage===page;return <button key={page} type="button" ref={page==='more'?more:undefined} className={`bottom-destination ${page==='assistant'?'destination-assistant ':''}${active?'active':''}`} aria-label={label} aria-current={active?'page':undefined} aria-haspopup={page==='more'?'dialog':undefined} aria-expanded={page==='more'?open:undefined} onClick={()=>page==='more'?setOpen(true):onNavigate(page)}><span className="destination-icon"><TerminalIcon name={page}/></span><span>{label}</span></button>;})}
  </nav><dialog ref={dialog} className="more-sheet" aria-label="更多功能" onCancel={event=>{event.preventDefault();close();}} onClose={()=>{setOpen(false);more.current?.focus({preventScroll:true});}} onClick={event=>{if(event.target===event.currentTarget){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}}}>
    <div className="sheet-header"><div><span className="eyebrow">功能模块</span><h2>更多功能</h2></div><button type="button" aria-label="关闭更多功能" onClick={close}><TerminalIcon name="close"/></button></div>
    <div className="more-grid">{secondary.map(([page,label,description])=><button type="button" key={page} aria-label={label} aria-current={currentPage===page?'page':undefined} onClick={()=>{close();onNavigate(page);}}><TerminalIcon name={page}/><span><strong>{label}</strong><small>{description}</small></span><span className="module-arrow" aria-hidden="true">↗</span></button>)}</div>
    <p className="sheet-footnote">日常终端 · 本地保存</p>
  </dialog></>;
}
