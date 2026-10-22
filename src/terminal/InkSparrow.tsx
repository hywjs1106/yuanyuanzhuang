import {useEffect,useRef,useState} from 'react';

/** Original transparent ink mascot; two poses animate without a video decoder. */
export function InkSparrow(){
 const host=useRef<HTMLButtonElement>(null),timer=useRef<ReturnType<typeof setTimeout>>();
 const loaded=useRef(new Set<string>());const [posesReady,setPosesReady]=useState(false);
 const poseLoaded=(name:string)=>{loaded.current.add(name);setPosesReady(loaded.current.size===2);};
 const [allowed,setAllowed]=useState(false),[hovered,setHovered]=useState(false),[greeting,setGreeting]=useState(false);
 useEffect(()=>{
  const element=host.current;if(!element)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),startup=element.closest('[data-startup-stage]');let visible=false;
  const update=()=>{
   const active=visible&&!document.hidden&&!reduced.matches&&(!startup||startup.getAttribute('data-startup-stage')==='done');setAllowed(active);
   if(!active){setHovered(false);setGreeting(false);clearTimeout(timer.current);}
  };
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();});observer.observe(element);
  const opening=new MutationObserver(update);if(startup)opening.observe(startup,{attributes:true,attributeFilter:['data-startup-stage']});
  document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);
  return()=>{clearTimeout(timer.current);observer.disconnect();opening.disconnect();document.removeEventListener('visibilitychange',update);reduced.removeEventListener('change',update);};
 },[]);
 const greet=()=>{if(!allowed)return;clearTimeout(timer.current);setGreeting(true);timer.current=setTimeout(()=>setGreeting(false),1520);};
 return <span className="si-heading-companion"><button ref={host} type="button" className="si-heading-greeting ink-sparrow" aria-label="让小团雀动一动" data-animating={allowed&&posesReady&&(hovered||greeting)} onPointerEnter={event=>{if(event.pointerType==='mouse')setHovered(true);}} onPointerLeave={()=>setHovered(false)} onClick={greet}>
  <span className="ink-sparrow-poses" aria-hidden="true"><img className="ink-sparrow-image ink-sparrow-rest" src="/themes/si/ink-sparrow-rest.png" onLoad={()=>poseLoaded("rest")} alt="" width="1300" height="1200" draggable="false"/><img className="ink-sparrow-image ink-sparrow-flutter" src="/themes/si/ink-sparrow-flutter.png" onLoad={()=>poseLoaded("flutter")} alt="" width="1300" height="1200" draggable="false"/></span>
 </button></span>;
}
