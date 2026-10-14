import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createBridgeHandler} from '../scripts/local-model-bridge.mjs';
const token='dt-local-'+ 'A'.repeat(43), model='qwen3.5-fast:latest';
async function setup(upstream:any,options:any={}){const server=createServer(createBridgeHandler({token,model,fetchOllama:upstream,...options}));await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const port=(server.address() as any).port;return{url:`http://127.0.0.1:${port}`,close:()=>new Promise<void>(resolve=>{server.close(resolve);server.closeAllConnections();})};}
const request={model,messages:[{role:'user',content:'只回复连接成功'}],stream:false,max_tokens:100};
const auth={authorization:`Bearer ${token}`,'content-type':'application/json'};
test('bridge rejects unauthenticated requests and exposes neither Ollama administration nor other models',async()=>{let calls=0;const s=await setup(async()=>{calls++;return{message:{content:'连接成功'},done:true};});try{assert.equal((await fetch(s.url+'/v1/models')).status,401);assert.equal((await fetch(s.url+'/api/delete',{method:'POST',headers:auth,body:'{}'})).status,404);assert.equal((await fetch(s.url+'/v1/chat/completions',{method:'POST',headers:auth,body:JSON.stringify({...request,model:'other'})})).status,400);assert.equal(calls,0);const models=await(await fetch(s.url+'/v1/models',{headers:auth})).json() as any;assert.deepEqual(models.data.map((m:any)=>m.id),[model]);}finally{await s.close();}});
test('bridge explicitly disables thinking, bounds output and sends JSON format only for the terminal contract',async()=>{let payload:any;const s=await setup(async(p:any)=>{payload=p;return{message:{content:'连接成功'},done:true,eval_count:2};});try{const response=await fetch(s.url+'/v1/chat/completions',{method:'POST',headers:auth,body:JSON.stringify({...request,max_tokens:65000,options:{num_predict:99999}})});assert.equal(response.status,200);assert.equal(payload.think,false);assert.equal(payload.stream,false);assert.equal(payload.options.num_predict,2048);assert.equal(payload.format,undefined);assert.equal(((await response.json()) as any).choices[0].message.content,'连接成功');await fetch(s.url+'/v1/chat/completions',{method:'POST',headers:auth,body:JSON.stringify({...request,messages:[{role:'system',content:'只输出JSON {"reply":"回答","actions":[]}'},...request.messages]})});assert.equal(payload.format.properties.reply.type,'string');assert.equal(payload.format.properties.actions.maxItems,20);assert.ok(payload.format.required.includes('actions'));}finally{await s.close();}});
test('invalid payloads, tools, oversized bodies and empty or truncated responses never become success',async()=>{let result:any={message:{content:''},done:true};const s=await setup(async()=>result,{maxBodyBytes:2000});try{for(const body of ['broken',JSON.stringify({...request,stream:true}),JSON.stringify({...request,tools:[{}]}),JSON.stringify({...request,messages:[{role:'user',content:[{type:'image'}]}]})])assert.equal((await fetch(s.url+'/v1/chat/completions',{method:'POST',headers:auth,body})).status,400);assert.equal((await fetch(s.url+'/v1/chat/completions',{method:'POST',headers:auth,body:'A'.repeat(2500)})).status,413);assert.equal((await fetch(s.url+'/v1/chat/completions',{method:'POST',headers:auth,body:JSON.stringify(request)})).status,502);result={message:{content:'half'},done:true,done_reason:'length'};assert.equal((await fetch(s.url+'/v1/chat/completions',{method:'POST',headers:auth,body:JSON.stringify(request)})).status,502);}finally{await s.close();}});
test('gateway retains one generation slot, rejects overload and times out a stuck upstream',async()=>{let finish:any;const s=await setup(()=>new Promise(resolve=>{finish=resolve;}));try{const first=fetch(s.url+'/v1/chat/completions',{method:'POST',headers:auth,body:JSON.stringify(request)});while(!finish)await new Promise(r=>setTimeout(r,5));assert.equal((await fetch(s.url+'/v1/chat/completions',{method:'POST',headers:auth,body:JSON.stringify(request)})).status,503);finish({message:{content:'ok'},done:true});assert.equal((await first).status,200);}finally{await s.close();}const timed=await setup((_p:any,signal:AbortSignal)=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true})),{timeoutMs:30});try{assert.equal((await fetch(timed.url+'/v1/chat/completions',{method:'POST',headers:auth,body:JSON.stringify(request)})).status,504);}finally{await timed.close();}});

test('a disconnected phone cannot release the slot while its generation still runs',async()=>{
 let finish:any;let calls=0;
 const s=await setup(()=>{calls++;return new Promise(resolve=>{finish=resolve;});});
 try {
  const controller=new AbortController();
  const first=fetch(s.url+'/v1/chat/completions',{method:'POST',headers:auth,body:JSON.stringify(request),signal:controller.signal});
  const stopped=assert.rejects(first);
  while(!finish)await new Promise(resolve=>setTimeout(resolve,5));
  controller.abort();await stopped;
  assert.equal((await fetch(s.url+'/v1/chat/completions',{method:'POST',headers:auth,body:JSON.stringify(request)})).status,503);
  assert.equal(calls,1);finish({message:{content:'ok'},done:true});
  await new Promise(resolve=>setTimeout(resolve,20));
  assert.equal((await fetch(s.url+'/v1/models',{headers:auth})).status,200);
 }finally{await s.close();}
});
