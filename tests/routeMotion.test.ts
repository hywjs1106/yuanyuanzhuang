import {test} from 'node:test';import assert from 'node:assert/strict';import {routeMotion} from '../src/terminal/routeMotion';
test('navigation explains parent-child depth separately from primary destinations',()=>{
 assert.equal(routeMotion('today','ledger'),'push');assert.equal(routeMotion('ledger','today'),'pop');assert.equal(routeMotion('settings','notes'),'push');assert.equal(routeMotion('notes','settings'),'pop');
 for(const target of ['assistant','settings'] as const)assert.equal(routeMotion('today',target),'tab');assert.equal(routeMotion('assistant','today'),'tab');assert.equal(routeMotion('assistant','today',true),'pop');assert.equal(routeMotion('ledger','assistant'),'tab');
});
