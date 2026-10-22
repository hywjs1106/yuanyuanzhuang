import 'fake-indexeddb/auto';import {test} from 'node:test';import assert from 'node:assert/strict';import * as data from '../src/terminal/data';import {makeBackup} from '../src/terminal/ledger';
test('failed checkpoint storage aborts restore; successful restore and one undo preserve keys and old data',async()=>{
 await data.terminalDb.delete();await data.initializeTerminal();await data.terminalDb.notes.put({id:'old',text:'旧记录',createdAt:new Date().toISOString()});await data.saveSettings({id:'main',budget:10,ai:{baseUrl:'https://example.invalid/v1',model:'test',apiKey:'local-secret'}});
 const incoming=makeBackup({...await data.exportSnapshot(),notes:[],settings:{id:'main',budget:20}});const points=data.terminalDb.restorePoints;assert.ok(points,'database checkpoint table exists');
 const fail=()=>{throw new Error('checkpoint full');};points.hook('creating',fail);await assert.rejects(()=>data.restoreWithUndo(incoming),/checkpoint full/);assert.equal(await data.terminalDb.notes.count(),1);assert.equal((await data.terminalDb.settings.get('main'))?.budget,10);points.hook('creating').unsubscribe(fail);
 await data.restoreWithUndo(incoming);assert.equal(await data.terminalDb.notes.count(),0);assert.equal((await data.terminalDb.settings.get('main'))?.ai?.apiKey,'local-secret');assert.equal((await points.get('previous')).snapshot.settings.ai.apiKey,'');
 await data.undoRestore();assert.equal(await data.terminalDb.notes.count(),1);assert.equal((await data.terminalDb.settings.get('main'))?.budget,10);assert.equal(await points.count(),0);await data.terminalDb.delete();
});

test('a failure after clearing live tables rolls back both records and the new checkpoint',async()=>{
 await data.terminalDb.delete();await data.initializeTerminal();const date=new Date().toISOString();await data.terminalDb.notes.put({id:'keep',text:'保留',createdAt:date});const snapshot=makeBackup({...await data.exportSnapshot(),notes:[{id:'fail',text:'不能导入',createdAt:date}]});
 const fail=(_key:unknown,row:{id:string})=>{if(row.id==='fail')throw new Error('data full');};data.terminalDb.notes.hook('creating',fail);
 await assert.rejects(()=>data.restoreWithUndo(snapshot),/data full/);assert.equal((await data.terminalDb.notes.get('keep'))?.text,'保留');assert.equal(await data.terminalDb.restorePoints.count(),0);data.terminalDb.notes.hook('creating').unsubscribe(fail);await data.terminalDb.delete();
});

test('legacy undo migrates once and keeps its source when database checkpoint storage fails',async()=>{
 await data.terminalDb.delete();const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');const values=new Map([['daily-terminal-pre-restore',JSON.stringify(makeBackup({entries:[],notes:[],messages:[],reminders:[],settings:{id:'main',budget:17}}))]]);
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>values.get(key)??null,removeItem:(key:string)=>values.delete(key)}});
 const fail=()=>{throw new Error('cannot store old checkpoint');};data.terminalDb.restorePoints.hook('creating',fail);
 try{await data.initializeTerminal();assert.ok(values.has('daily-terminal-pre-restore'));assert.equal(await data.terminalDb.restorePoints.count(),0);data.terminalDb.restorePoints.hook('creating').unsubscribe(fail);await data.initializeTerminal();assert.equal(values.has('daily-terminal-pre-restore'),false);assert.equal((await data.terminalDb.restorePoints.get('previous'))?.snapshot.settings.budget,17);}finally{data.terminalDb.restorePoints.hook('creating').unsubscribe(fail);if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete (globalThis as any).localStorage;await data.terminalDb.delete();}
});

test('restore refuses an undo checkpoint that could not itself be restored',async()=>{
 await data.terminalDb.delete();await data.initializeTerminal();await data.terminalDb.notes.put({id:'legacy-invalid',text:'字'.repeat(10001),createdAt:new Date().toISOString()});const incoming=makeBackup({entries:[],notes:[],messages:[],reminders:[],settings:{id:'main',budget:0}});
 await assert.rejects(()=>data.restoreWithUndo(incoming),/备忘格式/);assert.equal(await data.terminalDb.notes.count(),1);assert.equal(await data.terminalDb.restorePoints.count(),0);await data.terminalDb.delete();
});
