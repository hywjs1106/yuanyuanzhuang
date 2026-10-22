import {useEffect,useLayoutEffect,useRef,useState,type SetStateAction} from 'react';
import type {Message,VisualTheme} from './ledger';
import {readConversationState,writeConversationState,consumeConversationDraft,subscribeConversationDraft} from './conversationState';

export function useConversationView(character:VisualTheme,messages:Message[],ready:boolean,pages?:{hasEarlier:boolean;earlier:()=>Promise<void>;latest:()=>Promise<void>},visible=true){
 const [initial]=useState(()=>readConversationState(character));
 const view=useRef(initial);const [text,setTextState]=useState(initial.draft);const [firstId,setFirstId]=useState(initial.firstId);
 const [unread,setUnread]=useState(false);const log=useRef<HTMLDivElement>(null);const initialized=useRef(false);const alive=useRef(true);
 const rendered=useRef<{first?:string;last?:string;height:number}>({height:0});
 const follow=useRef<{frame:number;start:number;top:number}>();
 const timer=useRef<ReturnType<typeof setTimeout>>();const latest=useRef(messages);latest.current=messages;
 let start=firstId?messages.findIndex(m=>m.id===firstId):-1;if(start<0)start=Math.max(0,messages.length-30);
 // If a restored anchor predates the window (e.g. messages arrived while away), keep it reachable.
 const restoredIndex=view.current.anchor?messages.findIndex(m=>m.id===view.current.anchor?.id):-1;
 if(!initialized.current&&restoredIndex>=0)start=Math.min(start,restoredIndex);
 const shown=pages?messages:messages.slice(start);const hasEarlier=pages?pages.hasEarlier:start>0;
 const flush=()=>{clearTimeout(timer.current);writeConversationState(character,{nearBottom:view.current.nearBottom,scrollTop:view.current.scrollTop,firstId:view.current.firstId,anchor:view.current.anchor,lastReadId:view.current.lastReadId});};
 const schedule=()=>{clearTimeout(timer.current);timer.current=setTimeout(flush,120);};
 function setText(value:SetStateAction<string>){
  const next=(typeof value==='function'?value(view.current.draft):value).slice(0,6000);
  view.current.draft=next;writeConversationState(character,{draft:next});if(alive.current)setTextState(next);
 }
 function consumeDraft(expected:string){
  if(!consumeConversationDraft(character,expected))return;
  view.current.draft='';if(alive.current)setTextState('');
 }
 function stopFollowing(){if(follow.current)cancelAnimationFrame(follow.current.frame);follow.current=undefined;log.current?.removeAttribute('data-following');}
 function followBottom(){
  const el=log.current;if(!el)return;stopFollowing();
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.hidden||Math.abs(el.scrollHeight-el.clientHeight-el.scrollTop)<2){restore();return;}
  const motion={frame:0,start:performance.now(),top:el.scrollTop};follow.current=motion;el.dataset.following='true';
  const step=(now:number)=>{if(follow.current!==motion)return;const progress=Math.min(1,(now-motion.start)/220);const target=Math.max(0,el.scrollHeight-el.clientHeight);el.scrollTop=motion.top+(target-motion.top)*(1-Math.pow(1-progress,3));view.current.scrollTop=el.scrollTop;if(progress<1)motion.frame=requestAnimationFrame(step);else{stopFollowing();capture();}};
  motion.frame=requestAnimationFrame(step);
 }
 function capture(){
  if(follow.current)return;
  const el=log.current;if(!el||!initialized.current)return;
  const bottom=el.scrollHeight-el.clientHeight-el.scrollTop<64;
  view.current.nearBottom=bottom;view.current.scrollTop=el.scrollTop;
  const top=el.getBoundingClientRect().top;
  const anchor=[...el.querySelectorAll<HTMLElement>('[data-message-id]')].find(row=>row.getBoundingClientRect().bottom>top+1);
  view.current.anchor=anchor?{id:anchor.dataset.messageId!,offset:anchor.getBoundingClientRect().top-top}:undefined;
  if(bottom){view.current.lastReadId=latest.current[latest.current.length-1]?.id;setUnread(false);}
  schedule();
 }
 function restore(){
  if(follow.current)return;
  const el=log.current;if(!el)return;
  if(view.current.nearBottom){el.scrollTop=el.scrollHeight;view.current.lastReadId=latest.current[latest.current.length-1]?.id;setUnread(false);}
  else{
   const anchor=view.current.anchor;
   const row=anchor?[...el.querySelectorAll<HTMLElement>('[data-message-id]')].find(item=>item.dataset.messageId===anchor.id):undefined;
   if(row&&anchor)el.scrollTop+=row.getBoundingClientRect().top-el.getBoundingClientRect().top-anchor.offset;
   else el.scrollTop=view.current.scrollTop;
   const last=latest.current[latest.current.length-1]?.id;setUnread(!!last&&last!==view.current.lastReadId);
  }
  view.current.scrollTop=el.scrollTop;
 }
 useLayoutEffect(()=>{
  // Hidden scene support removes log children; never capture that clamped zero
  // as the reader's history position when the log becomes visible again.
  if(!ready||!visible){rendered.current={...rendered.current,height:0};return;}
  const el=log.current;
  // A scroll event may still be queued when a new message commits. Capture the
  // actual reader position before restoring, except during prepend or resize.
  if(initialized.current&&el&&rendered.current.first===shown[0]?.id&&rendered.current.height===el.clientHeight&&Math.abs(el.scrollTop-view.current.scrollTop)>1)capture();
  if(!initialized.current){initialized.current=true;if(shown[0]){view.current.firstId=shown[0].id;setFirstId(shown[0].id);}}
  const last=shown[shown.length-1]?.id;const previous=rendered.current;
  const appended=previous.last!==last&&!!last&&(!previous.last||shown.some(m=>m.id===previous.last));
  if(previous.height&&appended&&view.current.nearBottom)followBottom();else restore();
  rendered.current={first:shown[0]?.id,last,height:el?.clientHeight??0};
 },[messages,firstId,ready,visible]);
 useEffect(()=>{
  if(!ready||!visible)return;
  const el=log.current;if(!el)return;
  const interrupt=()=>{if(follow.current){stopFollowing();capture();}};
  const key=(event:KeyboardEvent)=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))interrupt();};
  const pref=matchMedia('(prefers-reduced-motion: reduce)');const settle=()=>{if(follow.current){stopFollowing();restore();capture();}};const reduce=()=>{if(pref.matches)settle();};const hidden=()=>{if(document.hidden)settle();};
  el.addEventListener('wheel',interrupt,{passive:true});el.addEventListener('touchstart',interrupt,{passive:true});el.addEventListener('pointerdown',interrupt);el.addEventListener('keydown',key);pref.addEventListener('change',reduce);document.addEventListener('visibilitychange',hidden);
  return()=>{el.removeEventListener('wheel',interrupt);el.removeEventListener('touchstart',interrupt);el.removeEventListener('pointerdown',interrupt);el.removeEventListener('keydown',key);pref.removeEventListener('change',reduce);document.removeEventListener('visibilitychange',hidden);stopFollowing();};
 },[ready,visible]);
 useEffect(()=>{
  if(!ready||!visible)return;
  const el=log.current;if(!el)return;
  const observer=typeof ResizeObserver==='undefined'?undefined:new ResizeObserver(()=>restore());
  observer?.observe(el);el.querySelectorAll('[data-message-id]').forEach(row=>observer?.observe(row));
  const loaded=()=>restore();el.addEventListener('load',loaded,true);
  return()=>{observer?.disconnect();el.removeEventListener('load',loaded,true);};
 },[messages,firstId,ready,visible]);
 useEffect(()=>{
  alive.current=true;const hidden=()=>{if(document.hidden)flush();};
  const unsubscribe=subscribeConversationDraft(character,draft=>{view.current.draft=draft;if(alive.current)setTextState(draft);});
  window.addEventListener('pagehide',flush);document.addEventListener('visibilitychange',hidden);
  return()=>{alive.current=false;unsubscribe();flush();window.removeEventListener('pagehide',flush);document.removeEventListener('visibilitychange',hidden);};
 },[]);
 function earlier(){capture();if(pages){void pages.earlier();return;}const next=Math.max(0,start-30);const id=messages[next]?.id;if(id){view.current.firstId=id;setFirstId(id);schedule();}}
 function latestMessage(){view.current.nearBottom=true;view.current.anchor=undefined;if(pages)void pages.latest();restore();capture();}
 return {text,setText,consumeDraft,log,onScroll:capture,refresh:restore,unread,shown,hasEarlier,earlier,latestMessage};
}
