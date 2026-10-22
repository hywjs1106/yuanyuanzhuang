import {useBackLayer} from './useBackLayer';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import type {TerminalSettings} from './ledger';
import {MEMORY_LIMIT,MEMORY_TEXT_LIMIT,type AssistantMemory} from './assistantMemory';
import {updateAssistantMemory} from './data';
import {TerminalButton} from './TerminalButton';
import {PaperIcon} from './PaperIcon';

export function AssistantMemoryPanel({settings}:{settings:TerminalSettings}){
  const [text,setText]=useState('');const [editing,setEditing]=useState<string>();
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [status,setStatus]=useState('');
  const [enabled,setEnabled]=useState(settings.assistantMemoryEnabled!==false);
  useEffect(()=>setEnabled(settings.assistantMemoryEnabled!==false),[settings.assistantMemoryEnabled]);
  const locked=useRef(false);const field=useRef<HTMLTextAreaElement>(null);
  const rows=settings.assistantMemories??[];
  async function run(action:()=>Promise<void>,message:string){
    if(locked.current)return;locked.current=true;setBusy(true);setError('');setStatus('');
    try{await action();setStatus(message);}catch(e){setError(e instanceof Error?e.message:'保存失败，请重试');}
    finally{locked.current=false;setBusy(false);}
  }
  async function submit(e:FormEvent){e.preventDefault();await run(async()=>{
    const memory:AssistantMemory={id:editing??crypto.randomUUID(),text,updatedAt:new Date().toISOString()};
    await updateAssistantMemory({kind:'put',memory});setText('');setEditing(undefined);
  },editing?'记忆已修改':'这件事记下了');}
  function edit(memory:AssistantMemory){setEditing(memory.id);setText(memory.text);setError('');setStatus('');field.current?.focus();}
  useBackLayer(!!editing,()=>{if(!busy){setEditing(undefined);setText('');setError('');}});
  return <section className="settings-section assistant-memory" aria-labelledby="assistant-memory-title" aria-busy={busy}>
    <div className="memory-heading"><PaperIcon kind="assistant"/><h3 id="assistant-memory-title">角色记忆</h3><small>{rows.length} / {MEMORY_LIMIT}</small></div>
    <p className="muted">留一点关于你的事：口味、习惯，或者喜欢怎样被陪伴。</p>
    <label className="toggle-label"><input type="checkbox" checked={enabled} disabled={busy} onChange={e=>{const next=e.target.checked;setEnabled(next);void run(async()=>{try{await updateAssistantMemory({kind:'enabled',enabled:next});}catch(e){setEnabled(!next);throw e;}},next?'已启用角色记忆':'已暂停使用，记忆仍保留');}}/>在 AI 对话中使用这些记忆</label>
    {rows.length?<ul className="memory-list">{rows.map(memory=><li key={memory.id} data-editing={editing===memory.id||undefined}><p>{memory.text}</p><div className="button-row"><TerminalButton type="button" disabled={busy} onClick={()=>edit(memory)}>修改</TerminalButton><TerminalButton type="button" tone="danger" className="danger" disabled={busy} onClick={()=>void run(async()=>{await updateAssistantMemory({kind:'delete',id:memory.id});if(editing===memory.id){setEditing(undefined);setText('');}},'已删除这条记忆')}>删除</TerminalButton></div></li>)}</ul>:<p className="memory-empty">还没有记下的偏好。写一句就好。</p>}
    <form className="memory-form" onSubmit={submit}>
      <label htmlFor="assistant-memory-text">想让助手记住的事</label>
      <textarea id="assistant-memory-text" ref={field} value={text} onChange={e=>setText(e.target.value)} maxLength={MEMORY_TEXT_LIMIT} rows={3} placeholder="例如：我喜欢热茶，不喝咖啡" disabled={busy} aria-describedby="memory-counter"/>
      <small id="memory-counter" className="memory-counter">{text.length} / {MEMORY_TEXT_LIMIT}</small>
      <div className="button-row"><TerminalButton type="submit" tone="primary" busy={busy} disabled={!text.trim()||(!editing&&rows.length>=MEMORY_LIMIT)}>{editing?'保存记忆':'记住这件事'}</TerminalButton>{editing&&<TerminalButton type="button" disabled={busy} onClick={()=>{setEditing(undefined);setText('');setError('');}}>取消修改</TerminalButton>}</div>
    </form>
    {error&&<p role="alert" className="error">{error}</p>}<p role="status" className="memory-status">{status}</p>
    <p className="muted memory-disclosure">由你手动维护，两位角色共用。启用后，接入 API 的每轮对话会附上这些资料；关闭不会撤回已发送的内容。未接 API 时不会据此生成回复。记忆随备份导出，不会自动创建账目或提醒。</p>
  </section>;
}
