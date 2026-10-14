import {Fragment,useEffect,useRef,useState,type FormEvent} from 'react';
import type {AIConfig} from '@/utils/aiClient';
import {characterPersona} from './persona';
import {askAssistant,assistantConfigured,type AssistantReply,type Proposal} from './assistant';
import type {Message} from './ledger';
export function AssistantPanel({config,context,messages,onMessage,onConfirm}:{config:AIConfig|undefined;context:string;messages:Message[];onMessage:(message:Message)=>Promise<void>;onConfirm:(proposal:Proposal)=>Promise<void>}){
  const [text,setText]=useState('');const [pending,setPending]=useState<AssistantReply>();const [states,setStates]=useState<Record<number,string>>({});const [busy,setBusy]=useState(false);const [error,setError]=useState('');const ctrl=useRef<AbortController>();const mounted=useRef(true);const inFlight=useRef(new Set<number>());
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;ctrl.current?.abort();};},[]);
  async function submit(e:FormEvent){e.preventDefault();if(!text.trim()||busy)return;const input=text.trim();setBusy(true);setError('');setPending(undefined);setStates({});setText('');const controller=new AbortController();ctrl.current=controller;try{
    await onMessage({id:crypto.randomUUID(),role:'user',text:input,createdAt:new Date().toISOString()});
    if(controller.signal.aborted||!mounted.current)return;
    const reply=await askAssistant(input,config,context,messages.map(m=>({role:m.role,content:m.text})),controller.signal);
    if(controller.signal.aborted||!mounted.current)return;
    await onMessage({id:crypto.randomUUID(),role:'assistant',text:reply.reply,createdAt:new Date().toISOString()});if(!controller.signal.aborted&&mounted.current)setPending(reply);
  }catch(e){if(mounted.current&&!controller.signal.aborted)setError(e instanceof Error && e.name==='AbortError'?'已停止':e instanceof Error?e.message:'助手暂时不可用');}finally{if(mounted.current&&ctrl.current===controller)setBusy(false);}}
  async function confirm(a:Proposal,index:number){if(inFlight.current.has(index)||states[index]==='已保存')return;inFlight.current.add(index);setStates(s=>({...s,[index]:'保存中…'}));try{await onConfirm(a);setStates(s=>({...s,[index]:'已保存'}));}catch(e){setStates(s=>({...s,[index]:''}));setError(e instanceof Error?e.message:'保存失败');}finally{inFlight.current.delete(index);}}
  const [drawer,setDrawer]=useState(false);
  const [unread,setUnread]=useState(false);
  const previousCount=useRef(messages.length);
  const [expression,setExpression]=useState<'working'|'peek'>();
  const [reducedMotion,setReducedMotion]=useState(false);
  const log=useRef<HTMLDivElement>(null);
  const nearBottom=useRef(true);
  useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReducedMotion(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  useEffect(()=>{if(!expression)return;const timer=window.setTimeout(()=>setExpression(undefined),5000);return()=>window.clearTimeout(timer);},[expression]);
  useEffect(()=>{const el=log.current;if(el&&nearBottom.current)el.scrollTop=el.scrollHeight;},[messages,busy,pending,expression,drawer]);
  useEffect(()=>{if(messages.length>previousCount.current&&!nearBottom.current)setUnread(true);previousCount.current=messages.length;},[messages]);
  const shown=messages.slice(-30);
  const day=(value:string)=>{const date=new Date(value);return Number.isNaN(date.getTime())?'历史消息':date.toLocaleDateString('zh-CN',{month:'long',day:'numeric'});};
  const clock=(value:string)=>{const date=new Date(value);return Number.isNaN(date.getTime())?'':date.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});};
  const avatar=<img className="fangyi-message-avatar" src="/characters/fangyi-avatar.png" alt="" width="36" height="36"/>;
  return <section className="panel assistant-chat" aria-label="与庄方宜的对话">
    <header className="fangyi-contact">
      <div className="fangyi-portrait-frame"><img src="/characters/fangyi-avatar.png" alt="庄方宜头像" width="64" height="64"/></div>
      <div className="fangyi-contact-copy"><h2>{characterPersona.name}</h2><p>{characterPersona.badge} · 武陵</p></div>
      <span className="fangyi-config">{assistantConfigured(config)?'AI 已配置':'离线预设'}</span>
    </header>
    <p className="fangyi-chat-notice">记录、提醒和备忘，确认后才会保存。</p>
    <div className="chat-log" ref={log} role="log" aria-label="聊天记录" aria-live="polite" onScroll={()=>{const el=log.current;if(el){nearBottom.current=el.scrollHeight-el.scrollTop-el.clientHeight<64;if(nearBottom.current)setUnread(false);}}}>
      {messages.length===0&&<><div className="chat-day-separator">开始对话</div><article className="chat-message assistant">{avatar}<div className="chat-message-content"><small>{characterPersona.name}</small><div className="chat-bubble"><p>{characterPersona.greeting}</p></div></div></article></>}
      {shown.map((m,index)=><Fragment key={m.id}>{(index===0||day(shown[index-1].createdAt)!==day(m.createdAt))&&<div className="chat-day-separator">{day(m.createdAt)}</div>}<article className={`chat-message ${m.role}`}>{m.role==='assistant'&&avatar}<div className="chat-message-content"><small>{m.role==='user'?'你':characterPersona.name}</small><div className="chat-bubble"><p>{m.text}</p></div><time dateTime={m.createdAt}>{clock(m.createdAt)}</time></div></article></Fragment>)}
      {busy&&<article className="chat-message assistant">{avatar}<div className="chat-message-content"><small>{characterPersona.name}</small><div className="chat-bubble chat-thinking" role="status">正在想一想…</div></div></article>}
      {expression&&<article className="chat-expression"><img src={reducedMotion?'/characters/fangyi-avatar.png':`/characters/fangyi-${expression==='working'?'working':'peek'}.gif`} alt={expression==='working'?'方宜忙碌表情':'方宜探头表情'} width="136" height="136"/><div><p>{reducedMotion?'已开启减少动态效果，显示静态头像。':'表情将在 5 秒后停止。'}</p><button type="button" onClick={()=>setExpression(undefined)}>停止表情</button></div></article>}
      {error&&<p role="alert" className="error">{error}</p>}
      {pending?.actions.map((a,i)=><article className="proposal" key={i}><h3>{a.kind==='ledger'?'待确认流水':a.kind==='reminder'?'待确认提醒':'待确认备忘'}</h3><p>{a.kind==='ledger'?`${a.date} · ${a.direction==='expense'?'支出':'收入'} ¥${a.amount.toFixed(2)} · ${a.note??''}`:a.kind==='reminder'?`${a.title} · ${a.at.replace('T',' ')} · ${a.repeat==='none'?'单次':a.repeat==='daily'?'每天':a.repeat==='weekly'?'每周':a.repeat==='monthly'?'每月':'每年'}`:a.text}</p>{states[i]==='已保存'?<span className="tag">已保存</span>:states[i]==='已忽略'?<span className="muted">已忽略</span>:<div className="button-row"><button disabled={!!states[i]} onClick={()=>void confirm(a,i)}>确认保存</button><button disabled={!!states[i]} onClick={()=>setStates(s=>({...s,[i]:'已忽略'}))}>忽略</button></div>}</article>)}
    {drawer&&<div className="fangyi-expression-drawer" aria-label="方宜表情选择"><div className="expression-choices"><button type="button" aria-label="播放忙碌表情" onClick={()=>setExpression('working')}><span>忙碌中</span><small>播放 5 秒</small></button><button type="button" aria-label="播放探头表情" onClick={()=>setExpression('peek')}><span>探个头</span><small>播放 5 秒</small></button></div><p>表情来源：<a href="https://www.bilibili.com/opus/1193389820389359623" target="_blank" rel="noreferrer">夏雪NazuYuki · Bilibili</a></p></div>}
    </div>
    {unread&&<button type="button" className="chat-latest" onClick={()=>{const el=log.current;if(el)el.scrollTop=el.scrollHeight;nearBottom.current=true;setUnread(false);}}>最新消息</button>}

    <form className="assistant-composer" onSubmit={submit}>
      <button className="expression-toggle" type="button" aria-label="方宜表情" aria-expanded={drawer} onClick={()=>setDrawer(!drawer)}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M8 14c1 4 7 4 8 0M8 9h.01M16 9h.01" strokeLinecap="round"/></svg></button>
      <textarea aria-label="和方宜说说" maxLength={6000} value={text} onChange={e=>setText(e.target.value)} placeholder="和方宜说说…" rows={2}/>
      {busy?<button type="button" className="send-message" onClick={()=>ctrl.current?.abort()}>停止</button>:<button type="submit" className="send-message" disabled={!text.trim()}>发送</button>}
    </form>
  </section>;
}
