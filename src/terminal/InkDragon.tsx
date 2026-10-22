import {useEffect,useId,useRef,useState,type CSSProperties} from 'react';

type DragonKind='ledger'|'reminders'|'weather'|'almanac'|'opening';
// Eye interiors in the original square artwork's 1280-unit display coordinates.
const eyes:Record<DragonKind,readonly (readonly [number,number,number,number])[]>={
 ledger:[[559,373,58,64],[724,366,73,69]],
 reminders:[[587,348,53,61],[746,370,71,67]],
 weather:[[538,483,50,54],[664,530,54,56]],
 almanac:[[564,386,58,61],[722,439,69,64]],
 opening:[[595,350,61,63],[760,382,71,67]],
};
const delays:Record<DragonKind,string>={ledger:'0s',reminders:'.7s',weather:'1.4s',almanac:'2.1s',opening:'.12s'};

const glance:Record<DragonKind,readonly [number,number,number]>={ledger:[6,23,-8],reminders:[7,-20,9],weather:[5.5,18,16],almanac:[6.5,-22,-9],opening:[12,18,-6]};

export function InkDragon({kind,className='',alt=''}:{kind:DragonKind;className?:string;alt?:string}){
 const id=useId().replace(/:/g,'');const [ready,setReady]=useState(false);
 const host=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const node=host.current;const button=node?.closest('.hub-plate');if(!node||!button)return;
  const reset=()=>{delete node.dataset.looking;};
  const look=(event:Event)=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.hidden)return;const point=event as PointerEvent;const box=node.getBoundingClientRect();const center=eyes[kind].reduce((sum,[x,y])=>[sum[0]+x/eyes[kind].length,sum[1]+y/eyes[kind].length],[0,0]);node.style.setProperty('--look-x',`${Math.max(-23,Math.min(23,((point.clientX-box.left)/box.width-center[0]/1280)*60))}px`);node.style.setProperty('--look-y',`${Math.max(-27,Math.min(27,((point.clientY-box.top)/box.height-center[1]/1280)*60))}px`);node.dataset.looking='true';};
  button.addEventListener('pointerdown',look);window.addEventListener('pointerup',reset);window.addEventListener('pointercancel',reset);window.addEventListener('blur',reset);document.addEventListener('visibilitychange',reset);
  return()=>{button.removeEventListener('pointerdown',look);window.removeEventListener('pointerup',reset);window.removeEventListener('pointercancel',reset);window.removeEventListener('blur',reset);document.removeEventListener('visibilitychange',reset);};
 },[]);
 const src=kind==='opening'?'/themes/si/ink-dragon-opening.webp':`/themes/si/dragons/${kind}.png`;
 return <span ref={host} className={`ink-dragon${kind==='opening'?' ink-dragon-opening':''} ${className}`} style={{'--eye-delay':delays[kind],'--eye-period':`${glance[kind][0]}s`,'--glance-x':`${glance[kind][1]}px`,'--glance-y':`${glance[kind][2]}px`} as CSSProperties}>
  <img className={kind==='opening'?'startup-inn':undefined} src={src} alt={alt} width="1280" height="1280" draggable="false" onLoad={()=>setReady(true)} onError={event=>{setReady(false);event.currentTarget.style.visibility='hidden';}}/>
  {ready&&<svg className="ink-dragon-eyes" viewBox="0 0 1280 1280" aria-hidden="true" focusable="false">
   <defs>{eyes[kind].map(([x,y,rx,ry],i)=><clipPath id={`${id}-eye-${i}`} key={i}><ellipse cx={x} cy={y} rx={rx} ry={ry}/></clipPath>)}</defs>
   {eyes[kind].map(([x,y,rx,ry],i)=><g key={i} clipPath={`url(#${id}-eye-${i})`}>
    <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fbf7ec"/>
    <g transform={`translate(${x} ${y}) scale(${rx/60} ${ry/65})`}><ellipse className="ink-dragon-pupil" cx="0" cy="0" rx="20" ry="23" fill="#252622"/></g>
   </g>)}
  </svg>}
 </span>;
}
