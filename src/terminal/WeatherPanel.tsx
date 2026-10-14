import { useEffect, useRef, useState, type FormEvent } from 'react';
import { searchCity, weatherReady, weatherEmoji, attributionLabel, type WeatherCity } from '../utils/weather';
import { fetchWeatherBundle, rainGuidance, readWeatherCache, weatherFreshness, writeWeatherCache, type WeatherBundle, type WeatherConfig } from './weather';
export interface WeatherPanelProps { config: WeatherConfig; onConfigChange: (cfg:WeatherConfig)=>Promise<void>; onBundleChange?:(bundle:WeatherBundle)=>void; compact?:boolean; onOpen?:()=>void; }
const message = (e:unknown) => e instanceof Error ? e.message : '天气服务暂时不可用';

export function WeatherPanel({config,onConfigChange,onBundleChange,compact=false,onOpen}:WeatherPanelProps) {
  const [draft,setDraft] = useState<WeatherConfig>({...config,provider:config.provider ?? 'openmeteo'});
  const [query,setQuery] = useState('');
  const [cities,setCities] = useState<WeatherCity[]>([]);
  const [bundle,setBundle] = useState<WeatherBundle|null>(()=>typeof window==='undefined' ? null : readWeatherCache(config));
  const [cached,setCached] = useState(true), [loading,setLoading] = useState(false), [searching,setSearching] = useState(false), [saving,setSaving] = useState(false);
  const [error,setError] = useState(''), [searchError,setSearchError] = useState(''), [refresh,setRefresh] = useState(0), [clock,setClock] = useState(new Date());
  const searchRequest = useRef<AbortController|null>(null);
  const provider = config.provider ?? 'openmeteo';
  useEffect(()=>{setDraft({...config,provider:config.provider ?? 'openmeteo'});setCities([]);},[config]);
  useEffect(()=>{
    const tick = setInterval(()=>setClock(new Date()),60_000);
    return ()=>{clearInterval(tick);searchRequest.current?.abort();};
  },[]);
  useEffect(()=>{
    const controller = new AbortController();
    const cfg = {...config,provider};
    setBundle(readWeatherCache(cfg)); setCached(true); setError('');
    if (!weatherReady(cfg)) {setLoading(false);return ()=>controller.abort();}
    setLoading(true);
    fetchWeatherBundle(cfg,controller.signal).then(data=>{
      if (controller.signal.aborted) return;
      setBundle(data);setCached(false);setClock(new Date());writeWeatherCache(cfg,data);onBundleChange?.(data);
    }).catch(e=>{if (!controller.signal.aborted) setError(message(e));}).finally(()=>{if (!controller.signal.aborted) setLoading(false);});
    return ()=>controller.abort();
  // Re-fetch only when the persisted service/location or explicit refresh changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[provider,config.apiKey,config.host,config.city?.lat,config.city?.lon,config.city?.id,refresh]);

  async function save(cfg:WeatherConfig) {
    setSaving(true);setSearchError('');
    try {await onConfigChange(cfg);setCities([]);setQuery('');setRefresh(v=>v+1);}
    catch(e){setSearchError(message(e));} finally {setSaving(false);}
  }
  async function search(event:FormEvent) {
    event.preventDefault();searchRequest.current?.abort();
    const controller = new AbortController();searchRequest.current=controller;
    const timeout = setTimeout(()=>controller.abort(),12000);
    setSearching(true);setCities([]);setSearchError('');
    try {
      const results=await searchCity(query,draft,controller.signal);
      if (searchRequest.current !== controller || controller.signal.aborted) return;
      setCities(results);if (!results.length) setSearchError('没有找到城市，可尝试城市英文名或拼音');
    } catch(e) {
      if (searchRequest.current === controller) setSearchError(controller.signal.aborted ? '城市搜索超时，请重试' : message(e));
    } finally {clearTimeout(timeout);if(searchRequest.current === controller)setSearching(false);}
  }
  const stale = bundle ? weatherFreshness(bundle.fetchedAt,clock)==='stale' || weatherFreshness(bundle.now.observedAt.toISOString(),clock)==='stale' : true;
  const viewDays = bundle?.days.filter(day=>day.date >= new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit'}).format(clock)) ?? [];
  if(compact)return <section className="overview-weather" aria-label="天气摘要"><div className="overview-weather-main"><div><h2>天气{config.city?` · ${config.city.name}`:''}</h2><p>{bundle?`${bundle.now.text} · 体感 ${bundle.now.feelsLike}°`:loading?'正在获取天气…':config.city?'暂无有效数据':'选择城市，看看今日天气'}</p></div>{bundle&&<strong>{bundle.now.temp}°</strong>}</div>{bundle&&<p className="muted">{stale?'上次数据已过时 · ':cached?'上次有效结果 · ':''}{rainGuidance(viewDays,stale)}</p>}{error&&<p role="alert">{error}{bundle?'，保留上次结果':''}</p>}<button type="button" onClick={onOpen}>查看天气</button></section>;
  return <section className="terminal-panel weather-panel" aria-labelledby="weather-heading">
    <header className="panel-heading"><div><p className="eyebrow">所选城市 · 无需定位权限</p><h2 id="weather-heading">天气{config.city ? ` · ${config.city.name}` : ''}</h2></div><button type="button" disabled={loading || !weatherReady({...config,provider})} onClick={()=>setRefresh(v=>v+1)}>{loading?'更新中…':'刷新天气'}</button></header>
    {error && <p className="error-message" role="alert">{error}{bundle ? '。保留上次有效结果。' : ''}</p>}
    {!bundle && <p role="status">{loading?'正在获取实时天气与三日预报…':!config.city?'请先选择城市':'暂无有效天气数据，请检查配置或刷新'}</p>}
    {bundle && <article className="terminal-card" aria-live="polite">
      <p className="muted">{cached?'上次有效结果 · ':''}{stale?'数据已过时，请刷新':'最近一小时内更新'} · 获取时间 {new Date(bundle.fetchedAt).toLocaleString('zh-CN')}</p>
      <div className="weather-current"><strong className="temperature">{bundle.now.temp}°</strong><div><h3>{weatherEmoji(bundle.now.icon)} {bundle.now.text}</h3><p>体感 {bundle.now.feelsLike}° · 湿度 {bundle.now.humidity===null?'暂无':`${bundle.now.humidity}%`}</p></div></div>
      <p className="muted">实时数据时间 {bundle.now.observedAt.toLocaleString('zh-CN')}（设备时区）</p>
      <p className="weather-guidance">{rainGuidance(viewDays,stale)}</p>
      <h3>三日预报（含今天）</h3>
      <ul className="forecast-list">{bundle.days.map(day=><li key={day.date}><strong>{day.date.slice(5)}</strong><span>{day.text}</span><span>{Math.round(day.min)}—{Math.round(day.max)}°</span><small>降水 {day.precipitationMm.toFixed(1)} mm{day.rainProbability===null?'':` · ${day.rainProbability}%`}</small></li>)}</ul>
      <p className="muted">预报为每日降水总量与最大概率，包含雨雪；带伞建议据此生成。</p>
      <p><a href={bundle.now.attribution} target="_blank" rel="noreferrer">{attributionLabel(provider)} 实时数据</a> · <a href={bundle.forecastAttribution} target="_blank" rel="noreferrer">{provider==='qweather'?'天气服务由和风天气驱动':'Open-Meteo（CC BY 4.0）'} · 预报来源</a></p>
    </article>}
    <article className="terminal-card weather-settings">
      <h3>城市与天气服务</h3>
      <label>天气服务<select value={draft.provider} onChange={e=>{searchRequest.current?.abort();setCities([]);setDraft({...draft,provider:e.target.value as 'openmeteo'|'qweather'});}}><option value="openmeteo">Open-Meteo · 免费，无需密钥</option><option value="qweather">和风天气 · 自有 API Host / KEY</option></select></label>
      {draft.provider==='qweather' && <><label>API Host<input autoComplete="off" placeholder="abc123.re.qweatherapi.com" value={draft.host ?? ''} onChange={e=>setDraft({...draft,host:e.target.value})}/></label><label>API KEY<input type="password" autoComplete="off" value={draft.apiKey ?? ''} onChange={e=>setDraft({...draft,apiKey:e.target.value})}/></label><p className="muted">从和风控制台复制自己的 API Host 和 API KEY，保存在本机。</p></>}
      <form onSubmit={search}><label>搜索城市<input type="search" placeholder="城市名，例如 北京 / Beijing" value={query} onChange={e=>setQuery(e.target.value)} required /></label><button type="submit" disabled={searching || !query.trim()}>{searching?'搜索中…':'搜索城市'}</button></form>
      {searchError && <p role="alert">{searchError}</p>}
      {cities.length>0 && <ul className="city-results" aria-label="城市搜索结果">{cities.map((city,i)=><li key={`${city.lat}-${city.lon}-${i}`}><button type="button" disabled={saving} onClick={()=>void save({...draft,city})}>选择 {city.name} <small>{city.lat.toFixed(2)}, {city.lon.toFixed(2)}</small></button></li>)}</ul>}
      <p>当前选择：{draft.city?.name ?? '尚未选择'}</p><button type="button" disabled={saving || !weatherReady(draft)} onClick={()=>void save(draft)}>{saving?'保存中…':'保存天气设置'}</button>
      <p className="muted">城市搜索与天气查询会把所选城市坐标发送给天气服务。Open-Meteo 连接受网络影响，失败时可使用上次缓存；和风需要自己的凭据。</p>
    </article>
  </section>;
}
export default WeatherPanel;
