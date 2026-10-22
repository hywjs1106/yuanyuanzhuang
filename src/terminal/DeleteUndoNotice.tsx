import {useEffect,useRef,useState} from 'react';import {useLiveQuery} from 'dexie-react-hooks';import {terminalDb} from './data';import {undoDeleted} from './deleteUndo';import {TerminalButton} from './TerminalButton';
export function DeleteUndoNotice(){
 const rows=useLiveQuery(()=>terminalDb.deleted.orderBy('expiresAt').toArray(),[],[]);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const lock=useRef(false);
 useEffect(()=>{setError('');if(!rows?.length)return;const purge=()=>{void terminalDb.deleted.where('expiresAt').belowOrEqual(Date.now()).delete().catch(()=>{});};const timer=window.setTimeout(purge,Math.max(0,rows[0].expiresAt-Date.now())+10);document.addEventListener('visibilitychange',purge);return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',purge);};},[rows]);
 if(!rows?.length)return null;
 return <aside className="delete-undo" aria-label="删除后撤销"><p role="status">已删除 {rows.length} 项</p>{error&&<p role="alert">{error}</p>}<TerminalButton aria-label="撤销删除" disabled={busy} busy={busy} onClick={()=>{if(lock.current)return;lock.current=true;setBusy(true);void undoDeleted().catch(e=>setError(e instanceof Error?e.message:'撤销失败，请重试')).finally(()=>{lock.current=false;setBusy(false);});}}>撤销</TerminalButton></aside>;
}
