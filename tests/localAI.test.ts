import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseLocalAIConnection,assertLocalCredentialTarget} from '../src/terminal/localAI';

const ai={baseUrl:'https://192.168.10.2:11435/v1',model:'qwen3.5-fast:latest',apiKey:'dt-local-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',provider:'custom',protocol:'openai'};
const profile={format:'daily-terminal-local-ai',version:1,ai};
test('local connection imports only the validated AI configuration',()=>{
  assert.deepEqual(parseLocalAIConnection(profile),ai);
});
test('connection rejects backup data, invalid types and unexpected fields',()=>{
  for(const value of [null,[],{...profile,format:'daily-terminal'}, {...profile,version:'1'}, {...profile,entries:[]}, {...profile,ai:{...ai,extra:true}}, {...profile,ai:{...ai,model:42}}, {...profile,ai:{...ai,apiKey:'dt-local-short'}}, {...profile,ai:{...ai,apiKey:`${ai.apiKey}=`}}, {...profile,ai:{...ai,provider:'ollama'}}, {...profile,ai:{...ai,protocol:'anthropic'}}, {...profile,ai:{...ai,model:'qwen3.5-fast:latest '}}]) assert.throws(()=>parseLocalAIConnection(value));
});
test('connection rejects every alternate host, path and URL decoration',()=>{
  for(const baseUrl of ['http://192.168.10.2:11435/v1','https://evil.invalid/v1','https://192.168.10.2:11434/v1','https://192.168.10.2:11435/v2','https://192.168.10.2:11435/v1/','https://user@192.168.10.2:11435/v1','https://192.168.10.2:11435/v1?x=1','https://192.168.10.2:11435/v1#x','https://192.168.10.2:11435/x/../v1']) assert.throws(()=>parseLocalAIConnection({...profile,ai:{...ai,baseUrl}}));
});
test('local credentials cannot be sent to a different target, even with malformed token suffixes',()=>{
  assert.doesNotThrow(()=>assertLocalCredentialTarget(ai.baseUrl,ai.apiKey));
  for(const baseUrl of ['https://evil.invalid/v1','http://192.168.10.2:11435/v1','https://192.168.10.2:11435/v2','https://user@192.168.10.2:11435/v1','https://192.168.10.2:11435/v1?x=1']){
    assert.throws(()=>assertLocalCredentialTarget(baseUrl,ai.apiKey));
    assert.throws(()=>assertLocalCredentialTarget(baseUrl,'dt-local-short'));
  }
  assert.doesNotThrow(()=>assertLocalCredentialTarget('https://provider.invalid/v1','ordinary-provider-key'));
});

test('local model reminder titles retain the explicit user wording without accepting changed time',async()=>{
 const {askAssistant}=await import('../src/terminal/assistant');
 const {parseLocalReminder}=await import('../src/terminal/assistantCommands');
 const text='明天上午九点提醒我交电费';const expected=parseLocalReminder(text)!;
 const config=parseLocalAIConnection(profile);
 const reply=await askAssistant(text,config,'',[],new AbortController().signal,async()=>JSON.stringify({reply:'收到',actions:[{...expected,title:'电费缴纳'}]}));
 assert.equal(reply.actions[0].kind,'reminder');assert.equal((reply.actions[0] as typeof expected).title,'交电费');
 const changed=await askAssistant(text,config,'',[],new AbortController().signal,async()=>JSON.stringify({reply:'核对一下',actions:[{...expected,title:'电费缴纳',at:expected.at.replace('09:00','10:00')}]}));
 assert.equal((changed.actions[0] as typeof expected).title,'电费缴纳');
});

test('local model proposals cannot override a negated user command',async()=>{
 const {askAssistant}=await import('../src/terminal/assistant');
 const reply=await askAssistant('不必帮我记一下午饭花了28元',parseLocalAIConnection(profile),'',[],new AbortController().signal,async()=>JSON.stringify({reply:'明白',actions:[{kind:'ledger',direction:'expense',amount:28,date:'2026-10-14',note:'午饭'}]}));
 assert.deepEqual(reply.actions,[]);
});

test('local model omitted actions use only independently unambiguous explicit commands',async()=>{
 const {askAssistant,shouldAutoExecute}=await import('../src/terminal/assistant');
 const config=parseLocalAIConnection(profile);
 const transport=async()=>JSON.stringify({reply:'已记录',actions:[]});
 for(const text of ['帮我记一下，今天午饭花了28元。','明天上午九点提醒我交电费']) {
   const reply=await askAssistant(text,config,'',[],new AbortController().signal,transport);
   assert.equal(reply.actions.length,1);assert.equal(shouldAutoExecute(text,reply.actions[0]),true);
 }
 for(const text of ['今天午饭花了28元','明天九点提醒我交电费','不必帮我记一下午饭花了28元','帮我记一下花了28元和30元']) {
   const reply=await askAssistant(text,config,'',[],new AbortController().signal,transport);assert.deepEqual(reply.actions,[]);
 }
 const remote=await askAssistant('帮我记一下，今天午饭花了28元。',{...config,apiKey:'ordinary-key'},'',[],new AbortController().signal,transport);assert.deepEqual(remote.actions,[]);
});
