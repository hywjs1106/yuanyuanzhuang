import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAssistantReply, localAssistantReply } from '../src/terminal/assistant';
test('AI malformed and unsupported actions never become executable proposals', () => {
  assert.throws(() => parseAssistantReply('{"reply":"ok","actions":[{"kind":"deleteAll"}]}'));
  assert.throws(() => parseAssistantReply('{"reply":"ok","actions":[{"kind":"ledger","amount":-9,"direction":"expense","date":"2026-10-14"}]}'));
  assert.throws(() => parseAssistantReply('{"reply":"ok","actions":[{"kind":"reminder","title":"交费","at":"2026-02-30T09:00","repeat":"none"}]}'));
});
test('one AI response can propose several entries without writing them', () => {
  const p = parseAssistantReply('```json\n{"reply":"请确认","actions":[{"kind":"ledger","direction":"expense","amount":28,"date":"2026-10-14","note":"午饭","type":"food"},{"kind":"note","text":"买洗衣液"}]}\n```');
  assert.equal(p.actions.length, 2);
  assert.equal(p.actions[0].kind, 'ledger');
});
test('without AI, an explicit record command produces a proposal and ambiguous reminders stay unscheduled', () => {
  assert.equal(localAssistantReply('帮我记一下午饭花了28元', new Date(2026, 9, 14)).actions[0].kind, 'ledger');
  assert.equal(localAssistantReply('明天提醒我交电费', new Date(2026, 9, 14)).actions.length, 0);
});

test('duplicate validated actions collapse and unknown sticker IDs never invalidate actions', () => {
  const action={kind:'reminder',title:'交费',at:'2026-10-15T09:00',repeat:'none'};
  const result=parseAssistantReply(JSON.stringify({reply:'正在安排',actions:[action, {...action}],stickerId:'https://evil.invalid/sticker.png'}));
  assert.equal(result.actions.length,1);
  assert.equal(result.stickerId,undefined);
  assert.throws(()=>parseAssistantReply('null'));
  assert.throws(()=>parseAssistantReply('{"reply":"ok","actions":[null]}'));
});
