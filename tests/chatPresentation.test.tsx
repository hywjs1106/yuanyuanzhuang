import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {AssistantPanel} from '../src/terminal/AssistantPanel';
import type {Message} from '../src/terminal/ledger';
const noop=async()=>{};
function render(messages:Message[]=[]){return renderToStaticMarkup(<AssistantPanel config={undefined} context="" messages={messages} onMessage={noop} onConfirm={noop}/>);}
test('empty conversation identifies Fangyi without configuration clutter or starting animation',()=>{
 const html=render(); assert.match(html,/<h2[^>]*>庄方宜<\/h2>/); assert.match(html,/src="\/characters\/stickers\/fy-01-08.jpg"/); assert.match(html,/管理员，今天过得怎么样/); assert.doesNotMatch(html,/离线预设|说清事项就能记账|有歧义时/); assert.match(html,/aria-label="方宜表情"/); assert.doesNotMatch(html,/\.gif/); assert.doesNotMatch(html,/确认保存/);
});
test('conversation preserves sender identity, machine readable times and date boundaries',()=>{
 const html=render([{id:'1',role:'user',text:'午饭很好吃',createdAt:'2026-10-13T04:05:00.000Z'},{id:'2',role:'assistant',text:'慢慢享用。',createdAt:'2026-10-14T04:06:00.000Z'}]);
 assert.match(html,/chat-message user/); assert.match(html,/chat-message assistant/); assert.match(html,/dateTime="2026-10-13T04:05:00.000Z"/); assert.match(html,/dateTime="2026-10-14T04:06:00.000Z"/); assert.match(html,/10月13日/); assert.match(html,/10月14日/); assert.match(html,/aria-label="和方宜说说"/); assert.doesNotMatch(html,/确认保存/);
});
