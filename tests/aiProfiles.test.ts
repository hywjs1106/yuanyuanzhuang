import 'fake-indexeddb/auto';
import test from 'node:test';import assert from 'node:assert/strict';
import {aiMode,aiProfiles,withAIProfile,selectAIProfile} from '../src/terminal/aiProfiles';
import {makeBackup,validateBackup} from '../src/terminal/ledger';
import {terminalDb,initializeTerminal,saveAIProfile,switchAIProfile,saveSettingsKeepingVisualTheme,restoreSnapshot,exportSnapshot} from '../src/terminal/data';
const local={baseUrl:'https://computer.invalid/v1',model:'pc',apiKey:'dt-remote-'+'L'.repeat(40),provider:'custom' as const,protocol:'openai' as const};
const api={baseUrl:'https://provider.invalid/v1',model:'cloud',apiKey:'EXTERNAL_SECRET_123',provider:'custom' as const,protocol:'anthropic' as const};
test('legacy migration preserves one paired configuration and switching never mixes destinations or credentials',()=>{
 const legacy:any={id:'main',budget:0,ai:local};assert.equal(aiMode(legacy),'local');assert.deepEqual(aiProfiles(legacy),{local});
 const both=withAIProfile(legacy,'api',api);assert.deepEqual(both.ai,api);assert.deepEqual(selectAIProfile(both,'local').ai,local);
 assert.deepEqual(aiProfiles(both),{local,api});assert.throws(()=>selectAIProfile({id:'main',budget:0},'local'),/配置/);
});
test('both secrets are absent from exported and malicious imported backups',()=>{
 const settings=withAIProfile(withAIProfile({id:'main',budget:0},'local',local),'api',api);
 const snapshot={entries:[],notes:[],messages:[],reminders:[],settings};const backup=makeBackup(snapshot);
 const text=JSON.stringify(backup);assert.ok(!text.includes(local.apiKey));assert.ok(!text.includes(api.apiKey));
 const imported=validateBackup({...backup,settings});assert.equal(imported.settings.aiProfiles?.local?.apiKey,'');assert.equal(imported.settings.aiProfiles?.api?.apiKey,'');
});
test('transactional profile switch survives stale budget save and backup restore preserves local credentials',async()=>{
 await initializeTerminal();await saveAIProfile('local',local);const stale=(await terminalDb.settings.get('main'))!;
 await saveAIProfile('api',api);await switchAIProfile('local');await saveSettingsKeepingVisualTheme({...stale,budget:321});
 let saved=(await terminalDb.settings.get('main'))!;assert.equal(saved.aiMode,'local');assert.deepEqual(saved.ai,local);assert.deepEqual(saved.aiProfiles?.api,api);
 const incoming=makeBackup({...await exportSnapshot(),settings:{...saved,aiMode:'api' as const,ai:api,aiProfiles:{api:{...api,baseUrl:'https://other.invalid/v1'}}}});
 await restoreSnapshot(incoming);saved=(await terminalDb.settings.get('main'))!;assert.deepEqual(saved.ai,local);assert.deepEqual(saved.aiProfiles?.api,api);
 assert.equal(saved.aiMode,'local');await terminalDb.delete();
});
