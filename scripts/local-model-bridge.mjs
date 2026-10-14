import {createServer} from 'node:https';
import {timingSafeEqual} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const UPSTREAM='http://127.0.0.1:11434/api/chat';
function terminalReplySchema(messages){
  const property=(kind,properties,required)=>({type:'object',properties:{kind:{const:kind},...properties},required:['kind',...required],additionalProperties:false});
  const stickerIds=[...new Set(messages.filter(m=>m.role==='system').flatMap(m=>m.content.match(/\bfy-\d{2}-\d{2}\b/g)??[]))].slice(0,24);
  return {type:'object',properties:{
    reply:{type:'string',maxLength:15000},
    actions:{type:'array',maxItems:20,items:{anyOf:[
      property('ledger',{direction:{enum:['expense','income']},amount:{type:'number',minimum:.01,maximum:100000000},date:{type:'string',pattern:'^\\d{4}-\\d{2}-\\d{2}$'},note:{type:'string',maxLength:2000},type:{enum:['food','transport','shopping','fun','home','study','other']}},['direction','amount','date']),
      property('reminder',{title:{type:'string',minLength:1,maxLength:200},at:{type:'string',pattern:'^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$'},repeat:{enum:['none','daily','weekly','monthly','yearly']}},['title','at','repeat']),
      property('note',{text:{type:'string',minLength:1,maxLength:10000}},['text']),
    ]}},
    stickerId:{enum:[null,...stickerIds]},
  },required:['reply','actions'],additionalProperties:false};
}
class RequestError extends Error{constructor(status,message){super(message);this.status=status;}}
const ipv4=s=>{const parts=s.split('.');return parts.length===4&&parts.every(x=>/^\d{1,3}$/.test(x)&&Number(x)<=255)?parts.reduce((n,x)=>(n*256+Number(x))>>>0,0):null;};
function allowedClient(address,subnet){
  const ip=(address??'').replace(/^::ffff:/,'');if(ip==='127.0.0.1'||ip==='::1')return true;
  if(!subnet)return false;const [base,bits]=subnet.split('/');const value=ipv4(ip),network=ipv4(base),prefix=Number(bits);
  if(value===null||network===null||!Number.isInteger(prefix)||prefix<8||prefix>32)return false;
  const mask=(0xffffffff<<(32-prefix))>>>0;return ((value&mask)>>>0)===((network&mask)>>>0);
}
function matchesToken(header,token){const actual=Buffer.from(typeof header==='string'?header:''),expected=Buffer.from(`Bearer ${token}`);return actual.length===expected.length&&timingSafeEqual(actual,expected);}
function normalizeMessages(messages){
  if(!Array.isArray(messages)||!messages.length||messages.length>24)throw new RequestError(400,'消息数量无效');
  const clean=messages.map(m=>{if(!m||!['system','user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>16000)throw new RequestError(400,'只支持文本对话');return {role:m.role,content:m.content};});
  if(clean.at(-1).role!=='user'||clean.filter(m=>m.role==='system').length>1)throw new RequestError(400,'当前问题或角色顺序无效');
  const essential=new Set(clean.flatMap((m,i)=>m.role==='system'||i===clean.length-1||(i===1&&m.role==='user'&&m.content.startsWith('终端上下文'))?[i]:[]));
  let size=[...essential].reduce((n,i)=>n+clean[i].content.length,0);if(size>12000)throw new RequestError(400,'当前问题太长，请缩短后重试');
  for(let i=clean.length-2;i>=0;i--)if(!essential.has(i)&&size+clean[i].content.length<=12000){essential.add(i);size+=clean[i].content.length;}
  return clean.filter((_,i)=>essential.has(i));
}
async function readBody(req,limit){
  if(Number(req.headers['content-length'])>limit){req.resume();throw new RequestError(413,'请求过大');}
  return new Promise((resolveBody,reject)=>{let bytes=0;const chunks=[];let settled=false;
    req.on('data',chunk=>{if(settled)return;bytes+=chunk.length;if(bytes>limit){settled=true;reject(new RequestError(413,'请求过大'));}else chunks.push(chunk);});
    req.on('end',()=>{if(settled)return;try{resolveBody(JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch{reject(new RequestError(400,'请求不是有效JSON'));}});
    req.on('error',reject);req.on('aborted',()=>reject(new RequestError(400,'请求已断开')));
  });
}
async function defaultFetchOllama(payload,signal){
  const response=await fetch(UPSTREAM,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),redirect:'error',signal});
  if(!response.ok)throw new RequestError(502,response.status===404?'本机模型未找到，请确认Ollama中的模型名称':'Ollama请求失败，请检查电脑服务');
  return response.json();
}

/** TLS listener is created only by the CLI. Tests can exercise the pure HTTP handler locally. */
export function createBridgeHandler({token,model,clientSubnet,fetchOllama=defaultFetchOllama,maxBodyBytes=128*1024,timeoutMs=90000}){
  if(typeof token!=='string'||!/^dt-local-[A-Za-z0-9_-]{32,}$/.test(token)||typeof model!=='string'||!model)throw new Error('桥接配置无效');
  let busy=false;
  return async(req,res)=>{
    const send=(status,body)=>{if(res.destroyed||res.writableEnded)return;res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(body));};
    try{
      if(!allowedClient(req.socket.remoteAddress,clientSubnet))throw new RequestError(403,'来源不在允许的局域网');
      if(!matchesToken(req.headers.authorization,token))throw new RequestError(401,'电脑连接口令不正确');
      if(req.method==='GET'&&req.url==='/v1/models'){send(200,{object:'list',data:[{id:model,object:'model',owned_by:'local'}]});return;}
      if(req.method!=='POST'||req.url!=='/v1/chat/completions')throw new RequestError(404,'不支持的接口');
      if(!String(req.headers['content-type']??'').includes('application/json'))throw new RequestError(415,'请使用JSON请求');
      const input=await readBody(req,maxBodyBytes);
      if(!input||input.model!==model||input.stream===true||input.tools!==undefined||input.tool_choice!==undefined)throw new RequestError(400,'仅支持已配置模型的普通文本聊天');
      const messages=normalizeMessages(input.messages);
      const requested=input.max_tokens??input.max_completion_tokens??2048;
      if(!Number.isFinite(requested)||requested<1||!Number.isFinite(input.temperature??.7))throw new RequestError(400,'生成参数无效');
      if(busy)throw new RequestError(503,'模型正在回答上一条消息，请稍后再试');
      const payload={model,messages,stream:false,think:false,options:{num_ctx:16384,num_predict:Math.min(2048,Math.floor(requested)),temperature:Math.min(1,Math.max(0,input.temperature??.7))}};
      if(messages.some(m=>m.role==='system'&&m.content.includes('"reply"')&&m.content.includes('"actions"')))payload.format=terminalReplySchema(messages);
      busy=true;const controller=new AbortController();let expired=false;
      const timeout=setTimeout(()=>{expired=true;controller.abort(new Error('模型回复超时'));},timeoutMs);
      try{
        // Keep the slot until upstream settles, even when the phone stops waiting.
        const result=await fetchOllama(payload,controller.signal);
        const text=result?.message?.content;
        if(typeof text!=='string'||!text.trim()||text.length>30000||!result.done||result.done_reason==='length')throw new RequestError(502,'模型回复为空或未完成，请重试');
        send(200,{id:'local-'+Date.now(),object:'chat.completion',model,choices:[{index:0,message:{role:'assistant',content:text},finish_reason:'stop'}],usage:{prompt_tokens:result.prompt_eval_count??0,completion_tokens:result.eval_count??0}});
      }catch(error){if(expired)throw new RequestError(504,'模型回复超时，请稍后重试');throw error;}finally{clearTimeout(timeout);busy=false;}
    }catch(error){send(error instanceof RequestError?error.status:502,{error:{message:error instanceof RequestError?error.message:'电脑模型服务暂时不可用'}});}
  };
}

if(process.argv[1]&&resolve(process.argv[1]).toLowerCase()===fileURLToPath(import.meta.url).toLowerCase()){
  const flag=process.argv.indexOf('--config');if(flag<0||!process.argv[flag+1])throw new Error('需要 --config 配置文件');
  const config=JSON.parse(readFileSync(process.argv[flag+1],'utf8'));
  if(!['127.0.0.1','192.168.10.2'].includes(config.listenHost)||config.port!==11435)throw new Error('监听地址或端口不在允许范围');
  const server=createServer({key:readFileSync(config.tls.keyPath),cert:readFileSync(config.tls.certPath),maxHeaderSize:8192},createBridgeHandler(config));
  server.requestTimeout=15000;server.headersTimeout=10000;
  server.listen(config.port,config.listenHost,()=>console.log(`DailyTerminal local model bridge: ${config.listenHost}:${config.port}`));
  const stop=()=>server.close(()=>process.exit(0));process.on('SIGINT',stop);process.on('SIGTERM',stop);
}
