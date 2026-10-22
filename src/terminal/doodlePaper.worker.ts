import {clearDoodlePaper,hasDoodleCutout} from './doodlePaper';
self.onmessage=({data}:{data:{id:number;pixels:Uint8ClampedArray;width:number;height:number}})=>{
 clearDoodlePaper(data.pixels,data.width,data.height);
 if(!hasDoodleCutout(data.pixels,data.width,data.height)){self.postMessage({id:data.id,error:'Incomplete cutout'});return;}
 self.postMessage({id:data.id,pixels:data.pixels}, {transfer:[data.pixels.buffer]});
};
