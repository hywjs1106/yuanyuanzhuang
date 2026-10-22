import {Capacitor} from '@capacitor/core';
import type {RouteMotion} from './routeMotion';
import {useCallback,useEffect,useLayoutEffect,useRef,useState,type RefObject,type PointerEvent as ReactPointerEvent,type KeyboardEvent as ReactKeyboardEvent} from 'react';

/** The outgoing page is a disposable, inert painting, never a second mounted app. */
export function useInkNavigation(main:RefObject<HTMLElement>,page:string,enabled:boolean,onFinish:()=>void,material='si'){
 const [moving,setMoving]=useState(false);const [render,setRender]=useState<'direct'|'painting'>('painting');const [kind,setKind]=useState<RouteMotion>('tab');
 const previous=useRef<HTMLElement>();const timer=useRef<number>();const serial=useRef(0);
 const burst=useRef({at:0,count:0});
 const touch=useRef<{x:number;y:number;at:number}>();const origin=useRef<{x:number;y:number}>();
 const finish=useRef(onFinish);finish.current=onFinish;
 const clear=useCallback((notify=true)=>{
  clearTimeout(timer.current);previous.current?.remove();previous.current=undefined;origin.current=undefined;
  if(main.current){main.current.style.removeProperty('--ink-x');main.current.style.removeProperty('--ink-y');main.current.style.removeProperty('--ink-radius');}
  if(notify){setMoving(false);finish.current();}
 },[main]);
 useEffect(()=>{const cancel=()=>clear();const visibility=()=>{if(document.hidden)cancel();};const pref=window.matchMedia('(prefers-reduced-motion: reduce)');const reduce=()=>{if(pref.matches)cancel();};
  window.addEventListener('resize',cancel);document.addEventListener('visibilitychange',visibility);pref.addEventListener('change',reduce);
  return()=>{window.removeEventListener('resize',cancel);document.removeEventListener('visibilitychange',visibility);pref.removeEventListener('change',reduce);clear(false);};
 },[clear]);
 useEffect(()=>clear(),[material,clear]);
 useLayoutEffect(()=>{
  if(!enabled){if(previous.current)clear();return;}
  const el=main.current;if(!moving||!origin.current||!el)return;
  const box=el.getBoundingClientRect();const x=Math.max(0,Math.min(box.width,origin.current.x-box.left));const y=Math.max(-box.top,Math.min(window.innerHeight-box.top,origin.current.y-box.top));
  const radius=Math.hypot(Math.max(x,box.width-x),Math.max(y,box.height-y))+2;
  el.style.setProperty('--ink-x',`${x}px`);el.style.setProperty('--ink-y',`${y}px`);el.style.setProperty('--ink-radius',`${radius}px`);
 },[page,moving,enabled,main,clear]);
 const begin=(nextKind:RouteMotion='tab')=>{
  const now=performance.now();burst.current={at:now,count:now-burst.current.at<400?burst.current.count+1:1};
  setKind(nextKind);
  const el=main.current;
  if(!enabled||!el||burst.current.count>3||window.matchMedia('(prefers-reduced-motion: reduce)').matches){clear(false);setMoving(false);return false;}
  // Mobile WebViews must not clone, measure and rasterize two complete pages per tap.
  if(Capacitor.isNativePlatform()||window.matchMedia('(pointer: coarse)').matches){
   clear(false);setRender('direct');setMoving(true);timer.current=window.setTimeout(()=>clear(),260);return true;
  }
  setRender('painting');const backing=previous.current;
  const freeze=(node:HTMLElement)=>{const style=getComputedStyle(node);return {transform:style.transform,clipPath:style.clipPath,opacity:style.opacity};};
  const surface=el?freeze(el):undefined;const oldSurface=backing?freeze(backing):undefined;const oldBox=backing?.getBoundingClientRect();
  clear(false);
  const rect=el.getBoundingClientRect();const matrix=new DOMMatrix(surface?.transform==='none'?undefined:surface?.transform);const box={left:rect.left-matrix.m41,top:rect.top-matrix.m42,width:rect.width,height:rect.height,bottom:rect.bottom-matrix.m42};const point=touch.current&&performance.now()-touch.current.at<500?touch.current:{x:box.left+box.width/2,y:Math.max(0,box.top)+Math.min(box.height,window.innerHeight)*.35};
  touch.current=undefined;origin.current=point;
  const painting=document.createElement('div');painting.className='ink-route-previous';painting.dataset.routeKind=nextKind;painting.inert=true;painting.setAttribute('aria-hidden','true');
  const top=Math.max(0,box.top);const bottom=Math.min(window.innerHeight,el.parentElement?.querySelector('.bottom-navigation:not([hidden])')?.getBoundingClientRect().top??window.innerHeight,box.bottom);
  Object.assign(painting.style,{left:`${box.left}px`,top:`${top}px`,width:`${box.width}px`,height:`${Math.max(0,bottom-top)}px`});
  const copy=document.createElement('div');copy.className=el.className.replace(/route-enter/g,'')+' ink-route-copy';copy.append(...Array.from(el.childNodes,node=>node.cloneNode(true)));
  Object.assign(copy.style,{width:`${box.width}px`,height:`${box.height}px`,transform:`translateY(${box.top-top}px) ${surface?.transform==='none'?'':surface?.transform??''}`,clipPath:surface?.clipPath??'none',opacity:surface?.opacity??'1',background:'var(--color-base)'});
  // Positioned copies no longer collapse their first child's top margin.
  const first=el.firstElementChild as HTMLElement|null;const firstCopy=copy.firstElementChild as HTMLElement|null;
  if(first&&firstCopy&&Math.abs(first.getBoundingClientRect().top-rect.top)<.5&&parseFloat(getComputedStyle(first).marginTop)>0)firstCopy.style.marginTop='0';
  const originals=Array.from(el.querySelectorAll<HTMLElement>('*'));const copies=Array.from(copy.querySelectorAll<HTMLElement>('*'));
  // Query the subtree once: per-node queries force style resolution even in closed details.
  const indexByNode=new Map<Element,number>(originals.map((node,index)=>[node,index]));
  const animated=new Set(el.getAnimations({subtree:true}).map(animation=>(animation.effect as KeyframeEffect|null)?.target).filter((node):node is Element=>!!node&&indexByNode.has(node)));
  const frozen=Array.from(animated,node=>{
   const style=getComputedStyle(node);
   return {index:indexByNode.get(node)!,values:['height','width','transform','opacity','clip-path'].map(property=>[property,style.getPropertyValue(property)] as const)};
  });
  for(const {index,values} of frozen)for(const [property,value] of values)copies[index].style.setProperty(property,value);
  const scroll=originals.flatMap((node,index)=>node.scrollTop||node.scrollLeft?[{node:copies[index],top:node.scrollTop,left:node.scrollLeft}]:[]);
  const prefix=`ink-paint-${++serial.current}-`;const ids=new Map<string,string>();
  copy.querySelectorAll('[id]').forEach(node=>{ids.set(node.id,prefix+node.id);node.id=prefix+node.id;});
  copy.querySelectorAll('*').forEach(node=>{
   node.removeAttribute('autofocus');node.removeAttribute('aria-live');
   for(const attr of Array.from(node.attributes)){
    if(attr.name==='id')continue;
    let value=attr.value.replace(/url\((['"]?)#([^)'"\s]+)\1\)/g,(_match,_quote,id)=>`url(#${ids.get(id)??id})`);
    if(value.startsWith('#')&&ids.has(value.slice(1)))value='#'+ids.get(value.slice(1));
    if(value!==attr.value)node.setAttribute(attr.name,value);
   }
  });
  const fields=el.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('input,textarea,select');
  copy.querySelectorAll('input,textarea,select').forEach((field,index)=>{
   const original=fields[index];
   // Closed native disclosures are not painted. Measuring their controls forces hidden layout.
   if(original.closest('details:not([open])')){field.remove();return;}
   const still=document.createElement('div');const style=getComputedStyle(original);
   if(style.display==='none'){field.remove();return;}
   for(const prop of ['width','height','min-height','padding','border','border-radius','background','color','font','line-height','box-sizing','white-space','visibility','opacity'])still.style.setProperty(prop,style.getPropertyValue(prop));
   still.textContent=original instanceof HTMLInputElement&&original.type==='password'?(original.value?'••••••':''):original instanceof HTMLSelectElement?original.selectedOptions[0]?.text??'':original.value;
   if(original instanceof HTMLInputElement&&['checkbox','radio'].includes(original.type)){
    still.textContent='';still.style.position='relative';still.style.padding='0';still.style.border='1px solid currentColor';
    if(original.type==='radio')still.style.borderRadius='50%';
    if(original.checked){const mark=document.createElement('span');Object.assign(mark.style,{position:'absolute',inset:'20%',background:'currentColor',borderRadius:original.type==='radio'?'50%':'1px'});still.append(mark);}
   }else if(!still.textContent&&'placeholder' in original){still.textContent=original.placeholder;}
   field.replaceWith(still);
  });
  copy.querySelectorAll('video').forEach(video=>{video.autoplay=false;video.removeAttribute('src');video.load();});
  painting.style.setProperty('--ink-touch-x',`${point.x-box.left}px`);painting.style.setProperty('--ink-touch-y',`${point.y-top}px`);
  if(backing&&oldSurface&&oldBox){
   const wasPop=backing.dataset.routeKind==='pop';backing.className='ink-route-history';
   const oldMatrix=new DOMMatrix(oldSurface.transform==='none'?undefined:oldSurface.transform);
   Object.assign(backing.style,{position:'absolute',left:`${oldBox.left-oldMatrix.m41-box.left}px`,top:`${oldBox.top-oldMatrix.m42-top}px`,...oldSurface,animation:'none',zIndex:wasPop?'1':'0',pointerEvents:'none'});
   copy.style.zIndex=wasPop?'0':'1';painting.append(backing,copy);
  }else painting.append(copy);
  el.parentElement?.append(painting);
  for(const item of scroll){if(item.node.isConnected){item.node.style.scrollBehavior='auto';item.node.scrollTop=item.top;item.node.scrollLeft=item.left;}}
  previous.current=painting;setMoving(true);
  timer.current=window.setTimeout(()=>clear(),520);return true;
 };
 return {moving,kind,render,begin,clear:()=>clear(),capturePointer:(event:ReactPointerEvent)=>{touch.current={x:event.clientX,y:event.clientY,at:performance.now()};},captureKey:(event:ReactKeyboardEvent)=>{if(event.key==='Enter'||event.key===' ')touch.current=undefined;}};
}
