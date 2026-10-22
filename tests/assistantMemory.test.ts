import 'fake-indexeddb/auto';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as data from '../src/terminal/data';
import {makeBackup,validateBackup} from '../src/terminal/ledger';
import {memoryContext,validateMemories} from '../src/terminal/assistantMemory';

const fact={id:'tea',text:'喜欢热茶，不喝咖啡',updatedAt:'2026-10-17T01:00:00.000Z'};
test('personal facts are bounded plain data, included in backup and omitted when disabled',()=>{
  assert.deepEqual(validateMemories([fact]),[fact]);
  assert.throws(()=>validateMemories([fact,fact]));
  assert.throws(()=>validateMemories([{...fact,text:' '.repeat(20)}]));
  assert.throws(()=>validateMemories([{...fact,text:'字'.repeat(241)}]));
  assert.throws(()=>validateMemories([{...fact,updatedAt:'yesterday'}]));
  assert.throws(()=>validateMemories(Array.from({length:21},(_,i)=>({...fact,id:String(i)}))));
  assert.equal(memoryContext({assistantMemoryEnabled:false,assistantMemories:[fact]}),'');
  assert.match(memoryContext({assistantMemories:[fact]}),/喜欢热茶/);
  const backup=makeBackup({entries:[],reminders:[],notes:[],messages:[],settings:{id:'main',budget:0,assistantMemories:[fact],assistantMemoryEnabled:false}});
  assert.deepEqual(validateBackup(backup).settings.assistantMemories,[fact]);
  assert.throws(()=>validateBackup({...backup,settings:{...backup.settings,assistantMemoryEnabled:'yes'}}));
  assert.throws(()=>validateBackup({...backup,settings:{...backup.settings,assistantMemories:[fact,fact]}}));
});
test('memory edits merge latest settings and cannot be undone by stale general settings saves',async()=>{
  await data.terminalDb.delete();await data.initializeTerminal();
  const stale=(await data.exportSnapshot()).settings;
  await data.updateAssistantMemory({kind:'put',memory:fact});
  await data.setVisualTheme('si');
  await data.saveSettingsKeepingVisualTheme({...stale,budget:88});
  let settings=(await data.exportSnapshot()).settings;
  assert.deepEqual(settings.assistantMemories,[fact]);assert.equal(settings.visualTheme,'si');assert.equal(settings.budget,88);
  await data.updateAssistantMemory({kind:'enabled',enabled:false});
  await data.updateAssistantMemory({kind:'put',memory:{...fact,text:'喜欢茉莉花茶'}});
  settings=(await data.exportSnapshot()).settings;
  assert.equal(settings.assistantMemoryEnabled,false);assert.equal(settings.assistantMemories?.[0].text,'喜欢茉莉花茶');
  await data.updateAssistantMemory({kind:'delete',id:'tea'});
  assert.deepEqual((await data.exportSnapshot()).settings.assistantMemories,[]);
  await data.terminalDb.delete();
});
