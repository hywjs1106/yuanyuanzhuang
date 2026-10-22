import {useLayoutEffect,useRef,useState} from 'react';
import {SiCompanion} from './SiCompanion';
import {CharacterIcon} from './CharacterIcon';
import {useTeaConversation} from './useTeaConversation';
import './tea-chat.css';

type Props={conversation:ReturnType<typeof useTeaConversation>;onNavigate:(page:'记账'|'提醒')=>void};
const expressions=[{pose:'黄历',label:'开心'},{pose:'天气',label:'困困'},{pose:'今日',label:'招手'},{pose:'助手',label:'喝茶'}];
export function TeaChat({conversation:c,onNavigate}:Props){
 const [picker,setPicker]=useState(false),[away,setAway]=useState(false),[history,setHistory]=useState(false);
 const scroll=useRef<HTMLDivElement>(null),input=useRef<HTMLTextAreaElement>(null),composing=useRef(false),follow=useRef(true);
 const first=useRef(true),speech=useRef<HTMLDivElement>(null);
 const bottom=()=>{const node=scroll.current;if(!node)return;node.scrollTop=node.scrollHeight;follow.current=true;setAway(false)};
 const latestSi=[...c.messages].reverse().find(m=>m.who==='si')!;
 const latestYou=[...c.messages].reverse().find(m=>m.who==='you');
 useLayoutEffect(()=>{if(speech.current)speech.current.scrollTop=0},[latestSi.id,c.pending,history]);
 useLayoutEffect(()=>{if(!history)return;if(first.current||follow.current){bottom();first.current=false}else setAway(true)},[c.messages.length,c.pending,picker,history]);
 useLayoutEffect(()=>{const node=input.current;if(!node)return;node.style.height='0px';node.style.height=`${Math.min(Math.max(node.scrollHeight,44),108)}px`},[c.draft]);
 const send=()=>{if(composing.current||c.pending)return;if(c.submit(c.draft,{clearDraft:true})){follow.current=true;bottom()}};
 const gesture=(text:string)=>{follow.current=true;setPicker(false);c.submit(text,{gesture:true})};
 return <>
  <div className="si-scene-heading"><div><h1>与祀小坐</h1><p role="status">{c.status}</p></div><button type="button" aria-expanded={history} onClick={()=>{setHistory(!history);setPicker(false);first.current=true;follow.current=true}}>{history?'回到祀身边':'聊天记录'}</button></div>
  {!history?<div className="si-companion-scene" aria-label="和祀面对面聊天">
   <div className="si-speech" aria-live="polite" aria-atomic="true"><span className="si-speech-name">祀</span><div className="si-speech-content" ref={speech}>{c.pending?<div className="companion-typing" aria-label="祀正在准备演示回复"><span aria-hidden="true"><i/><i/><i/></span><small>让我想想…</small></div>:<><p key={latestSi.id} className="si-current-reply">{latestSi.text}</p>{latestSi.tool&&<button type="button" className="conversation-tool" onClick={()=>onNavigate(latestSi.tool!)}>{latestSi.tool==='记账'?'打开小账本':'打开待办小笺'}</button>}</>}</div></div>
   <SiCompanion reply={latestSi} pending={c.pending} onGreet={()=>gesture('轻轻戳了戳祀')}/>
   {latestYou&&<div className="si-latest-you"><span>{latestYou.gesture?'你轻轻地':'你说'}</span>{latestYou.sticker?<span className="conversation-sticker" role="img" aria-label={`你发的${expressions.find(e=>e.pose===latestYou.sticker)?.label??''}表情`}><CharacterIcon name={latestYou.sticker}/></span>:<p>{latestYou.text}</p>}</div>}
   <span className="si-scene-caption" aria-hidden="true">茶还热着 · 慢慢聊</span>
  </div>:<div className="conversation-stage"><div className="tea-conversation" role="log" aria-label="与祀的聊天记录" ref={scroll} onScroll={()=>{const n=scroll.current;if(n){follow.current=n.scrollHeight-n.scrollTop-n.clientHeight<65;setAway(!follow.current)}}}>
   {c.messages.map(m=>m.gesture?<p key={m.id} className="conversation-gesture">你{m.text}</p>:<article key={m.id} className={'tea-message '+m.who}><span className="message-name">{m.who==='si'?'祀':'你'}</span>{m.sticker&&m.who==='you'?<span className="conversation-sticker" role="img" aria-label={`你发的${expressions.find(e=>e.pose===m.sticker)?.label??''}表情`}><CharacterIcon name={m.sticker}/></span>:<div className="message-paper">{m.text}</div>}{m.sticker&&m.who==='si'&&<span className="conversation-sticker" role="img" aria-label="祀的回应表情"><CharacterIcon name={m.sticker}/></span>}{m.tool&&<button type="button" className="conversation-tool" onClick={()=>onNavigate(m.tool!)}>{m.tool==='记账'?'打开小账本':'打开待办小笺'}</button>}</article>)}
   {c.pending&&<div className="companion-typing" aria-label="祀正在准备演示回复"><CharacterIcon name={c.mood}/><span aria-hidden="true"><i/><i/><i/></span><small>想了想…</small></div>}
  </div>{away&&<button type="button" className="conversation-latest" onClick={bottom}>回到最新消息</button>}</div>}
  {!history&&<div className="companion-actions" aria-label="和祀互动">{[{pose:'助手',label:'要杯茶',text:'向祀讨了一杯茶'},{pose:'黄历',label:'戳一戳',text:'轻轻戳了戳祀'},{pose:'今日',label:'聊个话题',text:'请祀聊个话题'}].map(a=><button key={a.label} type="button" disabled={c.pending} onClick={()=>gesture(a.text)}><CharacterIcon name={a.pose}/>{a.label}</button>)}</div>}
  {!c.pending&&!picker&&c.followups.length>0&&<div className="chat-prompts conversation-followups" aria-label="接着聊">{c.followups.map(t=><button type="button" key={t} onClick={()=>{c.setDraft(t);input.current?.focus({preventScroll:true})}}>{t}</button>)}</div>}
  {c.error&&<p role="alert" className="conversation-error">{c.error}</p>}
  {picker&&<div className="conversation-expressions" aria-label="选择小表情">{expressions.map(e=><button type="button" key={e.pose} aria-label={`发送${e.label}表情`} disabled={c.pending} onClick={()=>{follow.current=true;c.submit(`[${e.label}]`,{sticker:e.pose});setPicker(false)}}><CharacterIcon name={e.pose}/><span>{e.label}</span></button>)}</div>}
  <form className="tea-composer conversation-composer" onSubmit={e=>{e.preventDefault();send()}}><button type="button" className="conversation-expression-toggle" aria-label={picker?'收起小表情':'打开小表情'} aria-expanded={picker} disabled={c.pending} onClick={()=>setPicker(!picker)}><CharacterIcon name="黄历"/></button><textarea ref={input} rows={1} aria-label="消息" placeholder="说吧，我听着呢…" value={c.draft} onChange={e=>c.setDraft(e.target.value)} onCompositionStart={()=>{composing.current=true}} onCompositionEnd={()=>{composing.current=false}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing&&!composing.current&&e.keyCode!==229){e.preventDefault();send()}}}/>{c.pending?<button type="button" aria-label="停止演示回复" onClick={c.cancel}>停一下</button>:<button type="submit" disabled={!c.draft.trim()} aria-label="发送消息" onPointerDown={e=>{if(e.isPrimary&&e.button===0&&document.activeElement===input.current)e.preventDefault()}}>发送</button>}</form>
 </>;
}
