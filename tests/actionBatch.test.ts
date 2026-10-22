import 'fake-indexeddb/auto';
import {initializeTerminal,terminalDb,registerActionBatch,patchActionBatch,exportSnapshot,restoreSnapshot} from '../src/terminal/data';
import {test} from 'node:test';import assert from 'node:assert/strict';
import {makeBackup,validateBackup} from '../src/terminal/ledger';
const snapshot={entries:[],reminders:[],notes:[],settings:{id:'main' as const,budget:100},messages:[{id:'request',role:'user' as const,text:'核对',createdAt:'2026-10-18T00:00:00Z',actionBatch:{actions:[{kind:'note',text:'清单'}],states:{},errors:{},drafts:{0:{text:'没写完'}}}}]};
test('proposal metadata survives backup and rejects unknown states, invalid actions and oversized draft data',()=>{
 const backup=makeBackup(snapshot as any);assert.deepEqual((validateBackup(backup).messages[0] as any).actionBatch,snapshot.messages[0].actionBatch);
 for(const actionBatch of [{...snapshot.messages[0].actionBatch,states:{0:'已保存',9:'已忽略'}},{...snapshot.messages[0].actionBatch,states:{0:'保存中…'}},{...snapshot.messages[0].actionBatch,actions:[{kind:'ledger',amount:-10}]},{...snapshot.messages[0].actionBatch,drafts:{0:{text:'字'.repeat(10001)}}}])assert.throws(()=>validateBackup({...backup,messages:[{...backup.messages[0],actionBatch}]}));
});

test('backup restore retains pending drafts without executing them and final decisions cannot be edited',async()=>{
 await terminalDb.delete();await initializeTerminal();await terminalDb.messages.put({id:'pending',role:'user',text:'核对',createdAt:'2026-10-18T00:00:00Z'});
 await registerActionBatch('pending',[{kind:'note',text:'待核对'}]);await patchActionBatch('pending',0,{kind:'draft',fields:{text:'未应用草稿'}});const backup=makeBackup(await exportSnapshot());await terminalDb.messages.clear();await restoreSnapshot(backup);
 assert.equal((await terminalDb.messages.get('pending'))?.actionBatch?.drafts[0].text,'未应用草稿');assert.equal(await terminalDb.notes.count(),0);
 await patchActionBatch('pending',0,{kind:'ignore'});await patchActionBatch('pending',0,{kind:'edit',proposal:{kind:'note',text:'不应更改'}});assert.equal((await terminalDb.messages.get('pending'))?.actionBatch?.states[0],'已忽略');assert.equal((await terminalDb.messages.get('pending'))?.actionBatch?.actions[0].kind,'note');await terminalDb.delete();
});

test('registering normalized duplicate actions uses the same one-card numbering as execution',async()=>{
 await terminalDb.delete();await initializeTerminal();await terminalDb.messages.put({id:'normalized',role:'user',text:'提醒',createdAt:'2026-10-18T00:00:00Z'});
 const action={kind:'reminder' as const,title:'喝水',at:'2099-10-18T09:00',repeat:'daily' as const};
 const actions=await registerActionBatch('normalized',[action,{repeat:'daily',at:action.at,title:'喝水',kind:'reminder'}]);assert.deepEqual(actions,[action]);assert.equal((await terminalDb.messages.get('normalized'))?.actionBatch?.actions.length,1);await terminalDb.delete();
});

test('stored final decisions reject stale execution inside a business transaction',async()=>{
 const data=await import('../src/terminal/data');await terminalDb.delete();await initializeTerminal();await terminalDb.messages.put({id:'guard',role:'user',text:'核对',createdAt:'2026-10-18T00:00:00Z'});const proposal={kind:'note' as const,text:'清单'};await registerActionBatch('guard',[proposal]);await patchActionBatch('guard',0,{kind:'ignore'});
 const attempt=()=>terminalDb.transaction('rw',[terminalDb.messages,terminalDb.notes],async()=>{await data.assertActionPending('ai-guard-0',proposal);await terminalDb.notes.put({id:'ai-guard-0',text:'不应重新写入',createdAt:new Date().toISOString()});});
 await assert.rejects(attempt,/已忽略/);assert.equal(await terminalDb.notes.count(),0);
 const message=(await terminalDb.messages.get('guard'))!;message.actionBatch!.states[0]='已保存';await terminalDb.messages.put(message);await assert.rejects(attempt,/已保存/);assert.equal(await terminalDb.notes.count(),0);await terminalDb.delete();
});
