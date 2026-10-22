import {useCallback,useEffect,useRef,useState,type RefObject} from 'react';
import {renderDoodlePaper,renderDoodlePoster} from './doodlePaperRenderer';
export type DoodleKind='si'|'endmin-male'|'endmin-female'|'minghe'|'perlica'|'arcane';

// One owner per visible scene: inactive figures never mount a video decoder.
export function useDoodlePlayback(host:RefObject<HTMLElement>,count:number){
 const [active,setActive]=useState<number|null>(null);
 const allowed=useRef(false),started=useRef(false),next=useRef<number|null>(null);
 const finish=useCallback(()=>{
  const upcoming=next.current;
  if(!allowed.current||upcoming===null||upcoming>=count){next.current=null;setActive(null);return;}
  next.current=upcoming+1;setActive(upcoming);
 },[count]);
 useEffect(()=>{
  const element=host.current;if(!element)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const startup=element.closest('[data-startup-stage]');let visible=false;
  const update=()=>{
   allowed.current=visible&&!document.hidden&&!reduced.matches&&(!startup||startup.getAttribute('data-startup-stage')==='done');
   if(!allowed.current){setActive(null);next.current=null;}
   else if(!started.current){started.current=true;next.current=1;setActive(0);}
  };
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();});observer.observe(element);
  const opening=new MutationObserver(update);if(startup)opening.observe(startup,{attributes:true,attributeFilter:['data-startup-stage']});
  document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);
  return()=>{allowed.current=false;observer.disconnect();opening.disconnect();document.removeEventListener('visibilitychange',update);reduced.removeEventListener('change',update);};
 },[host]);
 useEffect(()=>{if(active===null)return;const timeout=setTimeout(finish,2400);return()=>clearTimeout(timeout);},[active,finish]);
 const request=useCallback((index:number)=>{if(allowed.current){next.current=null;setActive(index);}},[]);
 return {active,finish,request};
}
export function SiDoodle({kind,playing=false,onFinish}:{kind:DoodleKind;playing?:boolean;onFinish?:()=>void}){
 const video=useRef<HTMLVideoElement>(null),poster=useRef<HTMLImageElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const [ready,setReady]=useState(false),[renderError,setRenderError]=useState(false);
 const frame=useRef(0),inFlight=useRef(false),scratch=useRef<HTMLCanvasElement|null>(null);
 useEffect(()=>()=>{frame.current++;},[]);
 const draw=useCallback(async(source:CanvasImageSource,posterKey?:string)=>{
  const output=canvas.current;if(!output)return;const version=++frame.current;
  try{
   const width=output.width,height=output.height;
   const render=()=>{
    const buffer=scratch.current??(scratch.current=document.createElement('canvas'));
    if(buffer.width!==width)buffer.width=width;if(buffer.height!==height)buffer.height=height;
    const context=buffer.getContext('2d',{willReadFrequently:true});if(!context)throw new Error('Canvas unavailable');
    context.clearRect(0,0,width,height);context.drawImage(source,0,0,width,height);
    return renderDoodlePaper(context.getImageData(0,0,width,height).data,width,height);
   };
   const pixels=await (posterKey?renderDoodlePoster(`${posterKey}:${width}x${height}`,render):render());
   if(version!==frame.current||!canvas.current)return;
   output.getContext('2d')?.putImageData(new ImageData(pixels,width,height),0,0);setReady(true);setRenderError(false);
  }catch{if(version===frame.current)setRenderError(true);}
 },[]);
 useEffect(()=>{
  if(!playing){if(poster.current?.complete&&poster.current.naturalWidth)void draw(poster.current,kind);return;}
  const node=video.current;if(!node)return;
  let disposed=false,lastTime=-1;
  node.src=`/themes/si/doodles/${kind}.mp4`;void node.play().catch(()=>{if(!disposed)onFinish?.();});
  // Small bounded canvas, sampled only for the single active clip. Static figures do no frame work.
  const timer=setInterval(()=>{if(!inFlight.current&&node.readyState>=2&&node.currentTime!==lastTime){lastTime=node.currentTime;inFlight.current=true;void draw(node).finally(()=>{inFlight.current=false;});}},80);
  return()=>{disposed=true;frame.current++;clearInterval(timer);node.pause();node.removeAttribute('src');node.load();};
 },[playing,kind,onFinish,draw]);
 return <span className="si-doodle" data-doodle={kind} data-cutout={ready} data-render-error={renderError} aria-hidden="true">
  <img ref={poster} src={`/themes/si/doodles/${kind}.jpg`} onLoad={event=>void draw(event.currentTarget,kind)} alt="" draggable="false" width="1138" height="640"/>
  <canvas ref={canvas} width="384" height="216"/>
  {playing&&<video ref={video} src={`/themes/si/doodles/${kind}.mp4`} muted playsInline preload="auto" onEnded={onFinish} onError={onFinish}/>}
 </span>;
}
export function SiSceneDoodle({kind}:{kind:DoodleKind}){
 const host=useRef<HTMLSpanElement>(null);const playback=useDoodlePlayback(host,1);
 return <span ref={host} className="si-scene-doodle"><SiDoodle kind={kind} playing={playback.active===0} onFinish={playback.finish}/></span>;
}
