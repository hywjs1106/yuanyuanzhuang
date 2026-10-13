import {useEffect,useRef,useState,type FormEvent} from 'react';
import type {AIConfig} from '@/utils/aiClient';
import {askAssistant,type AssistantReply,type Proposal} from './assistant';
import type {Message} from './ledger';
export function AssistantPanel({config,context,messages,onMessage,onConfirm}:{config:AIConfig|undefined;context:string;messages:Message[];onMessage:(message:Message)=>Promise<void>;onConfirm:(proposal:Proposal)=>Promise<void>}){
  const [text,setText]=useState('');const [pending,setPending]=useState<AssistantReply>();const [states,setStates]=useState<Record<number,string>>({});const [busy,setBusy]=useState(false);const [error,setError]=useState('');const ctrl=useRef<AbortController>();const inFlight=useRef(new Set<number>());
  useEffect(()=>()=>ctrl.current?.abort(),[]);
  async function submit(e:FormEvent){e.preventDefault();if(!text.trim()||busy)return;const input=text.trim();setBusy(true);setError('');setPending(undefined);setStates({});setText('');ctrl.current=new AbortController();try{
    await onMessage({id:crypto.randomUUID(),role:'user',text:input,createdAt:new Date().toISOString()});
    const reply=await askAssistant(input,config,context,messages.map(m=>({role:m.role,content:m.text})),ctrl.current.signal);
    if(ctrl.current.signal.aborted)return;
    await onMessage({id:crypto.randomUUID(),role:'assistant',text:reply.reply,createdAt:new Date().toISOString()});setPending(reply);
  }catch(e){setError(e instanceof Error && e.name==='AbortError'?'已停止':e instanceof Error?e.message:'助手暂时不可用');}finally{setBusy(false);}}
  async function confirm(a:Proposal,index:number){if(inFlight.current.has(index)||states[index]==='已保存')return;inFlight.current.add(index);setStates(s=>({...s,[index]:'保存中…'}));try{await onConfirm(a);setStates(s=>({...s,[index]:'已保存'}));}catch(e){setStates(s=>({...s,[index]:''}));setError(e instanceof Error?e.message:'保存失败');}finally{inFlight.current.delete(index);}}
  return <section className="panel"><div className="panel-heading"><h2>AI 助手</h2><span className="tag">{config?.apiKey?'已配置 AI':'离线记账模式'}</span></div><p className="muted">一句话记账、建提醒、存备忘。每个动作确认后才会保存。</p><div className="chat-log" aria-live="polite">{messages.slice(-30).map(m=><article key={m.id} className={`chat-message ${m.role}`}><small>{m.role==='user'?'你':'助手'}</small><p>{m.text}</p></article>)}</div>
    {error&&<p role="alert" className="error">{error}</p>}
    {pending?.actions.map((a,i)=><article className="proposal" key={i}><h3>{a.kind==='ledger'?'待确认流水':a.kind==='reminder'?'待确认提醒':'待确认备忘'}</h3><p>{a.kind==='ledger'?`${a.date} · ${a.direction==='expense'?'支出':'收入'} ¥${a.amount.toFixed(2)} · ${a.note??''}`:a.kind==='reminder'?`${a.title} · ${a.at.replace('T',' ')} · ${a.repeat==='none'?'单次':a.repeat==='daily'?'每天':a.repeat==='weekly'?'每周':a.repeat==='monthly'?'每月':'每年'}`:a.text}</p>{states[i]==='已保存'?<span className="tag">已保存</span>:states[i]==='已忽略'?<span className="muted">已忽略</span>:<div className="button-row"><button disabled={!!states[i]} onClick={()=>void confirm(a,i)}>确认保存</button><button disabled={!!states[i]} onClick={()=>setStates(s=>({...s,[i]:'已忽略'}))}>忽略</button></div>}</article>)}
    <form className="assistant-composer" onSubmit={submit}><label>告诉助手<textarea maxLength={6000} value={text} onChange={e=>setText(e.target.value)} placeholder="午饭花了28元；明天上午9点提醒我交电费" rows={3}/></label><div className="button-row"><button type="submit" disabled={busy||!text.trim()}>{busy?'思考中…':'发送'}</button>{busy&&<button type="button" onClick={()=>ctrl.current?.abort()}>停止</button>}</div></form>
  </section>;
}
