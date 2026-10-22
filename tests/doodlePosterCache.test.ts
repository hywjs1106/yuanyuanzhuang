import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderDoodlePoster} from '../src/terminal/doodlePaperRenderer';

test('simultaneous static requests share processing; a failed cutout can retry',async()=>{
 let runs=0;const pixels=new Uint8ClampedArray([20,40,30,255]);
 const render=async()=>{runs++;return pixels;};
 const [first,second]=await Promise.all([renderDoodlePoster('test:shared',render),renderDoodlePoster('test:shared',render)]);
 assert.equal(runs,1);assert.equal(first,second);
 await assert.rejects(renderDoodlePoster('test:retry',async()=>{throw new Error('Incomplete cutout');}),/Incomplete cutout/);
 assert.equal(await renderDoodlePoster('test:retry',render),pixels);
});

test('the static cache is bounded and never substitutes a differently sized poster',async()=>{
 let runs=0;const render=async()=>{runs++;return new Uint8ClampedArray(4);};
 await renderDoodlePoster('test:old:384x216',render);
 for(let i=0;i<6;i++)await renderDoodlePoster(`test:figure-${i}:384x216`,render);
 const before=runs;await renderDoodlePoster('test:old:384x216',render);assert.equal(runs,before+1);
 await renderDoodlePoster('test:old:192x108',render);assert.equal(runs,before+2);
});
