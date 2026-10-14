import {readFileSync} from 'node:fs';
import {request} from 'node:https';
const config=JSON.parse(readFileSync(process.argv[2],'utf8'));
const ca=readFileSync(config.tls.caPath);
const deadline=Date.now()+8000;
function probe(){return new Promise((resolve,reject)=>{
  const req=request({hostname:config.listenHost,port:config.port,path:'/v1/models',agent:false,ca,rejectUnauthorized:true,headers:{Authorization:`Bearer ${config.token}`}},res=>{
    let body='';res.setEncoding('utf8');res.on('data',chunk=>{body+=chunk;if(body.length>8192)req.destroy(new Error('Oversized health response'));});
    res.on('end',()=>{try{const result=JSON.parse(body);if(res.statusCode!==200||result.data?.length!==1||result.data[0].id!==config.model)throw new Error('Unexpected health response');resolve();}catch(error){reject(error);}});
  });req.on('error',reject);req.setTimeout(1000,()=>req.destroy(new Error('Health timeout')));req.end();
});}
let ready=false;
while(Date.now()<deadline){try{await probe();ready=true;break;}catch{await new Promise(resolve=>setTimeout(resolve,200));}}
if(!ready){console.error('Authenticated TLS model bridge did not become ready.');process.exitCode=1;}
