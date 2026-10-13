import { useState } from 'react';
import { getAlmanac, shiftAlmanacDate, todayAlmanacDate } from './almanac';

export function AlmanacPanel() {
  const [date,setDate] = useState(todayAlmanacDate);
  const [error,setError] = useState('');
  const day = getAlmanac(date);
  function choose(value:string) {
    try { getAlmanac(value); setDate(value); setError(''); }
    catch(e) { setError(e instanceof Error ? e.message : '日期无效'); }
  }
  function move(delta:number) {
    try { choose(shiftAlmanacDate(date,delta)); }
    catch(e) {setError(e instanceof Error ? e.message : '日期无效');}
  }
  return <section className="terminal-panel almanac-panel" aria-labelledby="almanac-heading">
    <header className="panel-heading"><div><p className="eyebrow">离线日历</p><h2 id="almanac-heading">黄历</h2></div><button type="button" onClick={()=>choose(todayAlmanacDate())}>回到今天</button></header>
    <div className="date-navigation">
      <button type="button" aria-label="上一天" onClick={()=>move(-1)}>上一天</button>
      <label>查看日期<input type="date" min="1900-01-01" max="2100-12-31" value={date} onChange={e=>choose(e.target.value)}/></label>
      <button type="button" aria-label="下一天" onClick={()=>move(1)}>下一天</button>
    </div>
    {error && <p role="alert">{error}</p>}
    <article className="terminal-card">
      <p>{day.date} · {day.weekday}</p><h3 className="lunar-date">{day.lunarDate}</h3>
      <p>{day.ganzhi.year}年 · 生肖{day.zodiac}</p>
      {(day.solarTerm || day.festivals.length>0) && <p className="accent-text">{[day.solarTerm,...day.festivals].filter(Boolean).join(' · ')}</p>}
      <div className="almanac-activities"><div><h4>宜</h4><p>{day.yi.join(' · ') || '无记载'}</p></div><div><h4>忌</h4><p>{day.ji.join(' · ') || '无记载'}</p></div></div>
      <dl className="detail-list">
        <dt>干支</dt><dd>{day.ganzhi.year}年 {day.ganzhi.month}月 {day.ganzhi.day}日</dd>
        <dt>冲煞</dt><dd>冲{day.chong} · 煞{day.sha}</dd>
        <dt>彭祖百忌</dt><dd>{day.pengzu.join('；')}</dd>
        <dt>吉神宜趋</dt><dd>{day.auspiciousSpirits.join(' · ') || '无记载'}</dd>
        <dt>凶煞宜忌</dt><dd>{day.inauspiciousSpirits.join(' · ') || '无记载'}</dd>
        <dt>传统方位</dt><dd>喜神 {day.positions.joy} · 福神 {day.positions.fortune} · 财神 {day.positions.wealth}</dd>
      </dl>
    </article>
    <p className="muted">{day.source}。节日名称不代表法定放假安排；干支以农历年、月、日口径显示。</p>
    <a href="https://github.com/6tail/lunar-javascript" target="_blank" rel="noreferrer">算法与数据来源</a>
  </section>;
}
export default AlmanacPanel;
