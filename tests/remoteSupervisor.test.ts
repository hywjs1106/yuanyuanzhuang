import test from 'node:test';
import assert from 'node:assert/strict';
import {retryDelay,acquireSupervisorSlot} from '../scripts/remote-model-supervisor.mjs';
test('network reconnect backs off but never exceeds thirty seconds',()=>{
 assert.deepEqual([0,1,2,3,4,9].map(retryDelay),[2000,4000,8000,16000,30000,30000]);
});
test('the OS owns the single-instance slot and releases it without relying on recycled PIDs',async()=>{
 const first=await acquireSupervisorSlot(0);const port=(first.address() as any).port;
 await assert.rejects(acquireSupervisorSlot(port),(error:any)=>error.code==='EADDRINUSE');
 await new Promise<void>(r=>first.close(()=>r()));
 const replacement=await acquireSupervisorSlot(port);await new Promise<void>(r=>replacement.close(()=>r()));
});
