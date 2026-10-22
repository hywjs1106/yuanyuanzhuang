import {spawn} from 'node:child_process';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:net';
import {tunnelArguments} from './remote-model-ssh.mjs';
export const retryDelay=attempt=>Math.min(30000,2000*2**Math.min(attempt,4));
// OS-managed lifetime avoids stale/recycled PID locks and simultaneous launch races.
// This loopback socket is only a lock; it closes every connection without reading data.
export function acquireSupervisorSlot(port=11437){return new Promise((resolveSlot,reject)=>{
 const slot=createServer(socket=>socket.destroy());slot.once('error',reject);
 slot.listen({host:'127.0.0.1',port,exclusive:true},()=>resolveSlot(slot));
});}

async function main(){
 const base=dirname(fileURLToPath(import.meta.url)),lock=join(base,'supervisor.pid');
 const configPath=join(base,'remote-config.json'),config=JSON.parse(readFileSync(configPath,'utf8'));
 const slot=await acquireSupervisorSlot();
 try{writeFileSync(lock,String(process.pid),{flag:'w',mode:0o600});}catch(error){slot.close();throw error;}
 let stopped=false,bridge,ssh;
 const stop=()=>{stopped=true;ssh?.kill();bridge?.kill();slot.close();};
 process.on('SIGINT',stop);process.on('SIGTERM',stop);
 process.on('exit',()=>{stop();try{if(readFileSync(lock,'utf8')===String(process.pid))unlinkSync(lock);}catch{}});
 const status=state=>writeFileSync(join(base,'status.json'),JSON.stringify({state,updatedAt:new Date().toISOString()}));
 const childExit=child=>new Promise(resolveExit=>{child.once('error',()=>resolveExit(-1));child.once('exit',code=>resolveExit(code));});
 bridge=spawn(process.execPath,[join(base,'remote-model-bridge.mjs'),'--config',configPath],{windowsHide:true,stdio:['ignore','ignore','inherit']});
 bridge.once('error',()=>{status('bridge failed');stop();});
 bridge.once('exit',()=>{if(!stopped){status('bridge stopped');stop();}});
 let ready=false;
 for(let i=0;i<50&&!stopped;i++){
  try{const response=await fetch('http://127.0.0.1:11436/v1/models',{headers:{authorization:`Bearer ${config.token}`},signal:AbortSignal.timeout(1000)});if(response.ok){ready=true;break;}}catch{}
  await new Promise(r=>setTimeout(r,100));
 }
 if(!ready){stop();throw new Error('电脑模型连接未能启动');}
 let attempt=0;
 while(!stopped){
  status('connecting');const began=Date.now();
  ssh=spawn(join(process.env.WINDIR??'C:/Windows','System32/OpenSSH/ssh.exe'),tunnelArguments(join(base,'tunnel_ed25519'),join(base,'known_hosts'),process.execPath,join(base,'remote-model-ssh.mjs')),{windowsHide:true,stdio:['ignore','ignore','inherit']});
  await childExit(ssh);if(stopped)break;
  status('reconnecting');if(Date.now()-began>60000)attempt=0;
  await new Promise(r=>setTimeout(r,retryDelay(attempt++)));
 }
 status('stopped');
}
if(process.argv[1]&&resolve(process.argv[1]).toLowerCase()===fileURLToPath(import.meta.url).toLowerCase())main().catch(error=>{console.error(error.message);process.exitCode=1;});
