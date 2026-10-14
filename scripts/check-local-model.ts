import {readFileSync,writeFileSync} from 'node:fs';
import {request} from 'node:https';
import {checkServerIdentity} from 'node:tls';
import {X509Certificate} from 'node:crypto';
import assert from 'node:assert/strict';
import {askAssistant,shouldAutoExecute} from '../src/terminal/assistant';
import {parseLocalAIConnection} from '../src/terminal/localAI';
import {localDateKey} from '../src/terminal/ledger';
import type {chatComplete} from '../src/utils/aiClient';

const directory='C:/Users/12860/.codex/tools/dailyterminal/local-model';
const privateConfig=JSON.parse(readFileSync(`${directory}/config.json`,'utf8'));
const profile=parseLocalAIConnection(JSON.parse(readFileSync('../电脑模型连接.json','utf8')));
const ca=readFileSync(privateConfig.tls.caPath);
async function call(path:string,body:unknown,options:{trusted?:boolean;wrongName?:boolean;authorized?:boolean}={}){
  return new Promise<{status:number;data:any}>((resolve,reject)=>{
    const req=request({hostname:'127.0.0.1',port:11435,path,agent:false,rejectUnauthorized:true,method:body?'POST':'GET',...(options.trusted===false?{}:{ca}),...(options.wrongName?{checkServerIdentity:(_host,cert)=>checkServerIdentity('wrong.invalid',cert)}:{}),headers:{'content-type':'application/json',...(options.authorized===false?{}:{Authorization:`Bearer ${profile.apiKey}`})}},res=>{
      const chunks:Buffer[]=[];res.on('data',chunk=>chunks.push(chunk));res.on('end',()=>{try{resolve({status:res.statusCode??0,data:JSON.parse(Buffer.concat(chunks).toString('utf8'))});}catch(error){reject(error);}});
    });req.on('error',reject);req.setTimeout(55000,()=>req.destroy(new Error('测试超时')));if(body)req.write(JSON.stringify(body));req.end();
  });
}
assert.equal(new X509Certificate(readFileSync(`${directory}/server.pem`)).checkIP('192.168.10.2'),'192.168.10.2');
assert.equal((await call('/v1/models',undefined)).status,200);
assert.equal((await call('/v1/models',undefined,{authorized:false})).status,401);
await assert.rejects(call('/v1/models',undefined,{trusted:false}));
await assert.rejects(call('/v1/models',undefined,{wrongName:true}));
console.log('TLS trusted CA / SAN / wrong CA / wrong hostname / missing token checks passed.');
const transport:typeof chatComplete=async(_config,messages,options)=>{
  const result=await call('/v1/chat/completions',{model:profile.model,messages,stream:false,max_tokens:options?.maxTokens??2000,temperature:.6});
  if(result.status!==200)throw new Error(`本机模型返回HTTP ${result.status}`);
  writeFileSync('../references/local-model-last-response.json',result.data.choices[0].message.content);
  return result.data.choices[0].message.content;
};
const cases=[
  {kind:'chat',text:'你好方宜，今天有点累。'},
  {kind:'ledger',text:'帮我记一下，今天午饭花了28元。'},
  {kind:'reminder',text:'明天上午九点提醒我交电费'},
  {kind:'sticker',text:'谢谢你'},
  {kind:'negative',text:'不必帮我记一下午饭花了28元'},
];
const outcomes=[];
for(const item of cases){
  const started=Date.now();const reply=await askAssistant(item.text,profile,`今日${localDateKey()}；这是合成测试，尚未保存任何流水。`,[],new AbortController().signal,transport);
  if(['chat','sticker'].includes(item.kind))assert.equal(reply.actions.length,0);
  if(item.kind==='ledger'){const action=reply.actions.find(a=>a.kind==='ledger');assert.ok(action);assert.equal(action.amount,28);assert.equal(action.date,localDateKey());assert.equal(shouldAutoExecute(item.text,action),true);}
  if(item.kind==='reminder'){const action=reply.actions.find(a=>a.kind==='reminder');assert.ok(action);assert.equal(shouldAutoExecute(item.text,action),true);}
  if(item.kind==='negative')assert.equal(reply.actions.length,0);
  const result={kind:item.kind,seconds:Math.round((Date.now()-started)/10)/100,reply:reply.reply,actions:reply.actions,stickerId:reply.stickerId};outcomes.push(result);console.log(JSON.stringify(result));
}
writeFileSync('../references/local-model-smoke.json',JSON.stringify({model:profile.model,tls:true,outcomes},null,2));
