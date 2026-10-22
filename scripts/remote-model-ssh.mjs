import {connect} from 'node:net';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

/** Fixed SSH destination; never a general-purpose proxy or an HTTP API listener. */
export function connectThroughProxy(port=12334){
 return new Promise((resolveSocket,reject)=>{
  const socket=connect({host:'127.0.0.1',port});let head=Buffer.alloc(0);
  const fail=error=>{socket.destroy();reject(error);};
  socket.setTimeout(15000,()=>fail(new Error('SSH proxy timeout')));
  socket.once('error',fail);socket.once('end',()=>fail(new Error('SSH proxy closed')));
  socket.once('connect',()=>socket.write('CONNECT 111.91.31.243:22 HTTP/1.1\r\nHost: 111.91.31.243:22\r\n\r\n'));
  const receive=chunk=>{
   head=Buffer.concat([head,chunk]);const end=head.indexOf('\r\n\r\n');
   if(end<0){if(head.length>8192)fail(new Error('SSH proxy header too large'));return;}
   if(!/^HTTP\/1\.[01] 200(?: |\r)/.test(head.subarray(0,end).toString('ascii')))return fail(new Error('SSH proxy refused'));
   socket.pause();socket.removeListener('data',receive);socket.removeListener('error',fail);socket.removeAllListeners('end');socket.setTimeout(0);socket.removeAllListeners('timeout');
   const remaining=head.subarray(end+4);if(remaining.length)socket.unshift(remaining);resolveSocket(socket);
  };
  socket.on('data',receive);
 });
}
export function tunnelArguments(key,knownHosts,node,proxy){
 const args=['-N','-T','-p','22','-i',key,'-R','127.0.0.1:21436:127.0.0.1:11436'];
 for(const option of ['BatchMode=yes','IdentitiesOnly=yes','StrictHostKeyChecking=yes','HostKeyAlgorithms=ssh-ed25519','KexAlgorithms=curve25519-sha256','ExitOnForwardFailure=yes','GatewayPorts=no','ServerAliveInterval=15','ServerAliveCountMax=3','ConnectTimeout=15',`UserKnownHostsFile=${knownHosts}`,`ProxyCommand="${node}" "${proxy}"`])args.push('-o',option);
 args.push('dt-model-tunnel@111.91.31.243');return args;
}
if(process.argv[1]&&resolve(process.argv[1]).toLowerCase()===fileURLToPath(import.meta.url).toLowerCase()){
 try{const socket=await connectThroughProxy();socket.on('error',()=>process.exit(1));socket.on('close',()=>process.exit(0));process.stdin.on('error',()=>socket.destroy());process.stdout.on('error',()=>socket.destroy());process.stdin.pipe(socket);socket.pipe(process.stdout);}
 catch{process.stderr.write('SSH proxy unavailable\n');process.exitCode=1;}
}
