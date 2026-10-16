import 'fake-indexeddb/auto';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as data from '../src/terminal/data';
import {makeBackup,validateBackup} from '../src/terminal/ledger';

test('visual edition patches the latest settings without changing data or credentials and survives restore',async()=>{
  assert.equal(typeof data.setVisualTheme,'function');
  await data.terminalDb.delete();await data.initializeTerminal();
  await data.saveSettings({id:'main',budget:200,theme:'dark',ai:{baseUrl:'https://example.com/v1',model:'local-test',apiKey:'PRIVATE'}});
  await data.terminalDb.messages.put({id:'legacy',role:'assistant',text:'原来的对话',createdAt:new Date().toISOString()});
  await data.terminalDb.messages.put({id:'si-chat',role:'assistant',text:'画里见',createdAt:new Date().toISOString(),character:'si'});
  await data.setVisualTheme('si');
  let snapshot=await data.exportSnapshot();
  assert.equal(snapshot.settings.visualTheme,'si');assert.equal(snapshot.settings.theme,'dark');
  assert.equal(snapshot.settings.budget,200);assert.equal(snapshot.settings.ai?.apiKey,'PRIVATE');
  assert.equal(snapshot.messages[0].text,'原来的对话');
  const backup=makeBackup(snapshot);assert.equal(validateBackup(backup).settings.visualTheme,'si');
  assert.equal(validateBackup(backup).messages.find(m=>m.id==='si-chat')?.character,'si');
  assert.equal(validateBackup(backup).messages.find(m=>m.id==='legacy')?.character,undefined);
  assert.throws(()=>validateBackup({...backup,messages:[{...snapshot.messages[0],character:'unknown'}]}));
  await data.setVisualTheme('fangyi');await data.restoreSnapshot(backup);
  snapshot=await data.exportSnapshot();assert.equal(snapshot.settings.visualTheme,'si');assert.equal(snapshot.settings.ai?.apiKey,'PRIVATE');
  assert.throws(()=>validateBackup({...backup,settings:{...backup.settings,visualTheme:'unknown'}}));
  const legacy={...backup,settings:{id:'main',budget:0}};
  assert.equal(validateBackup(legacy).settings.visualTheme,undefined);
  await assert.rejects(()=>data.setVisualTheme('unknown' as 'si'));
  await data.terminalDb.delete();
});

test('a delayed preference save cannot undo a newer character selection',async()=>{
  assert.equal(typeof data.saveSettingsKeepingVisualTheme,'function');
  await data.terminalDb.delete();await data.initializeTerminal();
  await data.saveSettings({id:'main',budget:200,theme:'dark',ai:{baseUrl:'https://example.com/v1',model:'test-model',apiKey:'PRIVATE'}});
  const stale=(await data.exportSnapshot()).settings;
  await data.setVisualTheme('si');
  await data.saveSettingsKeepingVisualTheme({...stale,weatherBriefing:true,theme:'light'});
  const saved=(await data.exportSnapshot()).settings;
  assert.equal(saved.visualTheme,'si');assert.equal(saved.weatherBriefing,true);assert.equal(saved.theme,'light');
  assert.equal(saved.ai?.apiKey,'PRIVATE');
  await data.terminalDb.delete();
});
