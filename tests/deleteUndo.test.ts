import 'fake-indexeddb/auto';import {test} from 'node:test';import assert from 'node:assert/strict';
import {terminalDb,initializeTerminal,exportSnapshot,restoreSnapshot} from '../src/terminal/data';import {makeBackup} from '../src/terminal/ledger';import {deleteWithUndo,undoDeleted} from '../src/terminal/deleteUndo';
test('deletion undo is atomic, grouped, expires by clock, never overwrites, and restore invalidates it',async()=>{
 await initializeTerminal();const note={id:'note',text:'原备忘',createdAt:'2026-10-18T00:00:00Z'};await terminalDb.notes.put(note);await deleteWithUndo('notes','note',1000);assert.equal(await terminalDb.notes.count(),0);assert.equal(await undoDeleted(5999),1);assert.deepEqual(await terminalDb.notes.get('note'),note);
 await deleteWithUndo('notes','note',1000);assert.equal(await undoDeleted(6000),0);assert.equal(await terminalDb.notes.count(),0);
 await terminalDb.notes.bulkPut([note,{...note,id:'second'}]);await deleteWithUndo('notes','note',1000);await deleteWithUndo('notes','second',1100);assert.equal(await undoDeleted(2000),2);
 await deleteWithUndo('notes','note',1000);await terminalDb.notes.put({...note,text:'较新的内容'});await assert.rejects(undoDeleted(2000));assert.equal((await terminalDb.notes.get('note'))?.text,'较新的内容');assert.equal(await terminalDb.deleted.count(),1);
 const put=terminalDb.deleted.put;terminalDb.deleted.put=(async()=>{throw new Error('checkpoint failed');}) as typeof put;try{await assert.rejects(deleteWithUndo('notes','second',1000),/checkpoint failed/);assert.ok(await terminalDb.notes.get('second'));}finally{terminalDb.deleted.put=put;}
 const backup=await exportSnapshot();await restoreSnapshot(makeBackup(backup));assert.equal(await terminalDb.deleted.count(),0);await terminalDb.delete();
});
