import {Fragment,useEffect,useRef,useState,type FormEvent} from 'react';
import type {AIConfig} from '@/utils/aiClient';
import {getCharacterProfile} from './characterProfiles';
import {SiPresence} from './SiPresence';
import {askAssistant,assistantConfigured,type AssistantReply,type Proposal} from './assistant';
import type {Message,VisualTheme} from './ledger';
import {executeAssistantActions} from './assistantExecution';
import {StickerMessage} from './StickerMessage';
import {StickerPicker} from './StickerPicker';
import {FangyiPresence} from './FangyiPresence';
export function AssistantPanel({config,context,messages,onMessage,onConfirm,character='fangyi'}:{character?:VisualTheme;config:AIConfig|undefined;context:string;messages:Message[];onMessage:(message:Message)=>Promise<void>;onConfirm:(proposal:Proposal,operationId?:string,signal?:AbortSignal)=>Promise<string|void>}){
  const characterPersona=getCharacterProfile(character);
  const isSi=character==='si';
  const shortName=isSi?'祀':'方宜';
  const [text,setText]=useState('');const [pending,setPending]=useState<AssistantReply>();const [states,setStates]=useState<Record<number,string>>({});const [busy,setBusy]=useState(false);const [error,setError]=useState('');const ctrl=useRef<AbortController>();const mounted=useRef(true);const inFlight=useRef(new Set<string>());const batch=useRef('');const [newReply,setNewReply]=useState('');const [preview,setPreview]=useState<string>();
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;ctrl.current?.abort();};},[]);
  async function submit(e:FormEvent){e.preventDefault();if(!text.trim()||busy)return;const input=text.trim();setBusy(true);setError('');setPending(undefined);setStates({});setText('');const controller=new AbortController();ctrl.current=controller;try{
    const requestId=crypto.randomUUID();batch.current=requestId;await onMessage({id:requestId,role:'user',text:input,createdAt:new Date().toISOString()});
    if(controller.signal.aborted||!mounted.current)return;
    const reply=await askAssistant(input,config,context,messages.map(m=>({role:m.role,content:m.text})),controller.signal,undefined,character);
    if(controller.signal.aborted||!mounted.current)return;
    const result=await executeAssistantActions(input,reply.actions,requestId,onConfirm,controller.signal);
    if(controller.signal.aborted&&!result.receipts.length)return;
    const remaining=result.actions.some((_,i)=>!result.states[i]);
    const answer=result.actions.length?`管理员，收到。\n${result.receipts.join('\n')}${remaining?'\n还有待核对的事项，请确认下面的内容。':''}`:reply.reply;
    const id=crypto.randomUUID();const lastSticker=[...messages].reverse().find(m=>m.role==='assistant')?.stickerId;
    const stickerId=reply.stickerId!==lastSticker?reply.stickerId:undefined;
    await onMessage({id,role:'assistant',text:answer,createdAt:new Date().toISOString(),...(stickerId?{stickerId}:{})});if(mounted.current){setNewReply(id);setPending({...reply,actions:result.actions});setStates(result.states);}
  }catch(e){if(mounted.current&&!controller.signal.aborted)setError(e instanceof Error && e.name==='AbortError'?'已停止':e instanceof Error?e.message:'助手暂时不可用');}finally{if(mounted.current&&ctrl.current===controller)setBusy(false);}}
  async function confirm(a:Proposal,index:number){const requestId=batch.current;const id=`ai-${requestId}-${index}`;if(inFlight.current.has(id)||states[index]==='已保存')return;inFlight.current.add(id);setStates(s=>({...s,[index]:'保存中…'}));try{const receipt=await onConfirm(a,id);if(mounted.current&&batch.current===requestId)setStates(s=>({...s,[index]:'已保存'}));await onMessage({id:`receipt-${id}`,role:'assistant',text:receipt||'已保存。',createdAt:new Date().toISOString()});}catch(e){if(mounted.current&&batch.current===requestId){setStates(s=>({...s,[index]:''}));setError(e instanceof Error?e.message:'保存失败');}}finally{inFlight.current.delete(id);}}
  const [drawer,setDrawer]=useState(false);
  const [unread,setUnread]=useState(false);
  const previousCount=useRef(messages.length);
  const [expression,setExpression]=useState<'working'|'peek'>();
  const [reducedMotion,setReducedMotion]=useState(false);
  const log=useRef<HTMLDivElement>(null);
  const composer=useRef<HTMLTextAreaElement>(null);
  const nearBottom=useRef(true);
  useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReducedMotion(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  useEffect(()=>{if(!expression)return;const timer=window.setTimeout(()=>setExpression(undefined),5000);return()=>window.clearTimeout(timer);},[expression]);
  useEffect(()=>{const el=log.current;if(!el)return;if(messages.length===0&&!drawer&&!expression&&!preview)el.scrollTop=0;else if(nearBottom.current)el.scrollTop=el.scrollHeight;},[messages,busy,pending,expression,drawer,preview]);
  useEffect(()=>{if(messages.length>previousCount.current&&!nearBottom.current)setUnread(true);previousCount.current=messages.length;},[messages]);
  const shown=messages.slice(-30);
  const day=(value:string)=>{const date=new Date(value);return Number.isNaN(date.getTime())?'历史消息':date.toLocaleDateString('zh-CN',{month:'long',day:'numeric'});};
  const clock=(value:string)=>{const date=new Date(value);return Number.isNaN(date.getTime())?'':date.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});};
  const avatar=<img className="fangyi-message-avatar" src={characterPersona.avatar} alt="" width="36" height="36"/>;
  const userAvatar=<span className="admin-message-avatar" role="img" aria-label="你的头像"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2z"/></svg></span>;
  return <section className="panel assistant-chat" aria-label={`与${characterPersona.name}的对话`}>
    <header className="fangyi-contact" data-busy={busy}>
      <div className="fangyi-contact-copy"><h2>{characterPersona.name}</h2><p>{characterPersona.badge} · {isSi?'缘缘庄':'武陵'}</p>{assistantConfigured(config)&&<span className="fangyi-config">AI 已配置</span>}<span className="fangyi-request-state" aria-hidden="true">{busy?'正在整理回复…':''}</span></div>
      {isSi?<SiPresence busy={busy}/>:<FangyiPresence busy={busy}/>}
    </header>
    <div className="chat-log" ref={log} role="log" aria-label="聊天记录" aria-live="polite" onScroll={()=>{const el=log.current;if(el){nearBottom.current=messages.length===0||el.scrollHeight-el.scrollTop-el.clientHeight<64;if(nearBottom.current)setUnread(false);}}}>
      {messages.length===0&&<><article className="chat-message assistant">{avatar}<div className="chat-message-content"><small>{characterPersona.name}</small><div className="chat-bubble"><p>{characterPersona.greeting}</p></div></div></article></>}
      {messages.length===0&&<div className="chat-starters" role="group" aria-label="找个话题"><p>找个话题</p><div>{[
        ['随便聊聊','今天想和你随便聊聊。'],['分享好消息','今天有件挺开心的事，想跟你说说。'],['理一理思路','我有个想法，想听听你的看法。'],
      ].map(([label,draft])=><button key={label} type="button" disabled={!!text.trim()||busy} onClick={()=>{if(text.trim()||busy)return;setText(draft);composer.current?.focus();}}>{label}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 5l5 5-5 5"/></svg></button>)}</div></div>}
      {shown.map((m,index)=><Fragment key={m.id}>{(index===0||day(shown[index-1].createdAt)!==day(m.createdAt))&&<div className="chat-day-separator">{day(m.createdAt)}</div>}<article className={`chat-message ${m.role}`} data-arrival={m.id===newReply}>{m.role==='assistant'?avatar:userAvatar}<div className="chat-message-content"><small>{m.role==='user'?'你':characterPersona.name}</small><div className="chat-bubble"><p>{m.text}</p></div>{!isSi&&m.stickerId&&<StickerMessage stickerId={m.stickerId} autoPlay={m.id===newReply}/>}<time dateTime={m.createdAt}>{clock(m.createdAt)}</time></div></article></Fragment>)}
      {busy&&<article className="chat-message assistant">{avatar}<div className="chat-message-content"><small>{characterPersona.name}</small><div className="chat-bubble chat-thinking" role="status">正在想一想…</div></div></article>}
      {!isSi&&preview&&<StickerMessage key={preview} stickerId={preview} autoPlay/>}
      {expression&&<article className="chat-expression"><img src={isSi?(expression==='working'?'/themes/si/painted-mountains.png':'/characters/ink-spirit-number-one.png'):reducedMotion?characterPersona.avatar:`/characters/fangyi-${expression==='working'?'working':'peek'}.gif`} alt={isSi?(expression==='working'?'祀的山水画':'墨魉探头'):expression==='working'?'方宜忙碌表情':'方宜探头表情'} width="136" height="136"/><div><p>{isSi?'预览将在 5 秒后收起。':reducedMotion?'已开启减少动态效果，显示静态头像。':'表情将在 5 秒后停止。'}</p><button type="button" aria-label="停止表情" onClick={()=>setExpression(undefined)}><svg className="expression-stop-icon" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="3" width="10" height="10" rx="1"/></svg></button></div></article>}
      {error&&<p role="alert" className="error">{error}</p>}
      {pending?.actions.map((a,i)=><article className="proposal" key={i}><h3>{a.kind==='ledger'?'待确认流水':a.kind==='reminder'?'待确认提醒':'待确认备忘'}</h3><p>{a.kind==='ledger'?`${a.date} · ${a.direction==='expense'?'支出':'收入'} ¥${a.amount.toFixed(2)} · ${a.note??''}`:a.kind==='reminder'?`${a.title} · ${a.at.replace('T',' ')} · ${a.repeat==='none'?'单次':a.repeat==='daily'?'每天':a.repeat==='weekly'?'每周':a.repeat==='monthly'?'每月':'每年'}`:a.text}</p>{states[i]==='已保存'?<span className="tag">已保存</span>:states[i]==='已忽略'?<span className="muted">已忽略</span>:<div className="button-row"><button disabled={!!states[i]} onClick={()=>void confirm(a,i)}>确认保存</button><button disabled={!!states[i]} onClick={()=>setStates(s=>({...s,[i]:'已忽略'}))}>忽略</button></div>}</article>)}
    {drawer&&<div className="fangyi-expression-drawer" aria-label={`${shortName}表情选择`}><div className="expression-choices"><button type="button" aria-label={isSi?'看看山水画':'播放忙碌表情'} onClick={()=>setExpression('working')}><span>{isSi?'看画':'忙碌中'}</span><small>{isSi?'预览 5 秒':'播放 5 秒'}</small></button><button type="button" aria-label={isSi?'叫墨魉来':'播放探头表情'} onClick={()=>setExpression('peek')}><span>{isSi?'墨魉':'探个头'}</span><small>{isSi?'预览 5 秒':'播放 5 秒'}</small></button></div>{!isSi&&<><StickerPicker onSelect={id=>{setPreview(id);setDrawer(false);}}/><p>表情来源：<a href="https://www.bilibili.com/opus/1193389820389359623" target="_blank" rel="noreferrer">夏雪NazuYuki · Bilibili</a></p></>}</div>}
    </div>
    {unread&&<button type="button" className="chat-latest" onClick={()=>{const el=log.current;if(el)el.scrollTop=el.scrollHeight;nearBottom.current=true;setUnread(false);}}>最新消息</button>}

    <form className="assistant-composer" onSubmit={submit}>
      <button className="expression-toggle" type="button" aria-label={`${shortName}表情`} aria-expanded={drawer} onClick={()=>setDrawer(!drawer)}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M8 14c1 4 7 4 8 0M8 9h.01M16 9h.01" strokeLinecap="round"/></svg></button>
      <textarea ref={composer} aria-label={`和${shortName}说说`} maxLength={6000} value={text} onChange={e=>setText(e.target.value)} placeholder={`和${shortName}说说…`} rows={2}/>
      {busy?<button type="button" className="send-message" onClick={()=>ctrl.current?.abort()}>停止</button>:<button type="submit" className="send-message" disabled={!text.trim()}>发送</button>}
    </form>
  </section>;
}
