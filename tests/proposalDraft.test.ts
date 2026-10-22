import {test} from 'node:test';
import assert from 'node:assert/strict';
import {applyProposalDraft} from '../src/terminal/proposalDraft';
import {createBackLayers} from '../src/terminal/backLayers';

test('edited drafts validate money, calendar and text without writing records',()=>{
 const original={kind:'ledger',direction:'expense',amount:28,date:'2026-10-17',type:'food',note:'午饭'} as const;
 assert.deepEqual(applyProposalDraft(original,{amount:'32.50',date:'2026-10-18',note:'晚饭',direction:'income',type:'other'}),{kind:'ledger',direction:'income',amount:32.5,date:'2026-10-18',note:'晚饭',type:'other'});
 assert.equal(original.amount,28);
 assert.throws(()=>applyProposalDraft(original,{amount:'-2'}));
 assert.throws(()=>applyProposalDraft(original,{amount:'1.123'}));
 assert.throws(()=>applyProposalDraft(original,{date:'2026-02-30'}));
 const reminder={kind:'reminder',title:'浇花',at:'2099-10-18T09:00',repeat:'none'} as const;
 assert.equal(applyProposalDraft(reminder,{title:'浇花和换水',repeat:'weekly'}).kind,'reminder');
 assert.throws(()=>applyProposalDraft(reminder,{at:'2099-10-18T25:00'}));
 assert.throws(()=>applyProposalDraft(reminder,{title:' '}));
 assert.throws(()=>applyProposalDraft({kind:'note',text:'原文'},{text:' '}));
});

test('back consumes exactly the newest layer and unregisters independently',()=>{
 const layers=createBackLayers();const closed:string[]=[];
 const removeA=layers.add(()=>{closed.push('a');removeA();});
 const removeB=layers.add(()=>{closed.push('b');removeB();});
 assert.equal(layers.dismiss(),true);assert.deepEqual(closed,['b']);
 assert.equal(layers.dismiss(),true);assert.deepEqual(closed,['b','a']);
 assert.equal(layers.dismiss(),false);
 const remove=layers.add(()=>closed.push('removed'));remove();remove();assert.equal(layers.dismiss(),false);
});
