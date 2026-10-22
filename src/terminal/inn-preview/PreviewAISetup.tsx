import {useState} from 'react';
import type {AIConfig} from '@/utils/aiClient';
import {assertLocalCredentialTarget} from '../localAI';

export function PreviewAISetup({config,onApply}:{config?:AIConfig;onApply:(config:AIConfig|undefined)=>void}){
 const [open,setOpen]=useState(false),[baseUrl,setBaseUrl]=useState(config?.baseUrl??''),[model,setModel]=useState(config?.model??''),[apiKey,setApiKey]=useState(config?.apiKey??''),[protocol,setProtocol]=useState<'openai'|'anthropic'>(config?.protocol??'openai'),[error,setError]=useState('');
 return <section className="preview-ai-setup"><div className="preview-ai-heading"><div><h2>谁来接话</h2><p>{config?'AI 自主选择动作与墨魉':'演示对话 · 先试画面'}</p></div><button type="button" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'收起':'配置模型'}</button></div>{open&&<form className="inn-form" onSubmit={e=>{e.preventDefault();setError('');try{
  const url=new URL(baseUrl.trim());if(url.protocol!=='https:'||url.username||url.password||url.hash)throw new Error('请填写不带账号密码的 HTTPS 服务地址');
  if(!model.trim()||!apiKey.trim())throw new Error('请填写模型名称和 Key');
  const normalized=url.href.replace(/\/$/,'');assertLocalCredentialTarget(normalized,apiKey.trim());onApply({baseUrl:normalized,model:model.trim(),apiKey:apiKey.trim(),provider:'custom',protocol});setOpen(false);
 }catch(err){setError(err instanceof Error?err.message:'请检查连接配置')}}}>
 <p className="quiet-tip">启用后，对话会发给你填写的模型，由它选择动作。配置只留在本次页面内，刷新即清除；不读取正式版 Key，不改真实账本和提醒。网页连接还需服务允许跨域。</p>
 <label>协议<select aria-label="预览模型协议" value={protocol} onChange={e=>setProtocol(e.target.value as typeof protocol)}><option value="openai">OpenAI 兼容</option><option value="anthropic">Anthropic Messages</option></select></label>
 <label>服务地址<input aria-label="预览模型地址" type="url" required value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} placeholder="https://你的服务地址/v1"/></label>
 <label>模型名称<input aria-label="预览模型名称" required value={model} onChange={e=>setModel(e.target.value)}/></label>
 <label>API Key<input aria-label="预览模型 Key" type="password" autoComplete="off" required value={apiKey} onChange={e=>setApiKey(e.target.value)}/></label>
 {error&&<p role="alert">{error}</p>}<button className="primary-button" type="submit">启用 AI 自主动作</button>
 </form>}{config&&<button className="preview-demo-return" type="button" onClick={()=>onApply(undefined)}>切回演示对话</button>}</section>;
}
