import {useEffect,useRef,useState,type ReactNode} from 'react';
import './startup.css';

/* MIT SplashScreen lifecycle adaptation; whole-mark television ghosting.
 * Copyright (c) 2026 球球; terminal-public/licenses/endfield-ui-MIT.txt.
 * Source: github.com/icaruszezen/endfield-ui. Game artwork attribution: terminal-public/branding/SOURCES.txt. */

export function StartupGate({children}:{children:ReactNode}) {
  const [phase,setPhase]=useState<'intro'|'leaving'|'done'>(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?'done':'intro');
  const content=useRef<HTMLDivElement|null>(null);
  const opening=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(phase==='done')return;
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const finish=()=>setPhase('done');
    const reduce=()=>{if(preference.matches)finish();};
    const back=(event:Event)=>{event.preventDefault();finish();};
    const timer=window.setTimeout(()=>setPhase(phase==='intro'?'leaving':'done'),phase==='intro'?1450:190);
    preference.addEventListener('change',reduce);window.addEventListener('terminal-back',back);
    if(phase==='intro')opening.current?.focus({preventScroll:true});
    return()=>{clearTimeout(timer);preference.removeEventListener('change',reduce);window.removeEventListener('terminal-back',back);};
  },[phase]);
  useEffect(()=>{
    if(phase!=='done')return;
    const title=content.current?.querySelector<HTMLElement>('h1,h2');
    const target=title??content.current;
    if(target){target.tabIndex=-1;target.classList.add('startup-focus-target');target.focus({preventScroll:true});}
  },[phase]);
  return <>
    <div ref={node=>{content.current=node;if(node)node.inert=phase!=='done';}} aria-hidden={phase!=='done'||undefined}>{children}</div>
    {phase!=='done'&&<div ref={opening} tabIndex={-1} className={`startup-screen startup-${phase}`} role="dialog" aria-modal="true" aria-label="帝江号开场" onKeyDown={event=>{if(event.key==='Escape')setPhase('done');if(event.key==='Tab'){event.preventDefault();opening.current?.focus({preventScroll:true});}}}>
      <div className="startup-visual">
        <div className="startup-brand"><img className="startup-emblem" src="/branding/endfield-lockup-dark.png" width="594" height="512" alt="终末地工业完整徽标"/><svg className="startup-emblem-frame" viewBox="0 0 594 512" aria-hidden="true"><path d="M32 20H562L297 492Z"/><path d="M28 16h14M552 16h14M294 487l3 5 3-5"/></svg><strong className="startup-name">帝江号</strong><span className="startup-subtitle">O.M.V. DIJIANG</span></div>

      </div>
    </div>}
  </>;
}
