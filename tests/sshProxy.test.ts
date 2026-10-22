import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:net';
import {connectThroughProxy,tunnelArguments} from '../scripts/remote-model-ssh.mjs';
async function fakeProxy(reply:string){let request='';const server=createServer(s=>s.on('data',chunk=>{request+=chunk.toString();if(request.includes('\r\n\r\n')){s.write(reply.slice(0,13));setTimeout(()=>s.write(reply.slice(13)),5);}}));await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));return{port:(server.address() as any).port,request:()=>request,close:()=>new Promise<void>(r=>server.close(()=>r()))};}
test('HTTP CONNECT preserves an SSH banner arriving with a fragmented proxy response',async()=>{
 const proxy=await fakeProxy('HTTP/1.1 200 Connection established\r\n\r\nSSH-2.0-test\r\n');
 const socket=await connectThroughProxy(proxy.port);
 try{const banner=await new Promise<string>(r=>{socket.once('data',(b:Buffer)=>r(b.toString()));socket.resume();});assert.equal(banner,'SSH-2.0-test\r\n');assert.match(proxy.request(),/^CONNECT 111\.91\.31\.243:22 HTTP\/1\.1\r\n/);}finally{socket.destroy();await proxy.close();}
});
test('HTTP CONNECT refuses a denied tunnel',async()=>{
 const proxy=await fakeProxy('HTTP/1.1 403 Forbidden\r\n\r\n');try{await assert.rejects(connectThroughProxy(proxy.port),/proxy/i);}finally{await proxy.close();}
});
test('SSH arguments pin identity and host and expose only the exact remote loopback port',()=>{
 const args=tunnelArguments('C:/safe/key','C:/safe/known_hosts','C:/node.exe','C:/safe/proxy.mjs');
 assert.ok(args.includes('127.0.0.1:21436:127.0.0.1:11436'));
 for(const value of ['StrictHostKeyChecking=yes','IdentitiesOnly=yes','ExitOnForwardFailure=yes','BatchMode=yes','GatewayPorts=no'])assert.ok(args.includes(value));
 assert.equal(args.at(-1),'dt-model-tunnel@111.91.31.243');assert.ok(args.includes('-N'));assert.ok(args.includes('-T'));assert.ok(!args.includes('-g'));
});
