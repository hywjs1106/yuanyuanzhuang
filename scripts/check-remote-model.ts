import {readFileSync,writeFileSync} from 'node:fs';
import {request} from 'node:https';
import assert from 'node:assert/strict';
import {askAssistant,shouldAutoExecute} from '../src/terminal/assistant';
import {localDateKey} from '../src/terminal/ledger';
import type {chatComplete,AIConfig} from '../src/utils/aiClient';

const directory='C:/Users/12860/.codex/tools/dailyterminal/remote-model';
const privateConfig=JSON.parse(readFileSync(`${directory}/remote-config.json`,'utf8'));
const profile:AIConfig={provider:'custom',protocol:'openai',baseUrl:'https://111.91.31.243/v1',apiKey:privateConfig.token,model:privateConfig.model};
async function call(path:string,body?:unknown,authorized=true){
 return new Promise<{status:number;data:any}>((resolve,reject)=>{
  // Uses the system/bundled public CA trust, never a private CA or insecure TLS.
  const req=request({hostname:'111.91.31.243',port:443,path,method:body?'POST':'GET',rejectUnauthorized:true,headers:{'content-type':'application/json',...(authorized?{authorization:`Bearer ${profile.apiKey}`}:{})}},res=>{
   const chunks:Buffer[]=[];res.on('data',c=>chunks.push(c));res.on('end',()=>{const text=Buffer.concat(chunks).toString();let data:any;try{data=JSON.parse(text);}catch{data={message:'Non-JSON response'};}resolve({status:res.statusCode??0,data});});
  });req.on('error',reject);req.setTimeout(60000,()=>req.destroy(new Error('测试超时')));if(body)req.write(JSON.stringify(body));req.end();
 });
}
assert.equal((await call('/v1/models',undefined,false)).status,401);
assert.equal((await call('/v1/models')).status,200);
assert.equal((await call('/api/tags')).status,404);
console.log('Trusted HTTPS, authentication and route restrictions passed.');
if(process.argv.includes('--connection-only'))process.exit(0);
const transport:typeof chatComplete=async(_config,messages,options)=>{
 const result=await call('/v1/chat/completions',{model:profile.model,messages,stream:false,max_tokens:options?.maxTokens??1000,temperature:.3});
 if(result.status!==200)throw new Error(`HTTP ${result.status}: ${result.data.error?.message??'连接失败'}`);
 return result.data.choices[0].message.content;
};
const outcomes=[];
for(const item of [
 {kind:'chat',text:'你好，今天有点累，陪我聊两句。'},
 {kind:'ledger',text:'帮我记一下，今天午饭花了28元。'},
 {kind:'reminder',text:'明天上午九点提醒我交电费'},
 {kind:'negative',text:'不必帮我记一下午饭花了28元'},
 {kind:'query',text:'帮我查询今天记了多少笔支出，不要修改。'},
]){
 const started=Date.now();let reads=0;
 const tools={read:async(query:any)=>{assert.equal(query.kind,'ledger');reads++;return{count:0,truncated:false,rows:[],totalExpense:0,totalIncome:0};},resolve:()=>{throw new Error('合成测试不执行修改');}};
 const selected=process.argv.indexOf('--case');if(selected>=0&&process.argv[selected+1]!==item.kind)continue;
 const reply=await askAssistant(item.text,profile,`今日${localDateKey()}；这是合成测试，上下文不包含账目详情或数量，查询必须使用read。`,[],new AbortController().signal,transport,'si',tools);
 const outcome={kind:item.kind,seconds:Math.round((Date.now()-started)/10)/100,reads,reply:reply.reply,actions:reply.actions};outcomes.push(outcome);console.log(JSON.stringify(outcome));
 writeFileSync(`${directory}/smoke-results.json`,JSON.stringify({checkedAt:new Date().toISOString(),tls:'public CA verified',outcomes},null,2));
 if(['chat','negative','query'].includes(item.kind))assert.equal(reply.actions.length,0);
 if(item.kind==='ledger'){const action=reply.actions.find(a=>a.kind==='ledger');assert.ok(action);assert.equal(action.amount,28);assert.equal(shouldAutoExecute(item.text,action),true);}
 if(item.kind==='reminder'){const action=reply.actions.find(a=>a.kind==='reminder');assert.ok(action);assert.equal(shouldAutoExecute(item.text,action),true);}
 if(item.kind==='query')assert.ok(reads>0,'查询必须使用本地只读工具');
}
writeFileSync(`${directory}/smoke-results.json`,JSON.stringify({checkedAt:new Date().toISOString(),tls:'public CA verified',outcomes},null,2));
