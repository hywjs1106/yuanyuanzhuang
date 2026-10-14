import {useEffect,useRef,useState,type ReactNode} from 'react';
import './startup.css';

/* Original MIT SplashScreen layout, triangle and fill/wipe/fade adaptation.
 * Copyright (c) 2026 球球; terminal-public/licenses/endfield-ui-MIT.txt.
 * Source: github.com/icaruszezen/endfield-ui. No official-image Game assets. */

export function StartupGate({children}:{children:ReactNode}) {
  const [phase,setPhase]=useState<'intro'|'wipe'|'leaving'|'done'>(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?'done':'intro');
  const content=useRef<HTMLDivElement|null>(null);
  const opening=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(phase==='done')return;
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const finish=()=>setPhase('done');
    const reduce=()=>{if(preference.matches)finish();};
    const back=(event:Event)=>{event.preventDefault();finish();};
    const timer=window.setTimeout(()=>setPhase(phase==='intro'?'wipe':phase==='wipe'?'leaving':'done'),phase==='intro'?900:phase==='wipe'?540:200);
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
    {phase!=='done'&&<div ref={opening} tabIndex={-1} className={`startup-screen startup-${phase}`} role="dialog" aria-modal="true" aria-label="日常终端开场" onKeyDown={event=>{if(event.key==='Escape')setPhase('done');if(event.key==='Tab'){event.preventDefault();opening.current?.focus({preventScroll:true});}}}>
      <div className="startup-visual">
        <div className="startup-brand"><svg className="startup-triangles" viewBox="0 0 24 21" aria-hidden="true"><path d="M0 0h11.6L5.8 10zM12.4 0H24l-5.8 10zM6.2 11h11.6L12 21z" fill="currentColor"/></svg><strong className="startup-name"><span>日常</span><span>终端</span></strong></div>
        <div className="startup-foot"><div className="startup-rule" aria-hidden="true"><i/></div><div className="startup-decor" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22"/><path d="M6 12h12M12 6v12"/></svg><span>{Array.from({length:12},(_,i)=><i key={i}/>)}</span></div><p>你的生活，你来安排</p></div>
        {phase!=='intro'&&<div className="startup-wipe-layer" aria-hidden="true"/>}
      </div>
    </div>}
  </>;
}
