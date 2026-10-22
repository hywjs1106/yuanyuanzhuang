import type {AIMode} from './aiProfiles';
export function AIModeControl({value,onChange,disabled=false,label='对话模型'}:{value:AIMode;onChange:(mode:AIMode)=>void;disabled?:boolean;label?:string}){
 return <div className="ai-mode-control" role="group" aria-label={label}>{([{id:'local',label:'本地模型'},{id:'api',label:'API'}] as const).map(choice=><button type="button" key={choice.id} aria-pressed={value===choice.id} disabled={disabled} onClick={()=>onChange(choice.id)}><span className="ai-mode-dot" aria-hidden="true"/>{choice.label}</button>)}</div>;
}
