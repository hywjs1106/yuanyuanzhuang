import type {AIConfig} from '@/utils/aiClient';
import type {TerminalSettings} from './ledger';
export type AIMode='local'|'api';
export type AIProfiles=Partial<Record<AIMode,AIConfig>>;
export function aiMode(settings:Pick<TerminalSettings,'ai'|'aiMode'>):AIMode{
 if(settings.aiMode)return settings.aiMode;
 if(/^dt-(?:local|remote)-/.test(settings.ai?.apiKey??''))return 'local';
 try{const h=new URL(settings.ai?.baseUrl??'').hostname;if(/^(?:localhost|127\.|192\.168\.|10\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(h))return 'local';}catch{}
 return 'api';
}
export function aiProfiles(settings:TerminalSettings):AIProfiles{
 return settings.aiProfiles?{...settings.aiProfiles}:settings.ai?{[aiMode(settings)]:{...settings.ai}}:{};
}
export function withAIProfile(settings:TerminalSettings,mode:AIMode,config:AIConfig|undefined):TerminalSettings{
 return {...settings,aiMode:mode,aiProfiles:{...aiProfiles(settings),[mode]:config},ai:config};
}
export function selectAIProfile(settings:TerminalSettings,mode:AIMode):TerminalSettings{
 const config=aiProfiles(settings)[mode];if(!config?.apiKey?.trim()||!config.model?.trim()||!config.baseUrl?.trim())throw new Error(`${mode==='local'?'本地模型':'API'}尚未配置，请到设置的 AI 接口填写后保存。`);
 return withAIProfile(settings,mode,config);
}
/** Explicit whitelist: a backup must never retain credentials in either slot. */
export function publicAIProfiles(value:unknown):AIProfiles|undefined{
 if(value===undefined)return undefined;
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['local','api'].includes(k)))throw new Error('AI 配置分组不正确');
 const profiles:AIProfiles={};for(const mode of ['local','api'] as const){const c=(value as AIProfiles)[mode];if(c===undefined)continue;
  if(!c||typeof c.baseUrl!=='string'||!/^https:\/\//.test(c.baseUrl)||typeof c.model!=='string'||(c.protocol!==undefined&&!['openai','anthropic'].includes(c.protocol)))throw new Error('AI 地址或模型不正确');
  const url=new URL(c.baseUrl);if(url.username||url.password||url.hash)throw new Error('AI 服务地址不正确');
  profiles[mode]={baseUrl:c.baseUrl,model:c.model,apiKey:'',provider:'custom',protocol:c.protocol??'openai'};
 }return profiles;
}
