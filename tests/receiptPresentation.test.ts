import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compactActionSummary} from '../src/terminal/receiptPresentation';
import {makeBackup,validateBackup,type Message} from '../src/terminal/ledger';
test('only complete non-reminder success gets compact display; full receipt remains in backup',()=>{
 const ledger={kind:'ledger',direction:'expense',amount:28,date:'2026-10-18'} as const;
 assert.equal(compactActionSummary([ledger],{0:'已保存'}),'已记入账簿。');
 assert.equal(compactActionSummary([ledger],{}),undefined);
 assert.equal(compactActionSummary([ledger,ledger],{0:'已保存',1:'已忽略'}),undefined);
 assert.equal(compactActionSummary([{kind:'reminder',title:'浇花',at:'2099-10-18T09:00',repeat:'none'}],{0:'已保存'}),undefined);
 const message:Message={id:'receipt',role:'assistant',text:'已记账：2026-10-18 · 支出 ¥28.00。',receiptSummary:'已记入账簿。',createdAt:new Date().toISOString()};
 const backup=makeBackup({entries:[],reminders:[],notes:[],messages:[message],settings:{id:'main',budget:0}});
 assert.deepEqual(validateBackup(backup).messages,[message]);
 assert.throws(()=>validateBackup({...backup,messages:[{...message,receiptSummary:'字'.repeat(201)}]}));
});
