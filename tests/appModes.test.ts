import 'fake-indexeddb/auto';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {appMode,modeCharacter} from '../src/terminal/appModes';
import {terminalDb,setAppMode,saveSettingsKeepingVisualTheme,setVisualTheme} from '../src/terminal/data';
import {makeBackup,validateBackup} from '../src/terminal/ledger';
test('legacy editions remain original, third mode reuses Si identity',()=>{
 assert.equal(appMode({visualTheme:'si'}),'si');assert.equal(appMode({}),'fangyi');
 assert.equal(appMode({visualTheme:'si',appMode:'tea'}),'tea');assert.equal(modeCharacter('tea'),'si');
});
test('mode change survives stale settings saves, backup and legacy switching',async()=>{
 await terminalDb.settings.put({id:'main',budget:20,visualTheme:'si',ai:{baseUrl:'https://test.invalid/v1',model:'test',apiKey:'fixture-key'}});
 const stale=await terminalDb.settings.get('main');await setAppMode('tea');await saveSettingsKeepingVisualTheme({...stale!,budget:30});
 const s=(await terminalDb.settings.get('main'))!;assert.equal(s.appMode,'tea');assert.equal(s.visualTheme,'si');assert.equal(s.ai?.apiKey,'fixture-key');
 const restored=validateBackup(makeBackup({entries:[],reminders:[],notes:[],messages:[],settings:s}));assert.equal(restored.settings.appMode,'tea');
 const conflicted={...makeBackup({entries:[],reminders:[],notes:[],messages:[],settings:s}),settings:{...s,visualTheme:'fangyi' as const}};
 assert.equal(validateBackup(conflicted).settings.visualTheme,'si');assert.equal(conflicted.settings.visualTheme,'fangyi');
 await setVisualTheme('si');assert.equal(appMode((await terminalDb.settings.get('main'))!),'si');
 assert.throws(()=>validateBackup({...makeBackup({entries:[],reminders:[],notes:[],messages:[],settings:s}),settings:{...s,appMode:'invalid'}}));
});
