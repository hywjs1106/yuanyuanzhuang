import type {VisualTheme} from './ledger';
export interface ConversationView {
 version:1;draft:string;nearBottom:boolean;scrollTop:number;
 firstId?:string;anchor?:{id:string;offset:number};lastReadId?:string;
}
type StoragePort=Pick<Storage,'getItem'|'setItem'>;
const memory=new Map<string,ConversationView>();
const unsaved=new WeakMap<StoragePort,Set<string>>();
const listeners=new Map<VisualTheme,Set<(draft:string)=>void>>();
const fresh=():ConversationView=>({version:1,draft:'',nearBottom:true,scrollTop:0});
const key=(character:VisualTheme)=>`daily-terminal-chat-view-v1:${character}`;
function browserStorage(){try{return globalThis.localStorage;}catch{return undefined;}}
function validId(value:unknown):value is string{return typeof value==='string'&&value.length>0&&value.length<=200;}
function normalize(value:unknown):ConversationView{
 if(!value||typeof value!=='object'||(value as ConversationView).version!==1)return fresh();
 const s=value as ConversationView;
 return {version:1,draft:typeof s.draft==='string'?s.draft.slice(0,6000):'',nearBottom:typeof s.nearBottom==='boolean'?s.nearBottom:true,
  scrollTop:typeof s.scrollTop==='number'&&Number.isFinite(s.scrollTop)?Math.max(0,Math.min(s.scrollTop,1e8)):0,
  ...(validId(s.firstId)?{firstId:s.firstId}:{}),...(validId(s.lastReadId)?{lastReadId:s.lastReadId}:{}),
  ...(s.anchor&&validId(s.anchor.id)&&typeof s.anchor.offset==='number'&&Number.isFinite(s.anchor.offset)&&Math.abs(s.anchor.offset)<1e6?{anchor:{id:s.anchor.id,offset:s.anchor.offset}}:{}),
 };
}
export function readConversationState(character:VisualTheme,storage:StoragePort|undefined=browserStorage()):ConversationView{
 if(storage&&unsaved.get(storage)?.has(key(character)))return normalize(memory.get(key(character)));
 try{if(storage){const raw=storage.getItem(key(character));return raw?normalize(JSON.parse(raw)):fresh();}}catch{/* Retain this session when browser storage is unavailable. */}
 return normalize(memory.get(key(character)));
}
export function writeConversationState(character:VisualTheme,patch:Partial<ConversationView>,storage:StoragePort|undefined=browserStorage()):ConversationView{
 const next=normalize({...readConversationState(character,storage),...patch,version:1});memory.set(key(character),next);
 try{storage?.setItem(key(character),JSON.stringify(next));if(storage)unsaved.get(storage)?.delete(key(character));}catch{
  if(storage){let keys=unsaved.get(storage);if(!keys){keys=new Set();unsaved.set(storage,keys);}keys.add(key(character));}
 }
 if(typeof patch.draft==='string')listeners.get(character)?.forEach(listener=>listener(next.draft));
 return next;
}
export function subscribeConversationDraft(character:VisualTheme,listener:(draft:string)=>void){
 let group=listeners.get(character);if(!group){group=new Set();listeners.set(character,group);}group.add(listener);
 return()=>{group.delete(listener);};
}
/** Only clear the exact text successfully written to the conversation. */
export function consumeConversationDraft(character:VisualTheme,expected:string,storage:StoragePort|undefined=browserStorage()):boolean{
 if(readConversationState(character,storage).draft!==expected)return false;
 writeConversationState(character,{draft:''},storage);return true;
}
