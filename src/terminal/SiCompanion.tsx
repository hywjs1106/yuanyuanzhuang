import {useEffect,useRef,useState} from 'react';

import {siActions,moliaoActions,isSiAction,isMoliaoAction,type SiAction,type MoliaoAction,type Performance} from './companionPerformance';

const atlases={base:'/previews/si-conversation-actions.webp',extra:'/previews/si-conversation-extra.webp',moliao:'/previews/moliao-conversation-actions.webp'};

export function SiCompanion({reply,pending,onGreet}:{reply:{id:string}&Performance;pending:boolean;onGreet:()=>void}){
 const [ready,setReady]=useState<string[]>([]),[pose,setPose]=useState<SiAction>('happy'),[acting,setActing]=useState(false),[summon,setSummon]=useState<MoliaoAction>();
 const previous=useRef(reply.id);
 const needsSi=isSiAction(reply.action),needsSummon=isMoliaoAction(reply.summon);
 const canPlaySi=needsSi&&ready.includes(siActions[reply.action!].atlas),canPlaySummon=needsSummon&&ready.includes('moliao');
 useEffect(()=>{let live=true;for(const [name,url] of Object.entries(atlases)){const image=new Image();image.src=url;image.decode().then(()=>{if(live)setReady(r=>[...r,name])}).catch(()=>{})}return ()=>{live=false}},[]);
 useEffect(()=>{
  if(pending){setActing(false);setSummon(undefined);return}
  if(previous.current===reply.id)return;
  if((needsSi&&!canPlaySi)||(needsSummon&&!canPlaySummon))return;
  previous.current=reply.id;
  setActing(false);setSummon(undefined);const timers:ReturnType<typeof setTimeout>[]=[];
  if(isSiAction(reply.action)&&canPlaySi){setPose(reply.action);setActing(true);timers.push(setTimeout(()=>setActing(false),siActions[reply.action].duration));}
  if(isMoliaoAction(reply.summon)&&canPlaySummon){setSummon(reply.summon);timers.push(setTimeout(()=>setSummon(undefined),4200));}
  return ()=>timers.forEach(clearTimeout);
 },[reply.id,reply.action,reply.summon,pending,canPlaySi,canPlaySummon,needsSi,needsSummon]);
 useEffect(()=>{const stop=()=>{if(document.hidden){setActing(false);setSummon(undefined)}};document.addEventListener('visibilitychange',stop);return ()=>document.removeEventListener('visibilitychange',stop)},[]);
 const {frame,atlas}=siActions[pose];
 const helperFrame=summon?moliaoActions[summon].frame:0;
 return <><button type="button" className="si-person" data-action={acting?pose:'idle'} aria-label="和祀打个招呼" disabled={pending} onClick={onGreet}>
  <img className="si-rest-pose" src="/previews/si-conversation-fullbody.webp" alt="站在茶馆里和你聊天的祀" draggable={false}/>
  {ready.includes(atlas)&&<span className="si-action-pose" aria-hidden="true" style={{backgroundImage:`url('${atlases[atlas]}')`,backgroundPosition:`${(frame%3)*50}% ${Math.floor(frame/3)*100}%`}}/>}
 </button>{summon&&<span key={reply.id} className="moliao-visitor" data-summon={summon} role="img" aria-label={moliaoActions[summon].label} style={{backgroundPosition:`${(helperFrame%3)*50}% ${Math.floor(helperFrame/3)*100}%`}}/>}</>;
}

