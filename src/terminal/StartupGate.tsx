import {useEffect,useRef,useState,type ReactNode} from 'react';
import './startup.css';

export function StartupGate({children}:{children:ReactNode}) {
  const [phase,setPhase]=useState<'intro'|'leaving'|'done'>(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?'done':'intro');
  const content=useRef<HTMLDivElement|null>(null);
  const skip=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    if(phase==='done')return;
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const finish=()=>setPhase('done');
    const reduce=()=>{if(preference.matches)finish();};
    const back=(event:Event)=>{event.preventDefault();finish();};
    const timer=window.setTimeout(()=>setPhase(phase==='intro'?'leaving':'done'),phase==='intro'?1050:170);
    preference.addEventListener('change',reduce);window.addEventListener('terminal-back',back);
    if(phase==='intro')skip.current?.focus({preventScroll:true});
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
    {phase!=='done'&&<div className={`startup-screen startup-${phase}`} role="dialog" aria-modal="true" aria-label="日常终端开场" onKeyDown={event=>{if(event.key==='Escape')setPhase('done');if(event.key==='Tab'){event.preventDefault();skip.current?.focus({preventScroll:true});}}}>
      <button ref={skip} type="button" className="startup-skip" onClick={()=>setPhase('done')}>跳过开场</button>
      <div className="startup-brand"><svg className="startup-mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M4 3h24v7H11v5h13v7H11v7H4zM25 25h3v4h-3z" fill="currentColor"/></svg><strong className="startup-name">日常终端</strong><p>你的生活，你来安排</p><div className="startup-rule" aria-hidden="true"/></div>
      <div className="startup-sweep" aria-hidden="true"/>
    </div>}
  </>;
}
