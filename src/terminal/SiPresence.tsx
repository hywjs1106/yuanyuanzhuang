import {useEffect,useState} from 'react';

/** A local portrait gesture; never writes or impersonates a chat message. */
export function SiPresence({busy}:{busy:boolean}){
  const [peek,setPeek]=useState(false);
  useEffect(()=>{if(!peek)return;const timer=window.setTimeout(()=>setPeek(false),5000);return()=>window.clearTimeout(timer);},[peek]);
  useEffect(()=>{if(busy)setPeek(false);},[busy]);
  useEffect(()=>{const hide=()=>{if(document.hidden)setPeek(false);};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[]);
  return <button type="button" className="fangyi-presence si-presence" disabled={busy} aria-label={peek?'收起墨魉':'和祀打个招呼'} aria-pressed={peek} onClick={()=>setPeek(value=>!value)}>
    <span className="fangyi-presence-frame"><img className="fangyi-presence-art" src={peek?'/characters/ink-spirit-number-one.png':'/themes/si/chibi-avatar.png'} alt={peek?'墨魉探头':'祀头像'} width="104" height="104"/></span>
    <span className="fangyi-presence-hint" aria-hidden="true">{busy?'正在回复':peek?'墨魉探头':'打个招呼'}</span>
  </button>;
}
