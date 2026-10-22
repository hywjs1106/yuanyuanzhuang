import { test } from 'node:test';
import assert from 'node:assert/strict';
import { executeAssistantActions } from '../src/terminal/assistantExecution';
import type { Proposal } from '../src/terminal/assistant';

const now = new Date(2026, 9, 14, 12);
const text = '帮我记一下午饭花了28元';
const ledger: Proposal = {kind:'ledger', direction:'expense', amount:28, date:'2026-10-14', note:'午饭', type:'food'};

test('deduplicates equal actions regardless of property order and retains stable operation IDs across retries', async () => {
  const reordered: Proposal = {date:'2026-10-14', amount:28, direction:'expense', kind:'ledger', type:'food', note:'午饭'};
  const operations: string[] = [];
  const execute = async (_action: Proposal, id: string) => { operations.push(id); return '流水已写入：28元'; };
  const signal = new AbortController().signal;
  const first = await executeAssistantActions(text, [ledger, reordered], 'request-7', execute, signal, now);
  const retry = await executeAssistantActions(text, [ledger, reordered], 'request-7', execute, signal, now);
  assert.deepEqual(operations, ['ai-request-7-0', 'ai-request-7-0']);
  assert.deepEqual(first.actions, [ledger]);
  assert.deepEqual(first.states, {0:'已保存'});
  assert.deepEqual(first.receipts, ['流水已写入：28元']);
  assert.deepEqual(retry.receipts, first.receipts);
});

test('an already cancelled batch performs zero writes and reports no saved states', async () => {
  const controller = new AbortController(); controller.abort();
  let writes = 0;
  const result = await executeAssistantActions(text, [ledger], 'cancelled', async () => { writes++; }, controller.signal, now);
  assert.equal(writes, 0);
  assert.deepEqual(result.states, {});
  assert.deepEqual(result.receipts, []);
});

test('a committed callback receipt survives cancellation and later operations never start', async () => {
  const controller = new AbortController();
  const second: Proposal = {...ledger, note:'第二笔'};
  const writes: string[] = [];
  const result = await executeAssistantActions(text, [ledger, second], 'stop', async (_action, id, signal) => {
    assert.equal(signal, controller.signal);
    writes.push(id); controller.abort(); return '第一笔已经落库';
  }, controller.signal, now);
  assert.deepEqual(writes, ['ai-stop-0']);
  assert.deepEqual(result.states, {0:'已保存'});
  assert.deepEqual(result.receipts, ['第一笔已经落库']);
});

test('a failed execution remains retryable and its receipt explicitly says it was not completed', async () => {
  const result = await executeAssistantActions(text, [ledger], 'failure', async () => { throw new Error('存储不可用'); }, new AbortController().signal, now);
  assert.deepEqual(result.states, {});
  assert.equal(result.receipts.length, 1);
  assert.deepEqual(result.errors, {0:'存储不可用'});
  assert.match(result.receipts[0], /未完成/);
  assert.match(result.receipts[0], /存储不可用/);
  assert.doesNotMatch(result.receipts[0], /已保存/);
});

test('ambiguous input leaves the action available for manual execution without writing', async () => {
  let writes = 0;
  const action: Proposal = {kind:'reminder', title:'交电费', at:'2026-10-15T09:00', repeat:'none'};
  const result = await executeAssistantActions('明天九点提醒我交电费', [action], 'ambiguous', async () => { writes++; return '完成'; }, new AbortController().signal, now);
  assert.equal(writes, 0);
  assert.deepEqual(result.actions, [action]);
  assert.deepEqual(result.states, {});
  assert.deepEqual(result.receipts, []);
});

test('waits for the singular approved write and suppresses extra matching metadata variants', async () => {
  const second: Proposal = {...ledger, note:'第二笔', type:'other'};
  let finishFirst!: () => void;
  const gate = new Promise<void>(resolve => { finishFirst = resolve; });
  const writes: string[] = [];
  const pending = executeAssistantActions(text, [ledger, second], 'sequence', async (_action, id) => {
    writes.push(id);
    if (id === 'ai-sequence-0') { await gate; return '真实结果'; }
  }, new AbortController().signal, now);
  await Promise.resolve();
  assert.deepEqual(writes, ['ai-sequence-0']);
  finishFirst();
  const result = await pending;
  assert.deepEqual(writes, ['ai-sequence-0']);
  assert.deepEqual(result.states, {0:'已保存', 1:'已忽略'});
  assert.equal(result.receipts[0], '真实结果');
  assert.match(result.receipts[1], /重复.*忽略.*未执行/);
});

test('retains distinct transactions for manual review when the input requests multiple amounts', async () => {
  const second: Proposal = {...ledger, amount:12, note:'咖啡'};
  let writes = 0;
  const result = await executeAssistantActions('帮我记录午饭28元和咖啡12元', [ledger, second], 'multiple', async () => { writes++; }, new AbortController().signal, now);
  assert.equal(writes, 0);
  assert.deepEqual(result.actions, [ledger, second]);
  assert.deepEqual(result.states, {});
});

test('does not retry a failed singular write automatically via a duplicate matching proposal', async () => {
  const second: Proposal = {...ledger, note:'模型重写的午饭'};
  let writes = 0;
  const result = await executeAssistantActions(text, [ledger, second], 'one-attempt', async () => { writes++; throw new Error('失败'); }, new AbortController().signal, now);
  assert.equal(writes, 1);
  assert.deepEqual(result.states, {1:'已忽略'});
  assert.match(result.receipts[0], /未完成/);
  assert.match(result.receipts[1], /重复.*忽略.*未执行/);
});
