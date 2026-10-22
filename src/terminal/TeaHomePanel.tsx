import {OriginalTea} from './inn-preview/OriginalTea';
import {CharacterIcon} from './inn-preview/CharacterIcon';
import {LiveClock} from './LiveClock';
import type {TerminalPage} from './BottomNavigation';

export function TeaHomePanel({date,onNavigate}:{date:string;onNavigate:(page:TerminalPage)=>void}){
 return <section className="tea-home" aria-label="秋日茶馆首页"><header><div><p>{date.slice(5,7)}月{date.slice(8)}日</p><h2>又是好一天</h2></div><LiveClock/></header><OriginalTea quiet={false}/><div className="tea-home-tools">{([{page:'ledger',label:'记账',detail:'把日子记成小账'},{page:'reminders',label:'提醒',detail:'到点轻轻叫你'},{page:'weather',label:'天气',detail:'看看风和云'},{page:'almanac',label:'黄历',detail:'翻翻今日宜忌'}] as const).map(item=><button type="button" key={item.page} aria-label={`打开${item.label}`} onClick={()=>onNavigate(item.page)}><CharacterIcon name={item.label}/><span><strong>{item.label}</strong><small>{item.detail}</small></span></button>)}</div><p className="tea-home-footnote">茶温着，日子慢慢来。</p></section>;
}
