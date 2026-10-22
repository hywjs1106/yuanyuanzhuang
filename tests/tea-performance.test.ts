import test from 'node:test';
import assert from 'node:assert/strict';
import {parseTeaModelReply,performancePrompt,siActions,moliaoActions} from '../src/terminal/inn-preview/performance';

test('model performance metadata decides actions independently of dialogue keywords',()=>{
 const reply=parseTeaModelReply(JSON.stringify({reply:'这件事值得慢慢说。',performance:{action:'listen',summon:'peek'}}));
 assert.equal(reply.action,'listen');assert.equal(reply.summon,'peek');
 assert.equal(parseTeaModelReply('{"reply":"我很开心","performance":{"action":"none","summon":"none"}}').action,undefined);
});
test('unsupported performance cannot break readable reply or inject arbitrary media',()=>{
 const r=parseTeaModelReply('{"reply":"我在听。","performance":{"action":"https://invalid.example/x","summon":"runCode"}}');
 assert.equal(r.text,'我在听。');assert.equal(r.action,undefined);assert.equal(r.summon,undefined);
 assert.equal(parseTeaModelReply('普通文字回复').text,'普通文字回复');
 assert.throws(()=>parseTeaModelReply('{"performance":{"action":"happy"}}'));
 assert.throws(()=>parseTeaModelReply('{broken json'));
});
test('all curated actions are available to the model and none is a supported choice',()=>{
 assert.equal(Object.keys(siActions).length,12);assert.equal(Object.keys(moliaoActions).length,6);
 for(const name of [...Object.keys(siActions),...Object.keys(moliaoActions),'none'])assert.ok(performancePrompt.includes(name));
 assert.ok(performancePrompt.includes('语义'));assert.ok(performancePrompt.includes('不要按关键词'));
});
