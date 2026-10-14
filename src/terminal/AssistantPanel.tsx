import {useEffect,useRef,useState,type FormEvent} from 'react';
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
  return <section className="panel"><div className="panel-heading"><h2>{characterPersona.name}</h2><span className="tag">{characterPersona.badge}</span><span className="tag">{assistantConfigured(config)?'AI 已配置':'离线预设'}</span></div><p className="muted">可以闲聊，也可以一起理清日常事务。记录、提醒和备忘确认后才会保存。</p><div className="chat-log" aria-live="polite">{messages.length===0&&<article className="chat-message assistant"><small>{characterPersona.name}</small><p>{characterPersona.greeting}</p></article>}{messages.slice(-30).map(m=><article key={m.id} className={`chat-message ${m.role}`}><small>{m.role==='user'?'你':characterPersona.name}</small><p>{m.text}</p></article>)}</div>
    {error&&<p role="alert" className="error">{error}</p>}
    {pending?.actions.map((a,i)=><article className="proposal" key={i}><h3>{a.kind==='ledger'?'待确认流水':a.kind==='reminder'?'待确认提醒':'待确认备忘'}</h3><p>{a.kind==='ledger'?`${a.date} · ${a.direction==='expense'?'支出':'收入'} ¥${a.amount.toFixed(2)} · ${a.note??''}`:a.kind==='reminder'?`${a.title} · ${a.at.replace('T',' ')} · ${a.repeat==='none'?'单次':a.repeat==='daily'?'每天':a.repeat==='weekly'?'每周':a.repeat==='monthly'?'每月':'每年'}`:a.text}</p>{states[i]==='已保存'?<span className="tag">已保存</span>:states[i]==='已忽略'?<span className="muted">已忽略</span>:<div className="button-row"><button disabled={!!states[i]} onClick={()=>void confirm(a,i)}>确认保存</button><button disabled={!!states[i]} onClick={()=>setStates(s=>({...s,[i]:'已忽略'}))}>忽略</button></div>}</article>)}
    <form className="assistant-composer" onSubmit={submit}><label>和方宜说说<textarea maxLength={6000} value={text} onChange={e=>setText(e.target.value)} placeholder="聊聊今天，或说：午饭花了28元" rows={3}/></label><div className="button-row"><button type="submit" disabled={busy||!text.trim()}>{busy?'思考中…':'发送'}</button>{busy&&<button type="button" onClick={()=>ctrl.current?.abort()}>停止</button>}</div></form>
  </section>;
}
