import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeFetch,_setNativeRequestForTest,aiFetch} from '../src/utils/aiTransport';
test('local bridge credentials disable native and browser redirects',async()=>{
 let options:any;
 _setNativeRequestForTest(async(opts)=>{options=opts;return{status:200,data:'ok',headers:{},url:opts.url};},true);
 try{await nativeFetch('https://192.168.10.2:11435/v1/chat/completions',{headers:{Authorization:'Bearer dt-local-'+ 'A'.repeat(43)}});assert.equal(options.disableRedirects,true);}finally{_setNativeRequestForTest(null);}
 const original=globalThis.fetch;let init:any;
 globalThis.fetch=async(_url,opts)=>{init=opts;return new Response('ok');};
 try{await aiFetch('https://192.168.10.2:11435/v1/chat/completions',{headers:{Authorization:'Bearer dt-local-'+ 'A'.repeat(43)}});assert.equal(init.redirect,'error');}finally{globalThis.fetch=original;}
});
