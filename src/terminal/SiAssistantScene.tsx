import {useLayoutEffect,useRef} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {terminalDb} from './data';
import {roleStart,roleEnd} from './chatHistory';
import type {Message} from './ledger';
import {SiCompanion} from './SiCompanion';

export function SiAssistantScene({messages,freshReply,arrivingReply,busy,activity,greeting,onInteract}:{messages?:Message[];freshReply:string;arrivingReply:string;busy:boolean;activity:string;greeting:string;onInteract:(text:string)=>void}){
 const pair=useLiveQuery(async()=>{
  if(messages)return undefined;
  const latest=(role:Message['role'])=>terminalDb.messages.where('[character+createdAt+id]').between(roleStart('si'),roleEnd('si'),true,true).reverse().filter(m=>m.role===role).first();
  try{return {rows:await Promise.all([latest('assistant'),latest('user')]),error:''};}
  catch{return {rows:[],error:'最近对话暂时未能读取，请打开聊天记录重试。'};}
 },[messages]);
 const assistant=messages?[...messages].reverse().find(m=>m.role==='assistant'):pair?.rows[0];
 const user=messages?[...messages].reverse().find(m=>m.role==='user'):pair?.rows[1];
 const body=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{if(body.current)body.current.scrollTop=0},[assistant?.id,busy]);
 return <><section className="si-live-scene" aria-label="与祀面对面聊天">
  <div className="si-live-speech"><span>祀</span><div ref={body} className="si-live-speech-body" aria-live="polite" aria-atomic="true">{pair?.error?<p role="alert">{pair.error}</p>:busy?<p role="status">{activity}</p>:<p className="si-live-reply" data-arrival={!!assistant&&assistant.id===arrivingReply}>{assistant?.text??greeting}</p>}</div></div>
  <SiCompanion reply={{id:assistant?.id??'si-greeting',...(assistant?.id===freshReply?assistant.performance:{})}} pending={busy} onGreet={()=>onInteract('轻轻戳了戳祀，想和你打个招呼。')}/>
  {user&&<div className="si-live-user"><small>你说</small><p>{user.text}</p></div>}
  <span className="si-live-caption" aria-hidden="true">茶还热着 · 慢慢聊</span>
 </section><div className="si-live-interactions" aria-label="和祀互动">{[['要杯茶','给我倒杯茶吧。'],['叫墨魉来','让墨魉过来坐坐吧。'],['聊个话题','想听你聊点新鲜事。']].map(([label,text])=><button key={label} type="button" disabled={busy} onClick={()=>onInteract(text)}>{label}</button>)}</div></>;
}
