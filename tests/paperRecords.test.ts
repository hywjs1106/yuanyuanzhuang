import {test} from 'node:test';
import assert from 'node:assert/strict';
import {groupLedgerDays,reminderPaperGroup} from '../src/terminal/paperRecords';
import {createReminder} from '../src/terminal/reminders';
test('ledger pages group by stored calendar day and order newest first without mutating records',()=>{
 const entries=[{date:'2026-10-16',id:'a',createdAt:new Date('2026-10-17T00:30Z')},{date:'2026-10-17',id:'b',createdAt:new Date('2026-10-16T23:00Z')},{date:'2026-10-16',id:'c',createdAt:new Date('2026-10-17T01:00Z')}];
 assert.deepEqual(groupLedgerDays(entries).map(g=>[g.date,g.entries.map(e=>e.id)]),[['2026-10-17',['b']],['2026-10-16',['c','a']]]);assert.equal(entries[0].id,'a');
});
test('reminder paper groups preserve paused and completed states and use local calendar boundaries',()=>{
 const now=new Date(2026,9,17,23,30);const make=(startAt:string)=>createReminder({title:'测试',startAt,recurrence:'once'},[],now);
 assert.equal(reminderPaperGroup(make('2026-10-18T00:10'),now),'明日');
 assert.equal(reminderPaperGroup(make('2026-10-17T23:45'),now),'今日');
 assert.equal(reminderPaperGroup(make('2026-10-16T12:00'),now),'已到期');
 assert.equal(reminderPaperGroup({...make('2026-10-16T12:00'),enabled:false},now),'已暂停');
 assert.equal(reminderPaperGroup({...make('2026-10-16T12:00'),enabled:false,completedAt:now.toISOString()},now),'已完成');
 assert.equal(reminderPaperGroup(make('2026-10-19T12:00'),now),'之后');
});
