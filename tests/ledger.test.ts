import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEntry, summarizeLedger, parseMoney, validateBackup, makeBackup } from '../src/terminal/ledger';

const entry = { id: 'one', direction: 'expense' as const, amount: 28, currency: 'CNY', date: '2026-10-14', source: 'manual' as const, createdAt: new Date('2026-10-14T01:00:00Z'), type: 'food' as const };
test('invalid amounts and impossible dates cannot enter the ledger', () => {
  assert.throws(() => validateEntry({ ...entry, amount: -1 }));
  assert.throws(() => validateEntry({ ...entry, amount: Infinity }));
  assert.throws(() => validateEntry({ ...entry, date: '2026-02-30' }));
  assert.throws(() => parseMoney('1.234'));
  assert.equal(parseMoney('0.10'), 0.1);
});
test('balance includes signed adjustments while monthly expenses exclude them', () => {
  const entries = [entry, { ...entry, id: 'two', amount: 0.1 }, { ...entry, id: 'three', amount: 0.2 }, { ...entry, id: 'four', direction: 'income' as const, amount: 100 }, { ...entry, id: 'five', direction: 'adjust' as const, amount: -5 }];
  assert.deepEqual(summarizeLedger(entries, '2026-10'), { balance: 66.7, income: 100, expense: 28.3 });
});
test('backup roundtrip preserves all records and removes provider credentials', () => {
  const backup = makeBackup({ entries: [entry], reminders: [], notes: [{ id: 'n', text: '购物清单', createdAt: '2026-10-14T00:00:00Z' }], messages: [], settings: { id: 'main', budget: 1200, ai: { baseUrl: 'https://example.com/v1', model: 'test', apiKey: 'SECRET' }, weather: { provider: 'qweather', apiKey: 'WEATHERSECRET' } } });
  assert.equal(JSON.stringify(backup).includes('SECRET'), false);
  const restored = validateBackup(JSON.parse(JSON.stringify(backup)));
  assert.equal(restored.entries[0].createdAt instanceof Date, true);
  assert.equal(restored.notes[0].text, '购物清单');
});
test('malformed backup rejects the entire import rather than silently dropping bad entries', () => {
  const b = makeBackup({ entries: [entry], reminders: [], notes: [], messages: [], settings: { id: 'main', budget: 0 } });
  assert.throws(() => validateBackup({ ...b, entries: [entry, { ...entry, id: 'two', amount: 'bad' }] }));
  assert.throws(() => validateBackup({ ...b, entries: [entry, entry] }));
  assert.throws(() => validateBackup({ ...b, format: 'unknown' }));
});

test('sticker chat backups retain known IDs, accept old messages and reject unknown assets',()=>{
 const message={id:'chat',role:'assistant' as const,text:'晚安',createdAt:'2026-10-14T00:00:00Z',stickerId:'fy-01-04'};
 const backup=makeBackup({entries:[],reminders:[],notes:[],messages:[message],settings:{id:'main',budget:0}});
 assert.equal(validateBackup(JSON.parse(JSON.stringify(backup))).messages[0].stickerId,message.stickerId);
 const {stickerId,...old}=message;
 assert.equal(validateBackup({...backup,messages:[old]}).messages[0].stickerId,undefined);
 assert.throws(()=>validateBackup({...backup,messages:[{...message,stickerId:'https://arbitrary.invalid/image'}]}));
});
