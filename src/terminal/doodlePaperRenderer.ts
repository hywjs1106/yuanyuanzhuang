import {clearDoodlePaper,hasDoodleCutout} from './doodlePaper';
let worker:Worker|null=null,sequence=0;
type DoodlePixels=Uint8ClampedArray<ArrayBuffer>;
const jobs=new Map<number,{resolve:(pixels:DoodlePixels)=>void;reject:(error:Error)=>void}>();
// Six fixed character posters, not video frames: at most ~2 MiB of RGBA data.
const posters=new Map<string,Promise<DoodlePixels>>();
export function renderDoodlePoster(key:string,render:()=>Promise<DoodlePixels>){
 const existing=posters.get(key);if(existing)return existing;
 if(posters.size>=6)posters.delete(posters.keys().next().value!);
 const pending=Promise.resolve().then(render);posters.set(key,pending);
 void pending.catch(()=>{if(posters.get(key)===pending)posters.delete(key);});
 return pending;
}
/** Share one idle worker across figures; never run background flood-fill on the UI thread. */
export function renderDoodlePaper(pixels:DoodlePixels,width:number,height:number):Promise<DoodlePixels>{
 if(typeof Worker==='undefined'){clearDoodlePaper(pixels,width,height);return hasDoodleCutout(pixels,width,height)?Promise.resolve(pixels):Promise.reject(new Error("Incomplete cutout"));}
 if(!worker){
  worker=new Worker(new URL('./doodlePaper.worker.ts',import.meta.url),{type:'module'});
  worker.onmessage=({data}:{data:{id:number;pixels:DoodlePixels;error?:string}})=>{const job=jobs.get(data.id);jobs.delete(data.id);if(data.error)job?.reject(new Error(data.error));else job?.resolve(data.pixels);};
  worker.onerror=()=>{for(const job of jobs.values())job.reject(new Error('Doodle renderer unavailable'));jobs.clear();worker?.terminate();worker=null;};
 }
 const id=++sequence;
 return new Promise((resolve,reject)=>{jobs.set(id,{resolve,reject});worker!.postMessage({id,pixels,width,height},[pixels.buffer]);});
}
