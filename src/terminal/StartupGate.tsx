import {useEffect,useRef,useState,type ReactNode} from 'react';
import './startup.css';
import {useLiveQuery} from 'dexie-react-hooks';
import {terminalDb} from './data';

/* MIT SplashScreen lifecycle adaptation; whole-mark television ghosting.
 * Copyright (c) 2026 球球; terminal-public/licenses/endfield-ui-MIT.txt.
 * Source: github.com/icaruszezen/endfield-ui. Game artwork attribution: terminal-public/branding/SOURCES.txt. */

export function StartupGate({children}:{children:ReactNode}) {
  const settings=useLiveQuery(async()=>{
    try {const saved=await terminalDb.settings.get('main');return {visualTheme:saved?.visualTheme??'fangyi',theme:saved?.theme??'light'};}
    catch {return {visualTheme:'fangyi',theme:'light'};}
  },[]);
  const visualTheme=settings?.visualTheme;
  const editionResolved=visualTheme!==undefined;
  const brandName=visualTheme==='si'?'缘缘庄':'帝江号';
  const [phase,setPhase]=useState<'intro'|'leaving'|'done'>(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?'done':'intro');
  const content=useRef<HTMLDivElement|null>(null);
  const opening=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(phase==='done')return;
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const finish=()=>setPhase('done');
    const reduce=()=>{if(preference.matches)finish();};
    const back=(event:Event)=>{event.preventDefault();finish();};
    const timer=editionResolved?window.setTimeout(()=>setPhase(phase==='intro'?'leaving':'done'),phase==='intro'?1450:190):undefined;
    preference.addEventListener('change',reduce);window.addEventListener('terminal-back',back);
    reduce();
    if(phase==='intro')opening.current?.focus({preventScroll:true});
    return()=>{clearTimeout(timer);preference.removeEventListener('change',reduce);window.removeEventListener('terminal-back',back);};
  },[phase,editionResolved]);
  useEffect(()=>{
    if(phase!=='done')return;
    const title=content.current?.querySelector<HTMLElement>('h1,h2');
    const target=title??content.current;
    if(target){target.tabIndex=-1;target.classList.add('startup-focus-target');target.focus({preventScroll:true});}
  },[phase]);
  return <>
    <div ref={node=>{content.current=node;if(node)node.inert=phase!=='done';}} aria-hidden={phase!=='done'||undefined}>{children}</div>
    {phase!=='done'&&<div ref={opening} tabIndex={-1} className={`startup-screen startup-${phase} startup-${visualTheme??'pending'}${settings?.theme==='dark'?' startup-dark':''}`} role="dialog" aria-modal="true" aria-label={editionResolved?`${brandName}开场`:'正在打开应用'} onKeyDown={event=>{if(event.key==='Escape')setPhase('done');if(event.key==='Tab'){event.preventDefault();opening.current?.focus({preventScroll:true});}}}>
      <div className="startup-visual">
        {visualTheme==='si'?<>
          <div className="startup-ink-landscape" aria-hidden="true"><img src="/themes/si/painted-mountains.png" alt="" width="1024" height="1536"/></div>
          <div className="startup-brand startup-inn-brand">
            <div className="startup-inn-art"><img className="startup-inn" src="/themes/si/ink-dragon-opening.png" width="1280" height="1280" alt="缘缘庄水墨小龙" onError={event=>{event.currentTarget.style.visibility='hidden';}}/></div>
            <div className="startup-inn-signature"><strong className="startup-name">缘缘庄</strong><span className="startup-inn-seal" aria-hidden="true">缘</span></div>
          </div>
        </>:visualTheme==='fangyi'?<div className="startup-brand"><img className="startup-emblem" src="/branding/endfield-lockup-dark.png" width="594" height="512" alt="终末地工业完整徽标"/><svg className="startup-emblem-frame" viewBox="0 0 594 512" aria-hidden="true"><path d="M32 20H562L297 492Z"/><path d="M28 16h14M552 16h14M294 487l3 5 3-5"/></svg><strong className="startup-name">{brandName}</strong><span className="startup-subtitle">O.M.V. DIJIANG</span></div>:null}

      </div>
    </div>}
  </>;
}
