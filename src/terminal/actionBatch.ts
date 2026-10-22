import type {Proposal} from './assistant';
import {parseAssistantReply} from './assistant';
import type {ProposalFields} from './proposalDraft';
export interface ActionBatch {actions:Proposal[];states:Record<number,string>;errors:Record<number,string>;drafts:Record<number,ProposalFields>;}
export type ActionChange={kind:'edit';proposal:Proposal}|{kind:'draft';fields?:ProposalFields}|{kind:'ignore'}|{kind:'error';message:string}|{kind:'result';state?:string;error?:string};
/** Optional Message metadata. Neither restores nor validates by executing actions. */
export function validateActionBatch(value:unknown):ActionBatch{
 const b=value as ActionBatch;if(!b||!Array.isArray(b.actions)||b.actions.length>20||!b.actions.length)throw new Error('确认事项格式不正确');
 const actions=b.actions.map(a=>parseAssistantReply(JSON.stringify({reply:'',actions:[a]})).actions[0]);
 const record=(v:unknown)=>{if(!v||typeof v!=='object'||Array.isArray(v))throw new Error('确认事项状态不正确');return Object.entries(v).map(([key,value])=>{if(!/^(0|[1-9]\d*)$/.test(key)||Number(key)>=actions.length)throw new Error('确认事项编号不正确');return [key,value] as const;});};
 const states=Object.fromEntries(record(b.states).map(([k,v])=>{if(v!=='已保存'&&v!=='已忽略')throw new Error('确认事项状态不正确');return [k,v];}));
 const errors=Object.fromEntries(record(b.errors).map(([k,v])=>{if(typeof v!=='string'||v.length>2000)throw new Error('确认事项错误提示不正确');return [k,v];}));
 const allowed=['direction','amount','date','type','note','title','at','repeat','text'];
 const drafts=Object.fromEntries(record(b.drafts).map(([k,v])=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.entries(v).some(([field,text])=>!allowed.includes(field)||typeof text!=='string'||text.length>10000))throw new Error('确认事项草稿不正确');return [k,{...v}];}));
 return {actions,states,errors,drafts};
}
