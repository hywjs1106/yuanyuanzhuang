import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readConversationState,writeConversationState,consumeConversationDraft} from '../src/terminal/conversationState';
const map=new Map<string,string>();const storage={getItem:(key:string)=>map.get(key)??null,setItem:(key:string,value:string)=>{map.set(key,value);}};
test('drafts and reading anchors are separate by companion and malformed values are ignored',()=>{
 map.clear();writeConversationState('si',{draft:'想去喝茶',firstId:'m1',anchor:{id:'m8',offset:-23},nearBottom:false,lastReadId:'m30'},storage);
 assert.equal(readConversationState('si',storage).draft,'想去喝茶');assert.equal(readConversationState('fangyi',storage).draft,'');
 writeConversationState('fangyi',{draft:'另一段话'},storage);assert.equal(readConversationState('si',storage).anchor?.offset,-23);
 for(const key of map.keys())map.set(key,'{"draft":14,"anchor":{"id":5,"offset":"bad"},"nearBottom":"no"}');
 assert.equal(readConversationState('si',storage).draft,'');assert.equal(readConversationState('si',storage).anchor,undefined);assert.equal(readConversationState('si',storage).nearBottom,true);
});
test('consuming a persisted message cannot erase a newer draft and storage failures stay usable',()=>{
 map.clear();writeConversationState('si',{draft:'第一句'},storage);writeConversationState('si',{draft:'正在写下一句'},storage);
 assert.equal(consumeConversationDraft('si','第一句',storage),false);assert.equal(readConversationState('si',storage).draft,'正在写下一句');
 assert.equal(consumeConversationDraft('si','正在写下一句',storage),true);assert.equal(readConversationState('si',storage).draft,'');
 const broken={getItem:()=>{throw new Error('blocked');},setItem:()=>{throw new Error('quota');}};
 assert.doesNotThrow(()=>writeConversationState('fangyi',{draft:'仍可在本次会话保留'},broken));assert.equal(readConversationState('fangyi',broken).draft,'仍可在本次会话保留');
});
test('write-only quota failure uses session fallback instead of rereading stale persisted text',()=>{
 const quota={getItem:()=>JSON.stringify({version:1,draft:'旧草稿',nearBottom:true,scrollTop:0}),setItem:()=>{throw new Error('quota');}};
 writeConversationState('si',{draft:'新草稿'},quota);assert.equal(readConversationState('si',quota).draft,'新草稿');
});
