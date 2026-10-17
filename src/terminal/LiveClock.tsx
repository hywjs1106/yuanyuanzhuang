import {useEffect,useState} from 'react';

/** A foreground display clock. Reminder delivery remains the native scheduler's job. */
export function LiveClock({variant='readout'}:{variant?:'readout'|'dial'}){
  const [{now,previous},setClock]=useState(()=>{const date=new Date();return {now:date,previous:date};});
  useEffect(()=>{
    let timer:ReturnType<typeof setTimeout>|undefined;
    const tick=()=>{const date=new Date();setClock(state=>({now:date,previous:state.now}));timer=setTimeout(tick,1000-Date.now()%1000);};
    const resume=()=>{clearTimeout(timer);if(!document.hidden)tick();};
    resume();document.addEventListener('visibilitychange',resume);window.addEventListener('focus',resume);
    return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',resume);window.removeEventListener('focus',resume);};
  },[]);
  const pad=(value:number)=>String(value).padStart(2,'0');
  const time=`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const digits=`${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const previousDigits=`${pad(previous.getHours())}${pad(previous.getMinutes())}${pad(previous.getSeconds())}`;
  const renderDigits=(start:number,end:number)=>digits.slice(start,end).split('').map((digit,i)=><span className="clock-digit" key={start+i}><span key={digit} className={`clock-digit-value${digit!==previousDigits[start+i]?' clock-digit-changing':''}`}>{digit}</span></span>);
  if(variant==='readout')return <time className="hub-clock-readout" dateTime={now.toISOString()} aria-label={`当前时间 ${time}`}><span aria-hidden="true">{renderDigits(0,2)}<span className="clock-colon">:</span>{renderDigits(2,4)}</span><small className="clock-second-value" aria-hidden="true"><span className="clock-colon">:</span>{renderDigits(4,6)}</small></time>;
  return <div className="hub-clock">
    <svg className="hub-clock-dial" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="97"/>
      {Array.from({length:60},(_,i)=><path key={i} d={`M100 7v${i%5===0?9:4}`} transform={`rotate(${i*6} 100 100)`} className={i%5===0?'clock-major-tick':undefined}/>)}
    </svg>
    <div className="hub-clock-hand" aria-hidden="true" style={{transform:`rotate(${now.getSeconds()*6}deg)`}}><i/></div>
  </div>;
}
