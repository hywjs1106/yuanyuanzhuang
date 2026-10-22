import React from 'react';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseAssistantReply,buildAssistantMessages,askAssistant,localAssistantReply} from '../src/terminal/assistant';
import {getSticker,isKnownStickerId,stickerPromptCandidates,chooseOfflineSticker,STICKER_CATALOG} from '../src/terminal/stickerCatalog';
import {StickerMessage} from '../src/terminal/StickerMessage';
import {makeBackup,validateBackup} from '../src/terminal/ledger';
const moods=['smile','proud','thinking','surprised','comfort','sleepy'];
const now=new Date(2026,9,17,12);
const config={apiKey:'test-key',baseUrl:'https://example.invalid/v1',model:'test',provider:'custom' as const};
const envelope=(stickerId:string)=>JSON.stringify({reply:'这眼光不错。(￣▽￣)',actions:[],stickerId});

test('Si has six owned local static expressions while Fangyi catalog remains intact',()=>{
 assert.equal(STICKER_CATALOG.length,178);
 for(const mood of moods){const s=getSticker(`si-${mood}`);assert.ok(s);assert.match(s.poster,/^\/themes\/si\//);assert.equal(s.localAsset,s.poster);assert.equal(isKnownStickerId(s.id,'si'),true);assert.equal(isKnownStickerId(s.id,'fangyi'),false);}
 assert.equal(isKnownStickerId('fy-01-08','si'),false);
 assert.equal(isKnownStickerId('https://bad.invalid/x.png','si'),false);
});
test('active character owns parsed model stickers, without altering valid replies and actions',async()=>{
 for(const character of ['si','fangyi'] as const){const own=character==='si'?'si-official-proud':'fy-01-08',foreign=character==='si'?'fy-01-08':'si-proud';
 const reply=await askAssistant('你真厉害',config,'',[],new AbortController().signal,async()=>envelope(own),character);assert.equal(reply.stickerId,own);assert.equal(reply.reply,'这眼光不错。(￣▽￣)');
 const filtered=await askAssistant('你好',config,'',[],new AbortController().signal,async()=>envelope(foreign),character);assert.equal(filtered.stickerId,undefined);assert.deepEqual(filtered.actions,[]);}
 assert.equal(parseAssistantReply(envelope('si-proud'),'si').stickerId,undefined);
});
test('Si model prompt exposes only Si candidates and permits restrained kaomoji',()=>{
 const prompt=buildAssistantMessages('这件衣服好看吗','',[],now,'si')[0].content;
 assert.match(prompt,/颜文字/);assert.match(prompt,/si-official-proud/);assert.doesNotMatch(prompt,/fy-01-|没有可用的表情目录|当前祀没有可用/);
 assert.match(stickerPromptCandidates('你好','si'),/si-official-wink/);assert.doesNotMatch(stickerPromptCandidates('你好','si'),/fy-/);
});
test('offline emotion selection avoids negated joy, distress and operational requests',()=>{
 assert.equal(chooseOfflineSticker('今天真开心','si'),'si-official-wink');assert.equal(chooseOfflineSticker('晚安','si'),undefined);
 for(const text of ['一点也不开心','我不高兴','开心不起来','我很难过','我不想用表情包','别发晚安图','别发开心表情','帮我记账今天午饭28元'])assert.equal(chooseOfflineSticker(text,'si'),undefined,text);
 assert.equal(localAssistantReply('今天真开心',now,'si').stickerId,'si-official-wink');
 assert.equal(localAssistantReply('帮我记一下午饭花了28元',now,'si').stickerId,undefined);
});
test('static Si sticker renders without play controls, remote URLs or cross-character artwork',()=>{
 const html=renderToStaticMarkup(<StickerMessage stickerId="si-proud" character="si" autoPlay/>);
 assert.match(html,/祀表情/);assert.match(html,/\/themes\/si\//);assert.doesNotMatch(html,/播放|停止|https:|\.gif/);
 assert.equal(renderToStaticMarkup(<StickerMessage stickerId="fy-01-08" character="si"/>),'');
 assert.equal(renderToStaticMarkup(<StickerMessage stickerId="si-proud" character="fangyi"/>),'');
});
test('Si sticker survives backup roundtrip and mismatched character imports fail',()=>{
 const message={id:'s',role:'assistant' as const,text:'这眼光不错。(￣▽￣)',createdAt:now.toISOString(),character:'si' as const,stickerId:'si-proud'};
 const backup=makeBackup({entries:[],reminders:[],notes:[],messages:[message],settings:{id:'main',budget:0}});
 assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(backup))).messages[0],message);
 assert.throws(()=>validateBackup({...backup,messages:[{...message,stickerId:'fy-01-08'}]}));
 assert.throws(()=>validateBackup({...backup,messages:[{...message,character:undefined}]}));
});

test('official Si stickers are parsed and restored with legacy IDs still intact',()=>{
 const message={id:'official',role:'assistant' as const,text:'这眼光不错。',createdAt:now.toISOString(),character:'si' as const,stickerId:'si-official-proud'};
 assert.equal(parseAssistantReply(envelope(message.stickerId),'si').stickerId,message.stickerId);
 const backup=makeBackup({entries:[],reminders:[],notes:[],messages:[message],settings:{id:'main',budget:0}});
 assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(backup))).messages[0],message);
 assert.ok(getSticker('si-proud','si'));assert.equal(getSticker('si-official-proud','fangyi'),undefined);
 assert.doesNotMatch(stickerPromptCandidates('你好','si'),/si-sleepy|si-comfort|si-thinking/);
});
