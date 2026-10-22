import React,{useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import './preview.css';
import './tea-rooms.css';
import {TeaFace,TeaBuddy} from './TeaCharacters';
import {OriginalTea} from './OriginalTea';
import {CharacterIcon} from './CharacterIcon';
import {TeaChat} from './TeaChat';
import {useTeaConversation} from './useTeaConversation';
import {PreviewAISetup} from './PreviewAISetup';
import type {AIConfig} from '@/utils/aiClient';
import './character-icons.css';
import '../official-sticker-presentation.css';

type Page='今日'|'助手'|'设置'|'记账'|'提醒'|'天气'|'黄历';
function Icon({name}:{name:string}){return <CharacterIcon name={name}/>;}
function Preview(){
 const [page,setPage]=useState<Page>('今日'),[night,setNight]=useState(false),[clock,setClock]=useState(new Date());
 const [amount,setAmount]=useState(''),[note,setNote]=useState(''),[entries,setEntries]=useState([{title:'巷口早餐',amount:16},{title:'一杯桂花乌龙',amount:12}]);
 const [reminder,setReminder]=useState(''),[time,setTime]=useState('18:30'),[reminders,setReminders]=useState([{title:'出门散步',time:'18:30',done:false}]);
 const [previewAI,setPreviewAI]=useState<AIConfig>();
 const chat=useTeaConversation(previewAI);
 const [toast,setToast]=useState(''),[quiet,setQuiet]=useState(false);
 useEffect(()=>{const t=setInterval(()=>setClock(new Date()),1000);return()=>clearInterval(t)},[]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),2200);return()=>clearTimeout(t)},[toast]);

 const toolNames:Page[]=['记账','提醒','天气','黄历'];
 const activeTab=page==='助手'||page==='设置'?page:'今日';
 return <div className={'preview-root'+(night?' is-night':'')+(quiet?' is-quiet':'')}><aside className="preview-note"><span>设计预览 · 秋日茶馆</span><small>{previewAI?'AI 对话已启用 · 不改真实记录':'演示数据，不调用 AI、不写入现有记录'}</small></aside><div className="inn-phone">
 <header className="inn-header"><button className="inn-brand" onClick={()=>setPage('今日')} aria-label="缘缘庄，返回今日"><span className="brand-seal">缘</span><span>缘缘庄<small>YUAN YUAN INN</small></span></button><button className="day-toggle" onClick={()=>setNight(!night)} aria-label={night?'切换浅色':'切换深色'}><Icon name={night?'夜色':'日光'}/><span className="day-label">{night?'夜色':'日光'}</span></button></header>
 <main key={page} className={'inn-main page-'+page}>
 {page==='今日'?<><section className="today-heading"><div><p>{clock.toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})}</p><h1>又是好一天</h1></div><time>{clock.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false})}</time></section><OriginalTea quiet={quiet}/><section className="tool-menu" aria-label="生活工具">{toolNames.map((n,i)=><button key={n} className={'menu-item menu-'+i} onClick={()=>setPage(n)}><span className="menu-icon"><Icon name={n}/></span><span><strong>{n}</strong><small>{['把日子记成小账','到点轻轻叫你','看看风和云','翻翻今日宜忌'][i]}</small></span></button>)}</section><p className="home-footnote"><span/>茶温着，日子慢慢来。<span/></p></>:
 page==='助手'?<TeaChat conversation={chat} onNavigate={setPage}/>:
 page==='设置'?<><div className="page-heading"><p>收拾收拾小茶馆</p><h1>按你的习惯来</h1></div><div className="settings-portrait"><TeaFace/><span>有事叫我，没事也行。</span></div><section className="settings-list"><div><span>灯火<small>纸面的另一种颜色</small></span><button aria-label="切换纸面颜色" onClick={()=>setNight(!night)}>{night?'夜色':'日光'}</button></div><div><span>安静一点<small>收起装饰动效</small></span><button role="switch" aria-checked={quiet} onClick={()=>setQuiet(!quiet)}>{quiet?'已开启':'未开启'}</button></div></section><PreviewAISetup config={previewAI} onApply={setPreviewAI}/><p className="settings-end">小小一庄，装下日常。</p></>:
 <><button className="back-button" onClick={()=>setPage('今日')}>回到今日</button><div className="page-heading"><p>{page==='记账'?'一笔一笔，是生活':page==='提醒'?'小事也值得放在心上':page==='天气'?'抬头看看天':'日子自有好意'}</p><h1>{page==='记账'?'小账本':page==='提醒'?'待办小笺':page==='天气'?'风来信':'今日黄历'}<Icon name={page}/></h1></div>
 {page==='记账'?<><section className="ledger-total"><span>本月支出 · 演示</span><strong>¥ {entries.reduce((s,e)=>s+e.amount,0).toFixed(2)}</strong><TeaBuddy/></section><form className="inn-form" onSubmit={e=>{e.preventDefault();if(!Number.isFinite(Number(amount))||Number(amount)<=0)return;setEntries(es=>[{title:note.trim()||'随手记一笔',amount:Number(amount)},...es]);setAmount('');setNote('');setToast('记好了 · 仅本次预览')}}><h2>记一笔</h2><label>金额<input required aria-label="金额" inputMode="decimal" type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={e=>setAmount(e.target.value)}/></label><label>花在了哪里<input aria-label="花在了哪里" placeholder="比如，一碗热汤面" value={note} onChange={e=>setNote(e.target.value)}/></label><button className="primary-button">记进小账本 ＋</button></form><div className="records">{entries.map((e,i)=><div key={i}><span className="record-symbol"><Icon name="记账"/></span><span>{e.title}<small>今日 · 日常</small></span><strong>− {e.amount.toFixed(2)}</strong></div>)}</div></>:
 page==='提醒'?<><div className="reminder-intro"><TeaBuddy kind="fan"/><p>放心去忙。<br/>该记得的，写在这里。</p></div><form className="inn-form" onSubmit={e=>{e.preventDefault();if(!reminder.trim())return;setReminders(rs=>[...rs,{title:reminder.trim(),time,done:false}]);setReminder('');setToast('小笺贴好了 · 预览不会发送通知')}}><label>想记住什么<input required aria-label="提醒事项" placeholder="该喝水啦，也该休息啦" value={reminder} onChange={e=>setReminder(e.target.value)}/></label><label>几点叫你<input aria-label="提醒时间" type="time" value={time} onChange={e=>setTime(e.target.value)}/></label><button className="primary-button">贴一张小笺 ＋</button></form><div className="reminder-list">{reminders.map((r,i)=><button key={i} aria-pressed={r.done} onClick={()=>setReminders(rs=>rs.map((v,j)=>j===i?{...v,done:!v.done}:v))}><span className="check-circle">{r.done?'✓':''}</span><span className={r.done?'done':''}>{r.title}<small>{r.time} · 今日</small></span></button>)}</div></>:
 page==='天气'?<><div className="weather-paper"><span>武陵 · 天气样式示例</span><Icon name="天气"/><strong>23°</strong><p>晴间多云，风也温柔。</p><small>18° / 25°　东风 2 级</small></div><div className="weather-hours">{['现在','15时','16时','17时'].map((t,i)=><div key={t}><span>{t}</span><Icon name="天气"/><strong>{23-i}°</strong></div>)}</div><p className="quiet-tip">这是天气布局预览，数据非实时。</p></>:
 <><section className="almanac-paper"><span>黄历版式 · 演示</span><strong>{clock.getDate()}</strong><p>{clock.toLocaleDateString('zh-CN',{month:'long',weekday:'long'})}</p><div><span>宜<br/><b>留一点闲</b></span><span>忌<br/><b>太为难自己</b></span></div></section><p className="quiet-tip">此处为趣味占位文案，正式版保留真实黄历。</p></>}
 </>}
 </main><nav className="inn-nav" aria-label="主导航">{(['今日','助手','设置'] as Page[]).map(n=><button key={n} aria-current={activeTab===n?'page':undefined} className={activeTab===n?'selected':''} onClick={()=>setPage(n)}><Icon name={n}/><span>{n}</span></button>)}</nav>{toast&&<div role="status" className="tea-toast">{toast}</div>}</div><footer className="preview-caption">秋日茶馆 / 一套全新界面方向<a href="/">查看现有版本 ↗</a></footer></div>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><Preview/></React.StrictMode>);

