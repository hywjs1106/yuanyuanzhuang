import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseAssistantReply,buildAssistantMessages} from '../src/terminal/assistant';
import {makeBackup,validateBackup,type Message} from '../src/terminal/ledger';

test('Si model performance remains optional and independent from task proposals',()=>{
 const action={kind:'note',text:'买茶叶'};
 const r=parseAssistantReply(JSON.stringify({reply:'交给终端',actions:[action],performance:{action:'agree',summon:'tea'}}),'si');
 assert.deepEqual(r.actions,[action]);assert.deepEqual(r.performance,{action:'agree',summon:'tea'});
 const bad=parseAssistantReply(JSON.stringify({reply:'正文保留',actions:[action],performance:{action:'runCode',summon:'https://invalid.example'}}),'si');
 assert.equal(bad.reply,'正文保留');assert.deepEqual(bad.actions,[action]);assert.equal(bad.performance,undefined);
 assert.equal(parseAssistantReply('{"reply":"旧格式","actions":[]}','si').performance,undefined);
 assert.equal(parseAssistantReply('{"reply":"方宜","actions":[],"performance":{"action":"happy"}}','fangyi').performance,undefined);
});
test('production prompt adds performance without the preview read-only policy',()=>{
 const text=String(buildAssistantMessages('聊聊今天','',[],new Date(),'si')[0].content);
 assert.match(text,/performance/);assert.match(text,/墨魉/);assert.match(text,/read/);assert.match(text,/actions/);
 assert.doesNotMatch(text,/这是独立外观预览|没有记账、提醒、联网天气或数据库工具/);
});
test('chat backup retains allowed companion metadata and accepts older messages',()=>{
 const message:Message={id:'si-chat',character:'si',role:'assistant',text:'慢慢聊。',createdAt:'2026-10-21T10:00:00Z',performance:{action:'listen',summon:'peek'}};
 const snapshot={entries:[],reminders:[],notes:[],messages:[message],settings:{id:'main' as const,budget:0}};
 const restored=validateBackup(JSON.parse(JSON.stringify(makeBackup(snapshot))));
 assert.deepEqual(restored.messages[0].performance,message.performance);
 const old={...message};delete old.performance;
 assert.equal(validateBackup({...makeBackup(snapshot),messages:[old]}).messages[0].performance,undefined);
 assert.equal(validateBackup({...makeBackup(snapshot),messages:[{...old,performance:{action:'unknown'}}]}).messages[0].performance,undefined);
});
