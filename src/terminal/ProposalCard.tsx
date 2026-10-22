import {useContentSwap} from './panelMotion';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import type {Proposal} from './assistant';
import {applyProposalDraft,type ProposalFields} from './proposalDraft';
import {TerminalButton} from './TerminalButton';
import {PaperIcon} from './PaperIcon';
import {useBackLayer} from './useBackLayer';
import {SaveSeal} from './SaveSeal';
const repeats={none:'单次',daily:'每天',weekly:'每周',monthly:'每月',yearly:'每年'};
const categories={food:'餐饮',transport:'交通',shopping:'购物',fun:'娱乐',home:'居住',study:'学习',other:'其他'};
function CreationProposalCard({proposal,status,onConfirm,onEdit,onIgnore,locked=false,errorMessage,draft,onDraft,animateSaved=true}:{proposal:Exclude<Proposal,{kind:'manage'}>;status?:string;onConfirm:()=>void;onEdit:(next:Proposal)=>void|Promise<void>;draft?:ProposalFields;onDraft?:(fields:ProposalFields|undefined)=>Promise<void>;animateSaved?:boolean;onIgnore:()=>void;locked?:boolean;errorMessage?:string}){
 const [editing,setEditing]=useState(false);const [fields,setFields]=useState<ProposalFields>({});const [error,setError]=useState('');
 const modify=useRef<HTMLButtonElement>(null);const form=useRef<HTMLFormElement>(null);
 const body=useRef<HTMLDivElement>(null);const prepare=useContentSwap(body,editing);
 const wasEditing=useRef(false);
 const saving=status==='保存中…';const done=status==='已保存';const ignored=status==='已忽略';
 const noun=proposal.kind==='ledger'?'流水':proposal.kind==='reminder'?'提醒':'备忘';
 const set=(name:keyof ProposalFields,value:string)=>{const next={...fields,[name]:value};setFields(next);void onDraft?.(next).catch(()=>setError('草稿未能保存，请重试'));};
 const cancel=()=>{prepare();setEditing(false);setError('');void onDraft?.(undefined).catch(()=>setError('草稿未能清除'));};
 useBackLayer(editing,cancel);
 useEffect(()=>{
  if(editing)form.current?.querySelector<HTMLElement>('input,textarea,select')?.focus({preventScroll:true});
  else if(wasEditing.current)modify.current?.focus({preventScroll:true});
  wasEditing.current=editing;
 },[editing]);
 async function submit(e:FormEvent){e.preventDefault();if(locked||saving||done||ignored)return;try{await onEdit(applyProposalDraft(proposal,fields));prepare();setEditing(false);setError('');}catch(e){setError(e instanceof Error?e.message:'请检查填写的内容');}}
 const value=(name:keyof ProposalFields,fallback:string)=>fields[name]??fallback;
 return <article className="proposal" data-state={done?'saved':ignored?'ignored':saving?'saving':errorMessage?'error':'pending'} aria-busy={saving}>
  <div className="proposal-heading"><PaperIcon kind={proposal.kind==='ledger'?'study':proposal.kind==='reminder'?'bell':'study'}/><h3>{done?'已保存':ignored?'已忽略':editing?'修改':errorMessage?'未保存':'待确认'}{noun}</h3></div>
  <div ref={body} className="proposal-body">{editing?<form ref={form} className="proposal-editor" aria-label={`修改${noun}`} onSubmit={submit}>
   {proposal.kind==='ledger'&&<><div className="proposal-field-pair"><label>方向<select aria-label="方向" value={value('direction',proposal.direction)} onChange={e=>set('direction',e.target.value)}><option value="expense">支出</option><option value="income">收入</option></select></label><label>金额<input required inputMode="decimal" value={value('amount',String(proposal.amount))} onChange={e=>set('amount',e.target.value)}/></label></div><label>日期<input required type="date" min="1900-01-01" max="2100-12-31" value={value('date',proposal.date)} onChange={e=>set('date',e.target.value)}/></label><label>分类<select aria-label="分类" value={value('type',proposal.type??'other')} onChange={e=>set('type',e.target.value)}>{Object.entries(categories).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label><label>备注<input maxLength={2000} value={value('note',proposal.note??'')} onChange={e=>set('note',e.target.value)}/></label></>}
   {proposal.kind==='reminder'&&<><label>事项<input required maxLength={200} value={value('title',proposal.title)} onChange={e=>set('title',e.target.value)}/></label><label>日期与时间<input required type="datetime-local" min="1900-01-01T00:00" max="2100-12-31T23:59" value={value('at',proposal.at)} onChange={e=>set('at',e.target.value)}/></label><label>重复<select aria-label="重复" value={value('repeat',proposal.repeat)} onChange={e=>set('repeat',e.target.value)}>{Object.entries(repeats).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label></>}
   {proposal.kind==='note'&&<label>备忘内容<textarea aria-label="备忘内容" required rows={3} maxLength={10000} value={value('text',proposal.text)} onChange={e=>set('text',e.target.value)}/></label>}
   {error&&<p className="error" role="alert">{error}</p>}
   <div className="button-row"><TerminalButton type="submit" tone="primary" disabled={locked}>应用修改</TerminalButton><TerminalButton type="button" onClick={cancel}>取消修改</TerminalButton></div>
  </form>:<>
   {proposal.kind==='ledger'?<dl className="proposal-facts"><div><dt>{proposal.direction==='expense'?'支出':'收入'}</dt><dd className="proposal-money">¥{proposal.amount.toFixed(2)}</dd></div><div><dt>日期</dt><dd>{proposal.date}</dd></div><div><dt>分类</dt><dd>{categories[proposal.type as keyof typeof categories]??'其他'}</dd></div>{proposal.note&&<div><dt>备注</dt><dd>{proposal.note}</dd></div>}</dl>:proposal.kind==='reminder'?<dl className="proposal-facts"><div><dt>事项</dt><dd>{proposal.title}</dd></div><div><dt>时间</dt><dd>{proposal.at.replace('T',' ')}</dd></div><div><dt>重复</dt><dd>{repeats[proposal.repeat]}</dd></div></dl>:<p className="proposal-note">{proposal.text}</p>}
   {errorMessage&&!ignored&&<p className="error proposal-save-error" role="alert">{errorMessage}</p>}
   {done?<SaveSeal animate={animateSaved}/>:ignored?<span className="muted">已忽略</span>:<div className="button-row"><TerminalButton type="button" tone="primary" busy={saving} disabled={locked} onClick={onConfirm}>确认保存</TerminalButton><TerminalButton type="button" ref={modify} disabled={saving||locked} onClick={()=>{prepare();setFields(draft??{});setError('');setEditing(true);}}>修改</TerminalButton><TerminalButton type="button" disabled={saving||locked} onClick={onIgnore}>忽略</TerminalButton></div>}
  </>}</div>
 </article>;
}

export function ProposalCard(props:Omit<Parameters<typeof CreationProposalCard>[0],'proposal'>&{proposal:Proposal}){
 const a=props.proposal;if(a.kind!=='manage')return <CreationProposalCard {...props} proposal={a}/>;
 const done=props.status==='已保存',ignored=props.status==='已忽略',saving=props.status==='保存中…';const operation=a.operation==='delete'?'删除':'修改';const noun=a.target==='ledger'?'流水':a.target==='reminder'?'提醒':'备忘';const value=a.value;
 return <article className="proposal" data-state={done?'saved':ignored?'ignored':props.errorMessage?'error':'pending'} aria-busy={saving}><div className="proposal-heading"><PaperIcon kind={a.target==='reminder'?'bell':'study'}/><h3>{done?'已':ignored?'已忽略':'待确认'}{operation}{noun}</h3></div><p className="proposal-note">{a.label}</p>{value&&<p className="proposal-note">改为：{value.kind==='ledger'?`${value.date} · ${value.direction==='expense'?'支出':'收入'} ¥${value.amount.toFixed(2)} · ${value.note??''}`:value.kind==='reminder'?`${value.title} · ${value.at.replace('T',' ')} · ${repeats[value.repeat]}`:value.text}</p>}{a.enabled!==undefined&&<p>{a.enabled?'启用整个提醒系列':'暂停整个提醒系列'}</p>}{!a.unique&&<p>存在多条匹配记录，请先核对这条是否正确。</p>}{props.errorMessage&&<p role="alert" className="error proposal-save-error">{props.errorMessage}</p>}{done?<span role="status" className="proposal-saved-seal">已{operation}</span>:ignored?<span>已忽略</span>:<div className="button-row"><TerminalButton disabled={props.locked||saving} busy={saving} tone={a.operation==='delete'?'danger':'primary'} onClick={props.onConfirm}>确认{operation}</TerminalButton><TerminalButton disabled={props.locked||saving} onClick={props.onIgnore}>忽略</TerminalButton></div>}</article>;
}
