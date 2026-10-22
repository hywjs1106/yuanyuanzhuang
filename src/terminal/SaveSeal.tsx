import {useEffect,useRef} from 'react';

/** Mount only after a confirmed write. Motion never determines saved state. */
export function SaveSeal({animate=true}:{animate?:boolean}){
 const seal=useRef<HTMLSpanElement>(null);const stroke=useRef<SVGPathElement>(null);
 useEffect(()=>{
  const node=seal.current;const line=stroke.current;
  if(!animate||!node||!line||typeof node.animate!=='function')return;
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(preference.matches||document.hidden)return;
  const end=getComputedStyle(node).transform;
  const motions=[node.animate([{transform:'translateY(-3px) rotate(-7deg) scale(1.1)',opacity:.6},{transform:end,opacity:1}],{id:'chat-save-seal',duration:340,easing:'cubic-bezier(.16,1,.3,1)'}),line.animate([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{id:'chat-save-stroke',duration:240,delay:100,fill:'backwards',easing:'ease-out'})];
  const cancel=()=>motions.forEach(animation=>animation.cancel());
  const reduce=()=>{if(preference.matches)cancel();};const hidden=()=>{if(document.hidden)cancel();};
  preference.addEventListener('change',reduce);document.addEventListener('visibilitychange',hidden);
  return()=>{cancel();preference.removeEventListener('change',reduce);document.removeEventListener('visibilitychange',hidden);};
 },[animate]);
 return <span ref={seal} className="tag proposal-saved-seal" role="status">已保存<svg viewBox="0 0 80 10" aria-hidden="true" fill="none"><path ref={stroke} d="M3 7Q23 3 43 6T77 4" pathLength="1"/></svg></span>;
}
