import {executionInstruction} from './executionInstruction';
import {createAssistantTools} from './assistantTools';
import {AnimatedPanel} from './panelMotion';
import {useChatHistory} from './useChatHistory';
import {readMessagePage} from './chatHistory';
import {registerActionBatch,patchActionBatch} from './data';
import type {ActionChange} from './actionBatch';
import {compactActionSummary} from './receiptPresentation';
import {useConversationView} from './useConversationView';
import {ProposalCard} from './ProposalCard';
import {useBackLayer} from './useBackLayer';
import {TerminalButton} from './TerminalButton';
import {Fragment,useEffect,useRef,useState,type FormEvent} from 'react';
import type {AIConfig} from '@/utils/aiClient';
import {getCharacterProfile} from './characterProfiles';
import {SiStickerPicker} from './SiStickerPicker';
import {SiAssistantScene} from './SiAssistantScene';
import {SiPresence} from './SiPresence';
import {askAssistant,assistantConfigured,type Proposal} from './assistant';
import type {Message,VisualTheme} from './ledger';
import {executeAssistantActions} from './assistantExecution';
import {StickerMessage} from './StickerMessage';
import {StickerPicker} from './StickerPicker';
import {FangyiPresence} from './FangyiPresence';
import {AIModeControl} from './AIModeControl';
import type {AIMode} from './aiProfiles';
export function AssistantPanel({config,context,messages:providedMessages,onMessage,onConfirm,character='fangyi',companionMode=false,historyReady:providedReady,modelMode='api',onModelModeChange}:{companionMode?:boolean;modelMode?:AIMode;onModelModeChange?:(mode:AIMode)=>Promise<void>;historyReady?:boolean;character?:VisualTheme;config:AIConfig|undefined;context:string|(()=>string);messages?:Message[];onMessage:(message:Message)=>Promise<void>;onConfirm:(proposal:Proposal,operationId?:string,signal?:AbortSignal)=>Promise<string|void>}){
  const characterPersona=getCharacterProfile(character);
  const isSi=character==='si';
  const sceneMode=isSi&&companionMode;
  const [historyOpen,setHistoryOpen]=useState(false);
  const shortName=isSi?'祀':'方宜';
  const history=useChatHistory(character,providedMessages===undefined);
  const messages=providedMessages??history.messages;const historyReady=providedReady??(providedMessages!==undefined?true:history.ready);
  const conversation=useConversationView(character,messages,historyReady,providedMessages?undefined:history,!sceneMode||historyOpen);
  const actionMessages=[...new Map([...messages,...history.pending].filter(m=>m.actionBatch).map(m=>[m.id,m])).values()].sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id));
  const {text,setText,log,shown,unread}=conversation;
  const [busy,setBusy]=useState(false);const [activity,setActivity]=useState('正在想一想…');const [error,setError]=useState('');const ctrl=useRef<AbortController>();const mounted=useRef(true);const inFlight=useRef(new Set<string>());const [savingId,setSavingId]=useState('');const [freshSaved,setFreshSaved]=useState<Set<string>>(()=>new Set());const [newSent,setNewSent]=useState('');const [newReply,setNewReply]=useState('');const [newStickerReply,setNewStickerReply]=useState('');const [preview,setPreview]=useState<string>();const [savingAction,setSavingAction]=useState(false);
  const manualCtrl=useRef<AbortController>();
  const [switching,setSwitching]=useState(false);
  // Keep the short save gesture, then leave only the durable chat receipt.
  useEffect(()=>{if(!freshSaved.size)return;const timer=setTimeout(()=>setFreshSaved(new Set()),1400);return()=>clearTimeout(timer);},[freshSaved]);
  const showAction=(message:Message,index:number)=>{const batch=message.actionBatch!;const state=batch.states[index];const id=`ai-${message.id}-${index}`;return state!=='已保存'&&state!=='已忽略'||!!batch.errors[index]||savingId===id||freshSaved.has(id);};
  const visibleActionMessages=actionMessages.filter(message=>message.actionBatch!.actions.some((_,index)=>showAction(message,index)));
  useEffect(()=>{ctrl.current?.abort();manualCtrl.current?.abort();},[config?.baseUrl,config?.apiKey,config?.model,config?.protocol]);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;ctrl.current?.abort();manualCtrl.current?.abort();};},[]);
  async function submit(e?:FormEvent,quickText?:string){e?.preventDefault();const originalText=quickText??text;if(!originalText.trim()||busy||switching||inFlight.current.size)return;const input=originalText.trim();setBusy(true);setActivity('正在想一想…');setError('');const controller=new AbortController();ctrl.current=controller;try{
    const requestId=crypto.randomUUID();await onMessage({id:requestId,role:'user',text:input,createdAt:new Date().toISOString()});conversation.consumeDraft(originalText);if(mounted.current)setNewSent(requestId);
    if(controller.signal.aborted||!mounted.current)return;
    const modelHistory=providedMessages??(await readMessagePage(character,undefined,21)).filter(m=>m.id!==requestId).slice(-20);
    const tools=createAssistantTools(controller.signal);tools.onProgress=message=>{if(mounted.current)setActivity(message);};
    const reply=await askAssistant(input,config,typeof context==='function'?context():context,modelHistory.map(m=>({role:m.role,content:isSi&&m.role==='assistant'&&m.performance?JSON.stringify({reply:m.text,actions:[],performance:m.performance}):m.text})),controller.signal,undefined,character,tools);
    if(controller.signal.aborted||!mounted.current)return;
    const actions=reply.actions.length?await registerActionBatch(requestId,reply.actions):[];
    const instruction=assistantConfigured(config)?executionInstruction(input,modelHistory):input;
    const result=await executeAssistantActions(instruction,actions,requestId,onConfirm,controller.signal,new Date(),assistantConfigured(config)?'model':'local');
    if(controller.signal.aborted&&!result.receipts.length)return;
    const remaining=result.actions.some((_,i)=>!result.states[i]);
    const answer=result.actions.length?`${isSi?'好，交给终端处理。':'管理员，收到。'}\n${result.receipts.join('\n')}${remaining?'\n还有待核对的事项，请确认下面的内容。':''}`:reply.reply;
    const id=crypto.randomUUID();const lastSticker=[...modelHistory].reverse().find(m=>m.role==='assistant')?.stickerId;
    const stickerId=reply.stickerId!==lastSticker?reply.stickerId:undefined;
    for(const [index] of result.actions.entries())await patchActionBatch(requestId,index,{kind:'result',state:result.states[index],error:result.errors[index]});
    if(mounted.current)setFreshSaved(new Set(result.actions.flatMap((_,index)=>result.states[index]==='已保存'?[`ai-${requestId}-${index}`]:[])));
    try{
      await onMessage({id,role:'assistant',text:answer,...(compactActionSummary(result.actions,result.states)?{receiptSummary:compactActionSummary(result.actions,result.states)}:{}),createdAt:new Date().toISOString(),...(stickerId?{stickerId}:{}),...(isSi&&!result.actions.length&&reply.performance?{performance:reply.performance}:{})});
      if(mounted.current){setNewReply(id);setNewStickerReply(id);}
    }catch(e){
      if(!result.actions.length)throw e;
      if(mounted.current){
        const errors={...result.errors};let reported=false;
        result.actions.forEach((_,index)=>{if(result.states[index]==='已忽略')return;reported=true;errors[index]=result.states[index]==='已保存'?'事项已保存，聊天回执未能写入；可到对应页面查看。':`${errors[index]||'事项尚未保存。'}\n聊天回复未能保存，请核对后再操作。`;});
        if(reported){for(const [key,message] of Object.entries(errors))await patchActionBatch(requestId,Number(key),{kind:'error',message});}else setError(e instanceof Error?e.message:'聊天回复未能保存');
      }
    }
  }catch(e){if(mounted.current&&!controller.signal.aborted)setError(e instanceof Error && e.name==='AbortError'?'已停止':e instanceof Error?e.message:'助手暂时不可用');}finally{if(mounted.current&&ctrl.current===controller)setBusy(false);}}
  async function change(requestId:string,index:number,change:ActionChange){
    if(inFlight.current.size)return;
    try{await patchActionBatch(requestId,index,change);}catch(e){setError(e instanceof Error?e.message:'修改未能保存，请重试');throw e;}
  }
  async function confirm(a:Proposal,index:number,requestId:string){
    const id=`ai-${requestId}-${index}`;
    if(inFlight.current.size)return;
    inFlight.current.add(id);setSavingId(id);setSavingAction(true);setError('');
    const controller=new AbortController();manualCtrl.current=controller;let committed=false;
    try{
      const receipt=await onConfirm(a,id,controller.signal);committed=true;
      if(mounted.current)setFreshSaved(current=>new Set([...current,id]));
      await onMessage({id:`receipt-${id}`,role:'assistant',text:receipt||'已保存。',...(a.kind==='ledger'?{receiptSummary:'已记入账簿。'}:{}),createdAt:new Date().toISOString()});
    }catch(e){
      const message=committed?'事项已保存，聊天回执未能写入；可到对应页面查看。':e instanceof Error?e.message:'保存失败，请重试';
      try{await patchActionBatch(requestId,index,{kind:'error',message});}catch{if(mounted.current)setError(message);}
    }finally{inFlight.current.delete(id);if(manualCtrl.current===controller)manualCtrl.current=undefined;if(mounted.current){setSavingAction(false);setSavingId('');}}
  }
  const [drawer,setDrawer]=useState(false);
  const [expression,setExpression]=useState<'working'|'peek'>();
  const [reducedMotion,setReducedMotion]=useState(false);
  const [foreground,setForeground]=useState(()=>typeof document==='undefined'||!document.hidden);
  const composer=useRef<HTMLTextAreaElement>(null);
  useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReducedMotion(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  useEffect(()=>{const update=()=>setForeground(!document.hidden);document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
  useEffect(()=>{if(!newSent)return;if(reducedMotion||!foreground){setNewSent('');return;}const timer=window.setTimeout(()=>setNewSent(''),220);return()=>window.clearTimeout(timer);},[newSent,reducedMotion,foreground]);
  useEffect(()=>{if(!newReply)return;if(reducedMotion||!foreground){setNewReply('');return;}const timer=window.setTimeout(()=>setNewReply(''),460);return()=>window.clearTimeout(timer);},[newReply,reducedMotion,foreground]);
  useEffect(()=>{if(!expression)return;const timer=window.setTimeout(()=>setExpression(undefined),5000);return()=>window.clearTimeout(timer);},[expression]);
  useEffect(()=>conversation.refresh(),[busy,messages,expression,drawer,preview]);
  useBackLayer(!!preview,()=>setPreview(undefined));
  useBackLayer(!!expression,()=>setExpression(undefined));
  useBackLayer(drawer,()=>setDrawer(false));
  useBackLayer(sceneMode&&historyOpen,()=>setHistoryOpen(false));
  useEffect(()=>{if(historyOpen)conversation.refresh()},[historyOpen]);
  const day=(value:string)=>{const date=new Date(value);return Number.isNaN(date.getTime())?'历史消息':date.toLocaleDateString('zh-CN',{month:'long',day:'numeric'});};
  const clock=(value:string)=>{const date=new Date(value);return Number.isNaN(date.getTime())?'':date.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});};
  const avatar=<img className="fangyi-message-avatar" src={characterPersona.avatar} alt="" width="36" height="36"/>;
  const userAvatar=<span className="admin-message-avatar" role="img" aria-label="你的头像"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2z"/></svg></span>;
  async function switchModel(mode:AIMode){if(!onModelModeChange||busy||savingAction||switching||inFlight.current.size)return;setSwitching(true);setError('');try{await onModelModeChange(mode);}catch(e){setError(e instanceof Error?e.message:'切换失败，请重试');}finally{setSwitching(false);}}
  return <section className={`panel assistant-chat${sceneMode?' si-character-chat':''}${sceneMode&&!historyOpen?' is-character-scene':''}`} data-motion-paused={reducedMotion||!foreground||undefined} aria-label={`与${characterPersona.name}的对话`}>
    {onModelModeChange&&<div className="ai-source-bar"><AIModeControl value={modelMode} disabled={busy||savingAction||switching} onChange={mode=>void switchModel(mode)}/><span className="ai-source-caption" title={config?.model}>{assistantConfigured(config)?config.model:'尚未配置'}</span></div>}
    {sceneMode?<header className="si-live-heading"><h2>茶馆闲话</h2><button type="button" aria-expanded={historyOpen} onClick={()=>{setDrawer(false);setPreview(undefined);setHistoryOpen(!historyOpen)}}>{historyOpen?'回到茶桌':'往日对话'}</button></header>:<header className="fangyi-contact" data-busy={busy}>
      <div className="fangyi-contact-copy"><h2>{characterPersona.name}</h2>{assistantConfigured(config)&&<span className="chat-link-status" aria-label="AI 接口已配置">已配置</span>}</div>
      {isSi?<SiPresence busy={busy}/>:<FangyiPresence busy={busy}/>}
    </header>}
    {sceneMode&&!historyOpen&&<SiAssistantScene messages={providedMessages} freshReply={newStickerReply} arrivingReply={newReply} busy={busy} activity={activity} greeting={characterPersona.greeting} onInteract={value=>void submit(undefined,value)}/>}
    <div className="chat-log" ref={sceneMode&&!historyOpen?undefined:log} role={sceneMode&&!historyOpen?'region':'log'} aria-label={sceneMode&&!historyOpen?'待确认事项和表情':'聊天记录'} aria-live="polite" onScroll={conversation.onScroll}>
      {(!sceneMode||historyOpen)&&<>
      {historyReady&&messages.length===0&&<><article className="chat-message assistant">{avatar}<div className="chat-message-content"><small>{characterPersona.name}</small><div className="chat-bubble"><p>{characterPersona.greeting}</p></div></div></article></>}
      {historyReady&&messages.length===0&&<div className="chat-starters" role="group" aria-label="找个话题"><p>找个话题</p><div>{[
        ['随便聊聊','今天想和你随便聊聊。'],['分享好消息','今天有件挺开心的事，想跟你说说。'],['理一理思路','我有个想法，想听听你的看法。'],
      ].map(([label,draft])=><TerminalButton key={label} type="button" disabled={!!text.trim()||busy} onClick={()=>{if(text.trim()||busy)return;setText(draft);composer.current?.focus();}}>{label}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 5l5 5-5 5"/></svg></TerminalButton>)}</div></div>}
      {!historyReady&&<p role="status" className="chat-history-status">正在读取聊天记录…</p>}
      {history.error&&<p role="alert" className="error">{history.error}<TerminalButton type="button" onClick={history.retry}>重试读取</TerminalButton></p>}
      {conversation.hasEarlier&&<TerminalButton disabled={history.loading} type="button" className="chat-history-more" onClick={conversation.earlier}>查看更早的消息</TerminalButton>}
      {shown.map((m,index)=><Fragment key={m.id}>{(index===0||day(shown[index-1].createdAt)!==day(m.createdAt))&&<div className="chat-day-separator">{day(m.createdAt)}</div>}<article className={`chat-message ${m.role}`} data-message-id={m.id} data-arrival={m.id===newReply} data-sent={m.id===newSent}>{m.role==='assistant'?avatar:userAvatar}<div className="chat-message-content"><small>{m.role==='user'?'你':characterPersona.name}</small><div className="chat-bubble"><p>{m.receiptSummary??m.text}</p>{m.receiptSummary&&<details className="chat-receipt-detail"><summary>查看完整回执</summary><p>{m.text}</p></details>}</div>{m.stickerId&&<StickerMessage stickerId={m.stickerId} character={character} autoPlay={m.id===newStickerReply}/>}<time dateTime={m.createdAt}>{clock(m.createdAt)}</time></div></article></Fragment>)}
      {busy&&<article className="chat-message assistant">{avatar}<div className="chat-message-content"><small>{characterPersona.name}</small><div className="chat-bubble chat-thinking" role="status">{activity}<svg className="chat-thinking-dots" viewBox="0 0 30 12" aria-hidden="true"><circle cx="5" cy="6" r="2.1"/><circle cx="15" cy="6" r="1.9"/><circle cx="25" cy="6" r="2.2"/></svg></div></div></article>}
      </>}
      {preview&&<div className="sticker-preview" role="group" aria-label="表情预览"><StickerMessage key={preview} stickerId={preview} character={character} autoPlay/>{isSi&&<TerminalButton type="button" className="sticker-preview-close" aria-label="收起表情预览" onClick={()=>setPreview(undefined)}>收起</TerminalButton>}</div>}
      {!isSi&&expression&&<article className="chat-expression"><img src={isSi?(expression==='working'?'/themes/si/painted-mountains.webp':'/characters/ink-spirit-number-one.webp'):reducedMotion?characterPersona.avatar:`/characters/fangyi-${expression==='working'?'working':'peek'}.gif`} alt={isSi?(expression==='working'?'祀的山水画':'墨魉探头'):expression==='working'?'方宜忙碌表情':'方宜探头表情'} width="136" height="136"/><div><p>{isSi?'预览将在 5 秒后收起。':reducedMotion?'已开启减少动态效果，显示静态头像。':'表情将在 5 秒后停止。'}</p><TerminalButton type="button" aria-label="停止表情" onClick={()=>setExpression(undefined)}><svg className="expression-stop-icon" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="3" width="10" height="10" rx="1"/></svg></TerminalButton></div></article>}
      {error&&<p role="alert" className="error">{error}</p>}
      {visibleActionMessages.map(m=><div key={`batch-${m.id}`} className="chat-action-batch" data-request-id={m.id}>{m.actionBatch!.actions.map((a,i)=>{
        if(!showAction(m,i))return null;
        const id=`ai-${m.id}-${i}`;const b=m.actionBatch!;
        return <ProposalCard key={id} proposal={a} status={savingId===id?'保存中…':b.states[i]} errorMessage={b.errors[i]} draft={b.drafts[i]} animateSaved={freshSaved.has(id)} locked={savingAction||busy} onConfirm={()=>void confirm(a,i,m.id)} onEdit={proposal=>change(m.id,i,{kind:'edit',proposal})} onDraft={fields=>change(m.id,i,{kind:'draft',fields})} onIgnore={()=>void change(m.id,i,{kind:'ignore'}).catch(()=>{})}/>;
      })}</div>)}
    <AnimatedPanel open={drawer} onLayout={conversation.refresh}><div className="fangyi-expression-drawer" aria-label={`${shortName}表情选择`}>{!isSi&&<div className="expression-choices"><TerminalButton type="button" aria-label={isSi?'看看山水画':'播放忙碌表情'} onClick={()=>setExpression('working')}><span>{isSi?'看画':'忙碌中'}</span><small>{isSi?'预览 5 秒':'播放 5 秒'}</small></TerminalButton><TerminalButton type="button" aria-label={isSi?'叫墨魉来':'播放探头表情'} onClick={()=>setExpression('peek')}><span>{isSi?'墨魉':'探个头'}</span><small>{isSi?'预览 5 秒':'播放 5 秒'}</small></TerminalButton></div>}{isSi?<SiStickerPicker disabled={busy} onSelect={id=>{setPreview(id);setDrawer(false);}} onKaomoji={face=>{if(busy)return;setText(current=>{const next=`${current}${current&&!/\s$/.test(current)?' ':''}${face}`;return next.length<=6000?next:current;});setDrawer(false);composer.current?.focus();}}/>:<><StickerPicker onSelect={id=>{setPreview(id);setDrawer(false);}}/><p>表情来源：<a href="https://www.bilibili.com/opus/1193389820389359623" target="_blank" rel="noreferrer">夏雪NazuYuki · Bilibili</a></p></>}</div></AnimatedPanel>
    </div>
    {(!sceneMode||historyOpen)&&(unread||history.hasNewer)&&<TerminalButton type="button" className="chat-latest" onClick={conversation.latestMessage}>最新消息</TerminalButton>}

    <form className="assistant-composer" onSubmit={submit}>
      <TerminalButton className="expression-toggle" type="button" onPointerDown={event=>{if(isSi&&document.activeElement===composer.current)event.preventDefault();}} aria-label={`${shortName}表情`} aria-expanded={drawer} onClick={()=>setDrawer(!drawer)}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M8 14c1 4 7 4 8 0M8 9h.01M16 9h.01" strokeLinecap="round"/></svg></TerminalButton>
      <textarea ref={composer} aria-label={`和${shortName}说说`} maxLength={6000} value={text} onChange={e=>setText(e.target.value)} placeholder={`和${shortName}说说…`} rows={2}/>
      {busy?<TerminalButton type="button" className="send-message" onPointerDown={event=>{if(event.button===0&&document.activeElement===composer.current)event.preventDefault();}} onClick={()=>ctrl.current?.abort()}><span>停止</span></TerminalButton>:<TerminalButton type="submit" className="send-message" onPointerDown={event=>{if(event.button===0&&document.activeElement===composer.current)event.preventDefault();}} disabled={!text.trim()||savingAction||switching}><span>发送</span></TerminalButton>}
    </form>
  </section>;
}

