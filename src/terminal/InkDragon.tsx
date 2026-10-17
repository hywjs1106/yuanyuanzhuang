import {useId,useState,type CSSProperties} from 'react';
import './ink-dragon.css';

type DragonKind='ledger'|'reminders'|'weather'|'almanac'|'opening';
// Eye interiors in the original square artwork's 1280-unit display coordinates.
const eyes:Record<DragonKind,readonly (readonly [number,number,number,number])[]>={
 ledger:[[559,373,58,64],[724,366,73,69]],
 reminders:[[587,348,53,61],[746,370,71,67]],
 weather:[[538,483,50,54],[664,530,54,56]],
 almanac:[[564,386,58,61],[722,439,69,64]],
 opening:[[595,350,61,63],[760,382,71,67]],
};
const delays:Record<DragonKind,string>={ledger:'0s',reminders:'1.2s',weather:'2.4s',almanac:'3.5s',opening:'.12s'};

export function InkDragon({kind,className='',alt=''}:{kind:DragonKind;className?:string;alt?:string}){
 const id=useId().replace(/:/g,'');const [ready,setReady]=useState(false);
 const src=kind==='opening'?'/themes/si/ink-dragon-opening.png':`/themes/si/dragons/${kind}.png`;
 return <span className={`ink-dragon${kind==='opening'?' ink-dragon-opening':''} ${className}`} style={{'--eye-delay':delays[kind]} as CSSProperties}>
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
