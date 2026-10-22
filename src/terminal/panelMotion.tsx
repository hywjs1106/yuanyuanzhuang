import {useEffect,useLayoutEffect,useRef,useState,type RefObject,type ReactNode} from 'react';
const ease='cubic-bezier(.16,1,.3,1)';
// Several folds share a page; the last one releases the temporary anchoring policy.
const anchors=new WeakMap<HTMLElement,{count:number;value:string}>();
function holdScrollAnchor(parent:HTMLElement){
 let state=anchors.get(parent);if(!state){state={count:0,value:parent.style.overflowAnchor};anchors.set(parent,state);parent.style.overflowAnchor='none';}state.count++;
 let released=false;return()=>{if(released)return;released=true;if(--state!.count===0){parent.style.overflowAnchor=state!.value;anchors.delete(parent);}};
}

/** One live subtree. Closing changes semantics immediately; only its inert painting remains. */
export function useDisclosureMotion(open:boolean,host:RefObject<HTMLElement>,details=false){
 const [present,setPresent]=useState(open);const latest=useRef(open);latest.current=open;
 const motions=useRef<Animation[]>([]);const from=useRef<number>();const settled=useRef(open);const generation=useRef(0);
 const beforeSiblings=useRef<Map<HTMLElement,number>>();const restoreLayout=useRef<()=>void>();
 const following=(el:HTMLElement)=>{const positions=new Map<HTMLElement,number>();for(let node=el.nextElementSibling;node;node=node.nextElementSibling)if(node instanceof HTMLElement)positions.set(node,node.getBoundingClientRect().top);return positions;};
 const visibleHeight=(el:HTMLElement)=>{const height=el.getBoundingClientRect().height;if(!details)return height;const clip=getComputedStyle(el).clipPath.match(/^inset\(([^)]+)\)/);if(!clip)return height;const parts=clip[1].split(/\s+/);return height-parseFloat(parts[2]??parts[0]);};
 const stop=()=>{generation.current++;motions.current.forEach(a=>a.cancel());motions.current=[];restoreLayout.current?.();restoreLayout.current=undefined;const el=host.current;if(el)el.style.removeProperty('overflow');from.current=undefined;beforeSiblings.current=undefined;};
 const settle=()=>{stop();settled.current=latest.current;setPresent(latest.current);};
 useEffect(()=>{const pref=matchMedia('(prefers-reduced-motion: reduce)');const reduce=()=>{if(pref.matches)settle();};const hidden=()=>{if(document.hidden)settle();};window.addEventListener('resize',settle);document.addEventListener('visibilitychange',hidden);pref.addEventListener('change',reduce);return()=>{window.removeEventListener('resize',settle);document.removeEventListener('visibilitychange',hidden);pref.removeEventListener('change',reduce);stop();};},[]);
 useLayoutEffect(()=>{
  if(open&&!present){const el=host.current;from.current=el?visibleHeight(el):0;if(details&&el)beforeSiblings.current=following(el);setPresent(true);return;}
  if(!present||settled.current===open&&from.current===undefined&&motions.current.length===0)return;
  const el=host.current;if(!el)return;
  const start=from.current??visibleHeight(el);const siblings=details?beforeSiblings.current??following(el):undefined;
  const body=el.querySelector<HTMLElement>('[data-motion-content]');const bodyStyle=body?getComputedStyle(body):undefined;
  const bodyFrom={opacity:bodyStyle?.opacity??'1',transform:bodyStyle?.transform??'none'};
  const painting=!details&&motions.current.length?getComputedStyle(el):undefined;
  const panelFrom=painting?{opacity:painting.opacity,transform:painting.transform}:open?{opacity:.6,transform:'translateY(-6px)'}:{opacity:1,transform:'none'};
  stop();
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.hidden||typeof el.animate!=='function'){settled.current=open;setPresent(open);return;}
  const style=getComputedStyle(el);const summary=details?el.querySelector('summary'):null;
  const collapsed=summary?summary.getBoundingClientRect().height+parseFloat(style.borderTopWidth||'0')+parseFloat(style.borderBottomWidth||'0')+parseFloat(style.paddingTop||'0')+parseFloat(style.paddingBottom||'0'):0;
  const end=open?el.getBoundingClientRect().height:collapsed;const duration=open?200:160;const token=generation.current;
  let reveal:Animation;
  if(details){
   // Resolve final document flow once; following sections travel on compositor transforms.
   const oldHeight=el.style.height;const parent=el.parentElement;const releaseAnchor=parent?holdScrollAnchor(parent):()=>{};
   if(!open)el.style.height=`${end}px`;
   el.style.overflow='visible';
   restoreLayout.current=()=>{el.style.height=oldHeight;releaseAnchor();};
   const destinations=Array.from(siblings??[],([node,top])=>({node,delta:top-node.getBoundingClientRect().top}));
   reveal=el.animate([{clipPath:`inset(0px 0px ${end-start}px 0px)`},{clipPath:'inset(0px)'}],{id:'panel-reveal',duration,easing:ease,fill:'both'});
   motions.current=[reveal];
   for(const {node,delta} of destinations)if(Math.abs(delta)>.5)motions.current.push(node.animate([{transform:`translateY(${delta}px)`},{transform:'translateY(0px)'}],{id:'panel-flow',duration,easing:ease,fill:'both',composite:'add'}));
  }else{
   // The drawer is the last item in the fixed-height chat log. Resolve its flow
   // once; tweening height makes the whole conversation lay out on every frame.
   el.style.overflow='hidden';
   reveal=el.animate([panelFrom,open?{opacity:1,transform:'none'}:{opacity:0,transform:'translateY(-4px)'}],{id:'panel-reveal',duration,easing:ease,fill:'both'});motions.current=[reveal];
  }
  if(body&&details)motions.current.push(body.animate(open?[{opacity:.6,transform:'translateY(-6px)'},{opacity:1,transform:'none'}]:[bodyFrom,{opacity:0,transform:'translateY(-4px)'}],{id:'panel-content',duration,easing:ease,fill:'both'}));
  void reveal.finished.then(()=>{if(token!==generation.current)return;settled.current=open;if(details)(el as HTMLDetailsElement).open=open;setPresent(open);stop();}).catch(()=>{});
 },[open,present]);
 return present;
}
export function AnimatedPanel({open,children,onLayout}:{open:boolean;children:ReactNode;onLayout?:()=>void}){
 const host=useRef<HTMLDivElement|null>(null);const present=useDisclosureMotion(open,host);
 // The second commit mounts the drawer after `open` changes. Notify the owner
 // after that real flow change, rather than before the new scroll height exists.
 useLayoutEffect(()=>{onLayout?.();},[present]);
 return present?<div className="panel-motion" ref={node=>{host.current=node;if(node)node.inert=!open;}} aria-hidden={!open||undefined}><div data-motion-content>{children}</div></div>:null;
}
/** Measure before switching the sole editor; never keep a second form alive. */
export function useContentSwap(host:RefObject<HTMLElement>,key:unknown){
 const before=useRef<number>();const motion=useRef<Animation>();
 const prepare=()=>{before.current=host.current?.getBoundingClientRect().height;};
 useLayoutEffect(()=>{const node=host.current;const start=before.current;before.current=undefined;motion.current?.cancel();node?.style.removeProperty('overflow');if(!node||start===undefined||matchMedia('(prefers-reduced-motion: reduce)').matches||document.hidden||typeof node.animate!=='function')return;
  const end=node.getBoundingClientRect().height;node.style.overflow='hidden';const a=node.animate([{height:`${start}px`},{height:`${end}px`}],{id:'proposal-layout',duration:200,easing:ease});motion.current=a;void a.finished.then(()=>node.style.removeProperty('overflow')).catch(()=>{});
 },[key]);
 useEffect(()=>{const cancel=()=>{motion.current?.cancel();host.current?.style.removeProperty('overflow');};const pref=matchMedia('(prefers-reduced-motion: reduce)');const reduce=()=>{if(pref.matches)cancel();};const hidden=()=>{if(document.hidden)cancel();};pref.addEventListener('change',reduce);document.addEventListener('visibilitychange',hidden);window.addEventListener('resize',cancel);return()=>{cancel();pref.removeEventListener('change',reduce);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('resize',cancel);};},[]);
 return prepare;
}
