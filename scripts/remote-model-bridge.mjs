import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {createBridgeHandler} from './local-model-bridge.mjs';

// This plaintext listener is reachable only from this computer's SSH client.
const index=process.argv.indexOf('--config');
if(index<0||!process.argv[index+1])throw new Error('需要连接配置');
const config=JSON.parse(readFileSync(process.argv[index+1],'utf8'));
if(config.listenHost!=='127.0.0.1'||config.port!==11436||config.clientSubnet)throw new Error('远程桥接仅允许本机监听');
const server=createServer({maxHeaderSize:8192},createBridgeHandler({...config,credentialScope:'remote',replyFormat:'terminal'}));
server.requestTimeout=15000;server.headersTimeout=10000;
server.listen(11436,'127.0.0.1',()=>console.log('Remote model bridge ready on loopback'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
