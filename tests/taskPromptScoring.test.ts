import test from 'node:test';
import assert from 'node:assert/strict';
import {onlyAction} from '../scripts/task-prompt-scoring.mjs';
test('a correct action plus an unrelated write cannot pass evaluation',()=>{
 const correct={kind:'ledger',amount:28};
 assert.equal(onlyAction({actions:[correct]},'ledger',(a:any)=>a.amount===28),true);
 assert.equal(onlyAction({actions:[correct,{kind:'note',text:'extra'}]},'ledger',(a:any)=>a.amount===28),false);
 assert.equal(onlyAction({actions:[]},'ledger',()=>true),false);
 const allowed=(a:any)=>a.value?.amount===31&&Object.keys(a.value).length===1;
 assert.equal(onlyAction({actions:[{kind:'manage',value:{amount:31,date:'2026-01-01'}}]},'manage',allowed),false);
});
