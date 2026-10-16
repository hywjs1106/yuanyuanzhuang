import { test } from 'node:test';
import assert from 'node:assert/strict';
import { askAssistant, buildAssistantMessages, localAssistantReply } from '../src/terminal/assistant';
import type { AIMessage } from '../src/utils/aiClient';

const now = new Date(2026, 9, 17, 12, 0);
const config = { apiKey: 'test-key', baseUrl: 'https://example.invalid/v1', model: 'test-model', provider: 'custom' as const };

test('Si uses her own identity and excludes the Fangyi sticker catalog in the actual model prompt', () => {
  const prompt = buildAssistantMessages('你好', '账本数据', [], now, 'si')[0].content;
  assert.match(prompt, /祀/);
  assert.match(prompt, /缘缘庄/);
  assert.match(prompt, /si-smile/);
  assert.doesNotMatch(prompt, /fy-01-01|庄方宜的角色风格/);
  assert.match(prompt, /终端返回真实执行结果前不能说已经保存或安排完成/);
});

test('Si offline replies identify Si and disclose their preset limitation without Fangyi stickers', () => {
  const identity = localAssistantReply('你是谁', now, 'si');
  assert.match(identity.reply, /祀/);
  assert.match(identity.reply, /离线预设回复/);
  const greeting = localAssistantReply('你好', now, 'si');
  assert.notEqual(greeting.reply, localAssistantReply('你好', now).reply);
  assert.match(greeting.reply, /离线预设回复/);
  assert.equal(greeting.stickerId, undefined);
  assert.deepEqual(greeting.actions, []);
});

test('Si keeps conservative ledger and reminder parsing identical to the default character', () => {
  for (const text of ['帮我记一下午饭花了28元', '明天上午九点提醒我交电费', '明天提醒我交电费', '今天咖啡花了28元', '不要记账午饭28元']) {
    assert.deepEqual(localAssistantReply(text, now, 'si').actions, localAssistantReply(text, now).actions);
  }
  assert.equal(localAssistantReply('帮我记一下午饭花了28元', now, 'si').actions[0]?.kind, 'ledger');
  assert.equal(localAssistantReply('明天上午九点提醒我交电费', now, 'si').actions[0]?.kind, 'reminder');
});

test('Si reaches the transport with her own prompt and removes even valid Fangyi provider stickers', async () => {
  let request: AIMessage[] = [];
  const action = { kind: 'note', text: '买纸' };
  const reply = await askAssistant('帮我备忘买纸', config, '上下文', [], new AbortController().signal, async (_config, messages) => {
    request = messages;
    return JSON.stringify({ reply: '先把这件事交给终端。', actions: [action], stickerId: 'fy-01-01' });
  }, 'si');
  assert.match(request[0].content, /缘缘庄/);
  assert.doesNotMatch(request[0].content, /庄方宜的角色风格|fy-01-01/);
  assert.deepEqual(reply.actions, [action]);
  assert.equal(reply.stickerId, undefined);
});

test('Si remains selected when askAssistant falls back to offline replies', async () => {
  const reply = await askAssistant('你是谁', undefined, '', [], new AbortController().signal, undefined, 'si');
  assert.match(reply.reply, /祀/);
  assert.doesNotMatch(reply.reply, /方宜/);
});
