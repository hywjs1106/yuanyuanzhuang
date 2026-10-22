import {chatComplete,type AIConfig,type AIMessage} from '@/utils/aiClient';
import {assertLocalCredentialTarget} from '../localAI';
import {siPersona} from '../siPersona';
import {parseTeaModelReply,performancePrompt} from './performance';
import type {TeaMessage} from './useTeaConversation';

export async function askTeaModel(config:AIConfig,text:string,history:TeaMessage[],signal:AbortSignal){
 assertLocalCredentialTarget(config.baseUrl,config.apiKey);
 const messages:AIMessage[]=[{role:'system',content:`${siPersona.prompt}\n${performancePrompt}`},
  ...history.slice(-16).map((m):AIMessage=>({role:m.who==='si'?'assistant':'user',content:m.who==='si'?JSON.stringify({reply:m.text,performance:{action:m.action??'none',summon:m.summon??'none'}}):m.text})),{role:'user',content:text}];
 const raw=await chatComplete(config,messages,{signal,timeoutMs:60000,maxTokens:1600,jsonMode:false});
 if(signal.aborted)throw new DOMException('已停止','AbortError');
 return parseTeaModelReply(raw);
}
