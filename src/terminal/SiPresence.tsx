import {useBackLayer} from './useBackLayer';
import {useEffect,useRef,useState} from 'react';

/** A portrait gesture only: no message or assistant action is generated. */
export function SiPresence({busy}:{busy:boolean}){
 const [peek,setPeek]=useState(false);
 const [playing,setPlaying]=useState(false);
 const [reduced,setReduced]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const video=useRef<HTMLVideoElement>(null);
 useEffect(()=>{const pref=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{setReduced(pref.matches);if(pref.matches)setPlaying(false);};pref.addEventListener('change',update);return()=>pref.removeEventListener('change',update);},[]);
 useEffect(()=>{if(!peek)return;const timer=window.setTimeout(()=>{setPeek(false);setPlaying(false);},5000);return()=>window.clearTimeout(timer);},[peek]);
 useEffect(()=>{if(busy){setPeek(false);setPlaying(false);}},[busy]);
 useEffect(()=>{const hide=()=>{if(document.hidden){setPeek(false);setPlaying(false);}};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[]);
 useEffect(()=>{if(playing)void video.current?.play().catch(()=>setPlaying(false));},[playing]);
 const close=()=>{setPeek(false);setPlaying(false);};
 useBackLayer(peek,close);
 return <div className="si-presence-wrap">
  <button type="button" className="fangyi-presence si-presence" disabled={busy} aria-label={peek?'收起祀的随笔画':'和祀打个招呼'} aria-expanded={peek} onClick={()=>{if(peek)close();else{setPeek(true);setPlaying(!reduced);}}}>
   <span className="fangyi-presence-frame"><img className="fangyi-presence-art" src="/themes/si/official/01.png" alt="祀头像" width="104" height="104"/></span>
   <span className="fangyi-presence-hint" aria-hidden="true">{busy?'正在回复':peek?'随手画的':'打个招呼'}</span>
  </button>
  {peek&&<figure className="si-selfportrait" aria-label="祀的随笔画">
   {playing&&!reduced?<video ref={video} muted playsInline preload="auto" poster="/themes/si/official/selfportrait-poster.jpg" src="/themes/si/official/selfportrait.mp4" aria-label="祀的得意小人动图" onEnded={()=>setPlaying(false)} onError={()=>setPlaying(false)}/>:<img src="/themes/si/official/selfportrait-poster.jpg" alt="祀的得意小人画" width="1138" height="640"/>}
   <figcaption>怎么样，我画得不错吧？</figcaption>
  </figure>}
 </div>;
}
