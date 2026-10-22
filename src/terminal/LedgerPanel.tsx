import {useRecordSettle} from './useRecordSettle';
import {usePageValue} from './pageViewState';
import {useBackLayer} from './useBackLayer';
import {TerminalButton} from './TerminalButton';
import {PaperReceipt} from './PaperReceipt';
import {useLayoutEffect,useRef,useState,type FormEvent} from 'react';
import type {LedgerEntry,LedgerExpenseType} from '@/types';
import {localDateKey,parseMoney,summarizeLedger,validateEntry} from './ledger';
import {groupLedgerDays} from './paperRecords';
import {PaperIcon} from './PaperIcon';
import {SiSceneDoodle} from './SiDoodle';
const categories:Record<LedgerExpenseType,string>={food:'餐饮',transport:'交通',shopping:'购物',fun:'娱乐',home:'居住',study:'学习',other:'其他'};
export function LedgerPanel({entries,onSave,onDelete,visualTheme,budget=0}:{budget?:number;visualTheme?:string;entries:LedgerEntry[];onSave:(entry:LedgerEntry)=>Promise<void>;onDelete:(id:string)=>Promise<void>}){
  const [period,setPeriod]=usePageValue('ledger.month',()=>localDateKey().slice(0,7));const [search,setSearch]=usePageValue('ledger.search','');const [open,setOpen]=useState(false);const [editing,setEditing]=useState<LedgerEntry>();
  const [direction,setDirection]=useState<'expense'|'income'|'adjust'>('expense');const [amount,setAmount]=useState('');const [note,setNote]=useState('');const [date,setDate]=useState(localDateKey());const [type,setType]=useState<LedgerExpenseType>('other');const [channel,setChannel]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const list=useRecordSettle(entries.map(e=>e.id));
  const summary=summarizeLedger(entries,period);
  const remaining=(Math.round(budget*100)-Math.round(summary.expense*100))/100;const budgetPercent=budget>0?Math.min(100,Math.round(summary.expense/budget*100)):0;
  const [saved,setSaved]=useState(false);
  const createButton=useRef<HTMLButtonElement>(null),amountInput=useRef<HTMLInputElement>(null),opener=useRef<HTMLElement|null>(null);
  const restoreOpener=useRef(false);const [editorIntent,setEditorIntent]=useState(0);
  function closeEditor(){restoreOpener.current=true;setOpen(false);}
  useLayoutEffect(()=>{
    if(open){const field=amountInput.current;if(!field)return;field.focus({preventScroll:true});field.scrollIntoView({block:'center',behavior:'instant'});}
    else if(restoreOpener.current){restoreOpener.current=false;const target=opener.current?.isConnected?opener.current:createButton.current;opener.current=target;target?.focus({preventScroll:true});target?.scrollIntoView({block:'nearest',behavior:'instant'});}
  },[open,editorIntent]);
  const filtered=entries.filter(e=>e.date.startsWith(period)&&`${e.note??''}${categories[e.type??'other']??''}${e.channel??''}`.includes(search));
  const groups=groupLedgerDays(filtered);
  const isSi=visualTheme==='si';
  function show(e?:LedgerEntry,origin?:HTMLElement){if(busy)return;opener.current=origin??createButton.current;restoreOpener.current=false;if(open&&editing?.id===e?.id){setEditorIntent(value=>value+1);return;}setSaved(false);setEditing(e);setDirection(e?.direction??'expense');setAmount(e?String(e.amount):'');setNote(e?.note??'');setDate(e?.date??localDateKey());setType(e?.type??'other');setChannel(e?.channel??'');setError('');setOpen(true);setEditorIntent(value=>value+1);}
  async function submit(event:FormEvent){event.preventDefault();setBusy(true);setError('');try{
    const value=direction==='adjust'?Number(amount):parseMoney(amount);
    if(direction==='adjust' && !/^-?\d+(\.\d{1,2})?$/.test(amount))throw new Error('调整金额最多两位小数，可以为负数');
    await onSave(validateEntry({...editing,id:editing?.id??crypto.randomUUID(),direction,amount:value,currency:'CNY',date,note:note.trim(),type,channel:channel.trim(),source:editing?.source??'manual',createdAt:editing?.createdAt??new Date()}));closeEditor();setSaved(true);
  }catch(e){setError(e instanceof Error?e.message:'保存失败');}finally{setBusy(false);}}
  async function remove(id:string){setSaved(false);setBusy(true);try{await onDelete(id);}catch(e){setError(e instanceof Error?e.message:'删除失败');}finally{setBusy(false);}}
  useBackLayer(open,()=>{if(!busy)closeEditor();},opener);
  return <section className="panel ledger-panel"><div className="panel-heading"><h2>记账</h2><TerminalButton ref={createButton} disabled={busy} onClick={event=>show(undefined,event.currentTarget)}>记一笔</TerminalButton></div>{isSi&&<div className="paper-scene ledger-scene"><SiSceneDoodle kind="minghe"/><span className="paper-scene-title">一笔一画，记在这里。</span><span className="paper-seal" aria-hidden="true">账</span></div>}<div className="stat-row"><div><small>记录余额</small><strong>¥{summary.balance.toFixed(2)}</strong></div><div><small>本月支出</small><strong>¥{summary.expense.toFixed(2)}</strong></div><div><small>本月收入</small><strong>¥{summary.income.toFixed(2)}</strong></div></div><p className="muted">余额按已录入流水计算；可用“余额调整”补上期初余额。</p>
    <section className="ledger-budget" aria-label="月度预算" data-over={remaining<0||undefined}><div className="ledger-budget-heading"><h3>{period} · 月度预算</h3><span>{budget>0?remaining<0?`超出 ¥${Math.abs(remaining).toFixed(2)}`:`剩余 ¥${remaining.toFixed(2)}`:'未设置预算'}</span></div>{budget>0?<><div className="ledger-budget-track" role="progressbar" aria-label="预算使用进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={budgetPercent} aria-valuetext={`已支出 ${summary.expense.toFixed(2)} 元，预算 ${budget.toFixed(2)} 元${remaining<0?`，超出 ${Math.abs(remaining).toFixed(2)} 元`:''}`}><span style={{width:`${budgetPercent}%`}}/></div><p>支出 ¥{summary.expense.toFixed(2)} / 预算 ¥{budget.toFixed(2)}</p></>:<p>可在设置中填写月度预算。</p>}</section>
    <div className="filter-row"><label>月份<input type="month" value={period} onChange={e=>setPeriod(e.target.value)}/></label><label>搜索流水<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="备注或分类"/></label></div>
    {saved&&(isSi?<PaperReceipt kind="ledger"/>:<p className="paper-save-feedback" role="status">已记入账簿</p>)}{error&&<p className="error" role="alert">{error}</p>}
    {open&&<form className="terminal-form" aria-label={editing?'编辑流水':'新增流水'} onSubmit={submit}>{isSi&&<h3><PaperIcon kind="study"/>{editing?'改一笔':'添一笔'}</h3>}<label>方向<select aria-label="方向" value={direction} onChange={e=>setDirection(e.target.value as typeof direction)}><option value="expense">支出</option><option value="income">收入</option><option value="adjust">余额调整</option></select></label><label>金额<input ref={amountInput} required inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00"/></label><label>日期<input required type="date" min="1900-01-01" max="2100-12-31" value={date} onChange={e=>setDate(e.target.value)}/></label><label>分类<select aria-label="分类" value={type} onChange={e=>setType(e.target.value as LedgerExpenseType)}>{Object.entries(categories).map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label><label>渠道／账户<input value={channel} onChange={e=>setChannel(e.target.value)} placeholder="微信、支付宝、现金…"/></label><label>备注<input maxLength={2000} value={note} onChange={e=>setNote(e.target.value)}/></label><div className="button-row"><TerminalButton disabled={busy} busy={busy} type="submit">保存流水</TerminalButton><TerminalButton type="button" disabled={busy} onClick={closeEditor}>取消</TerminalButton></div></form>}
    <div className="ledger-list" ref={list}>{groups.map(group=><section className="ledger-day" key={group.date} aria-label={`${group.date}流水`}>
      <h3 className="paper-day-heading"><time dateTime={group.date}>{group.date}</time><span>{group.entries.length} 笔</span></h3>
      {group.entries.map(e=><article className="ledger-item" data-record-id={e.id} key={e.id}>
        <div className="ledger-entry-name">{isSi&&<PaperIcon kind={e.direction==='income'?'income':e.direction==='adjust'?'adjust':e.type??'other'}/>}<div><h3>{e.note||categories[e.type??'other']||'流水'}</h3><small>{e.direction==='income'?'收入':e.direction==='adjust'?'调整':categories[e.type??'other']} {e.channel&&`· ${e.channel}`}</small></div></div>
        <strong className={e.direction==='expense'?'expense':'income'}>{e.direction==='expense'?'-':e.amount<0?'-':'+'}¥{Math.abs(e.amount).toFixed(2)}</strong>
        <div className="button-row"><TerminalButton disabled={busy} aria-label={`编辑${e.note||'流水'}`} onClick={event=>show(e,event.currentTarget)}>编辑</TerminalButton><TerminalButton disabled={busy} className="danger" onClick={()=>void remove(e.id)}>删除</TerminalButton></div>
      </article>)}
    </section>)}</div>{!filtered.length&&<div className="empty-state">{isSi&&<PaperIcon kind="study"/>}<h3>{search?'没有找到这笔流水':'账页还是空的'}</h3><p>{search?'换个备注或分类试试。':'这个月还没有流水，记下第一笔吧。'}</p></div>}

  </section>;
}
