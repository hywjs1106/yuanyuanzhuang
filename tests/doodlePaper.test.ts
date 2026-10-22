import test from 'node:test';
import assert from 'node:assert/strict';
import {clearDoodlePaper,hasDoodleCutout} from '../src/terminal/doodlePaper';
test('only edge-connected neutral paper is cleared; enclosed white and colored foreground stay opaque',()=>{
 const width=21,height=21,pixels=new Uint8ClampedArray(width*height*4);
 for(let i=0;i<pixels.length;i+=4)pixels.set([235,235,235,255],i);
 for(let y=7;y<=13;y++)for(let x=7;x<=13;x++){const edge=x===7||x===13||y===7||y===13;pixels.set(edge?[24,26,25,255]:[248,248,248,255],(y*width+x)*4);}
 pixels.set([195,225,180,255],(1*width+4)*4);pixels.set([235,235,235,255],(7*width+10)*4);const original=pixels.slice();
 clearDoodlePaper(pixels,width,height);
 assert.equal(pixels[3],0);assert.equal(pixels[(10*width+10)*4+3],255);assert.deepEqual(pixels.slice((10*width+10)*4,(10*width+10)*4+4),original.slice((10*width+10)*4,(10*width+10)*4+4));assert.equal(pixels[(1*width+4)*4+3],255);assert.equal(pixels[(7*width+7)*4+3],255);
});

test('slightly green pale hair is not mistaken for neutral white paper',()=>{
 const pixels=new Uint8ClampedArray(11*11*4);for(let i=0;i<pixels.length;i+=4)pixels.set([235,235,235,255],i);const p=(5*11+5)*4;pixels.set([219,220,213,255],p);
 clearDoodlePaper(pixels,11,11);
 assert.equal(pixels[3],0);assert.deepEqual(Array.from(pixels.slice(p,p+4)),[219,220,213,255]);
});

test('opaque or partially unremoved backgrounds are rejected before display',()=>{
 const pixels=new Uint8ClampedArray(100*4);pixels.fill(255);assert.equal(hasDoodleCutout(pixels,10,10),false);
 for(let p=3;p<pixels.length;p+=4)pixels[p]=0;assert.equal(hasDoodleCutout(pixels,10,10),true);
 for(let i=12;i<70;i++)pixels[i*4+3]=255;assert.equal(hasDoodleCutout(pixels,10,10),false);
});
