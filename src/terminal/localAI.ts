import type {AIConfig} from '@/utils/aiClient';
export const LOCAL_MODEL_ORIGIN='https://192.168.10.2:11435';
const LOCAL_MODEL_BASE_URL=`${LOCAL_MODEL_ORIGIN}/v1`;
function record(value:unknown,keys:string[]):value is Record<string,unknown>{
  return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.prototype.hasOwnProperty.call(value,key));
}
export function parseLocalAIConnection(value:unknown):AIConfig{
  if(!record(value,['format','version','ai'])||value.format!=='daily-terminal-local-ai'||value.version!==1)throw new Error('请选择有效的电脑连接文件');
  const ai=value.ai;
  if(!record(ai,['baseUrl','model','apiKey','provider','protocol'])||ai.baseUrl!==LOCAL_MODEL_BASE_URL||ai.model!=='qwen3.5-fast:latest'||typeof ai.apiKey!=='string'||!/^dt-local-[A-Za-z0-9_-]{32,}$/.test(ai.apiKey)||ai.provider!=='custom'||ai.protocol!=='openai')throw new Error('电脑连接文件中的地址、模型或口令无效');
  return {baseUrl:ai.baseUrl,model:ai.model,apiKey:ai.apiKey,provider:'custom',protocol:'openai'};
}
export function assertLocalCredentialTarget(baseUrl:string,key:string):void{
  if(key.trim().startsWith('dt-local-')&&baseUrl!==LOCAL_MODEL_BASE_URL)throw new Error('电脑连接口令只能用于原电脑连接地址，请重新导入电脑连接');
}
