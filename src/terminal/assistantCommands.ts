import type { Proposal } from './assistant';
import { localDateKey, parseMoney, validDateKey } from './ledger';

/** Deliberately conservative: quoted, hypothetical and cancelled commands need review. */
export function unsafeCommand(text:string):boolean {
  return /(?:别|不能|不得|不可以|不许|不应)(?:把|将|给我|帮我|替我|再|去|执行|自动|直接|修改|更改|改|记|保存|删除|删|提醒|安排|添加|设|暂停|停用|启用)/.test(text)||/不要|不用|不必|无需|不准|禁止|别(?:帮|记|提醒|保存)|不记|不提醒|没让|取消|不需要|不想|假如|假设|如果|比如|例如|能不能|可不可以|是否|怎么|会怎样|大概|大约|差不多|好像|可能|估计|约莫|左右|[“”"'「」『』`]|他说|她说|原话/.test(text);
}
const ledgerIntent = /(?:帮我|给我|替我)?(?:记一下|记一笔|记下|记录|记账|保存)(?!得|忆)/;
export function hasLedgerIntent(text:string):boolean { return ledgerIntent.test(text)||/(?:帮我|给我|替我)记(?!忆|得|住)/.test(text); }
export function hasReminderIntent(text:string):boolean { return /提醒我|叫我|给我.*(?:提醒|闹钟)|帮我.*(?:提醒|闹钟)/.test(text); }
function dateFromText(text:string,now:Date):Date|undefined {
  if(/去年|前年|今年|明年|上周|上月|下周|下月|星期|周[一二三四五六日天]|礼拜|几天|前几|日前|上个|下个|今晚|昨晚|明晚|今早|昨早|明早|今晨|昨日|今日|明日|昨天晚上|\d+月\d+日/.test(text.replace(/每周[一二三四五六日天]/g,''))) return;
  const days=text.match(/今天|昨天|前天|明天|后天/g)??[];
  if(days.length>1) return;
  const relative=new Date(now); relative.setHours(0,0,0,0);
  const offsets:Record<string,number>={'今天':0,'昨天':-1,'前天':-2,'明天':1,'后天':2};
  relative.setDate(relative.getDate()+(offsets[days[0]??'']??0));
  const explicit=text.match(/\d{4}-\d{2}-\d{2}/g);
  if(explicit) {
    if(explicit.length!==1||!validDateKey(explicit[0])) return;
    if(days.length && localDateKey(relative)!==explicit[0]) return;
    const [y,m,d]=explicit[0].split('-').map(Number); return new Date(y,m-1,d);
  }
  return relative;
}
export function parseLocalLedger(text:string,now=new Date()):Extract<Proposal,{kind:'ledger'}>|undefined {
  if(unsafeCommand(text)||hasReminderIntent(text)||/美元|美金|港币|欧元|日元|英镑|USD|EUR|HKD|JPY/i.test(text)) return;
  const stripped=text.replace(/\d{4}-\d{2}-\d{2}/g,'');
  const numbers=stripped.match(/[+-]?\d+(?:\.\d+)?/g);
  if(!numbers||numbers.length!==1) return;
  const match=stripped.match(/(?:花了?|支出|付款|付了?|收入|收到|赚了?|消费|支付)\s*([+-]?\d+(?:\.\d+)?)(?![\d.])(?:\s*(元|块|人民币|CNY|RMB))?/i)
    ?? (hasLedgerIntent(text)?stripped.match(/([+-]?\d+(?:\.\d+)?)(?![\d.])\s*(元|块|人民币|CNY|RMB)/i):null);
  if(!match) return;
  if(!match[2]&&!/支出|付款|收入|收到|赚|消费|支付|工资|薪水/.test(text)) return;
  if(/\d+(?:\.\d+)?\s*(?:分钟|小时|页|天|次|个|公里)/.test(stripped)) return;
  const subject=stripped.replace(numbers[0],'').replace(/(?:帮我|给我|替我|请|记一下|记一笔|记下|记录|记账|保存|今天|昨天|前天|花了?|支出|付款|付了?|收入|收到|赚了?|消费|支付|元|块|人民币|CNY|RMB|[，,。\s])/gi,'');
  if(!subject.trim()) return;
  let amount:number; try { amount=parseMoney(match[1]); } catch { return; }
  const date=dateFromText(text,now); if(!date||date>now) return;
  return {kind:'ledger',direction:/收入|收到|赚|工资|薪水/.test(text)?'income':'expense',amount,date:localDateKey(date),note:text,type:/饭|餐|咖啡|菜/.test(text)?'food':'other'};
}
function chineseNumber(value:string):number {
  if(/^\d+$/.test(value)) return Number(value);
  const digits:Record<string,number>={'零':0,'〇':0,'一':1,'二':2,'两':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};
  if(value.includes('十')) { const [a,b]=value.split('十'); return (a?digits[a]:1)*10+(b?digits[b]:0); }
  return digits[value]??NaN;
}
const num='[零〇一二两三四五六七八九十\\d]+';
function timestamp(date:Date):string { return `${localDateKey(date)}T${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`; }
export function parseLocalReminder(text:string,now=new Date()):Extract<Proposal,{kind:'reminder'}>|undefined {
  text=text.replace(/明早|明晨/g,'明天早上').replace(/今早|今晨/g,'今天早上').replace(/今晚/g,'今天晚上').replace(/明晚/g,'明天晚上');
  if(unsafeCommand(text)||!hasReminderIntent(text)) return;
  const intent=text.match(/(?:提醒我|叫我)(.*)$/); if(!intent) return;
  if((text.match(/凌晨|早上|上午|中午|下午|傍晚|晚上|夜里/g)??[]).length>1 || (text.match(/今天|明天|后天|每天|每日|每周[一二三四五六日天]/g)??[]).length>1)return;
  let title=intent[1].replace(/^[，,：:\s]+|[。！!，,\s]+$/g,'');
  let at:Date; let repeat:'none'|'daily'|'weekly'='none';
  const delay=text.match(/(\d+)\s*(分钟|小时)后/);
  const colon=text.match(/(?<!\d)(\d{1,2}):(\d{2})(?!\d)/);
  const clock=text.match(new RegExp(`(凌晨|早上|上午|中午|下午|傍晚|晚上|夜里)?\\s*(${num})[点时](半|一刻|三刻|(?:${num})分?)?`));
  if((text.match(/提醒我|叫我/g)??[]).length!==1 || (text.match(/\d{1,2}:\d{2}/g)??[]).length>1 || (text.match(new RegExp(`${num}[点时]`,'g'))??[]).length>1) return;
  if(delay) {
    if(!Number(delay[1])||Number(delay[1])>8760||colon||clock||/今天|明天|后天|每天|每周/.test(text)) return;
    at=new Date(now.getTime()+Number(delay[1])*(delay[2]==='小时'?3600000:60000));
  } else {
    if(!colon&&!clock || (colon&&clock)) return;
    let hour=colon?Number(colon[1]):chineseNumber(clock![2]);
    const part=clock?.[1] ?? text.match(/凌晨|早上|上午|中午|下午|傍晚|晚上|夜里/)?.[0];
    const rawMinute=clock?.[3];
    const minute=colon?Number(colon[2]):rawMinute==='半'?30:rawMinute==='一刻'?15:rawMinute==='三刻'?45:rawMinute?chineseNumber(rawMinute.replace(/分$/,'')):0;
    if(!Number.isInteger(hour)||!Number.isInteger(minute)||hour>23||minute>59||hour<0||minute<0) return;
    if(!part&&!colon&&hour<13) return;
    if(part) {
      if(hour>12) return;
      if(/下午|傍晚|晚上|夜里/.test(part)&&hour<12) hour+=12;
      if(/凌晨|早上|上午/.test(part)&&hour===12) hour=0;
      if(part==='中午'&&hour<11) return;
    }
    const week=text.match(/每周([一二三四五六日天])/);
    if(/每天|每日/.test(text)) repeat='daily';
    else if(week) repeat='weekly';
    else if(!/今天|明天|后天|\d{4}-\d{2}-\d{2}/.test(text)) return;
    if(/每月|每年|每周/.test(text)&&!week) return;
    const date=dateFromText(text,now); if(!date) return;
    at=date; at.setHours(hour,minute,0,0);
    if(week) { const weekday='日一二三四五六'.indexOf(week[1]==='天'?'日':week[1]); at.setDate(at.getDate()+(weekday-at.getDay()+7)%7); }
    if(at<=now) { if(repeat==='none') return; at.setDate(at.getDate()+(repeat==='daily'?1:7)); }
  }
  // Time can precede or follow “提醒我”; remove only the recognized timing phrase.
  title=title.replace(delay?.[0]??'\u0000','').replace(colon?.[0]??clock?.[0]??'\u0000','')
    .replace(/今天|明天|后天|每天|每日|每周[一二三四五六日天]|\d{4}-\d{2}-\d{2}|凌晨|早上|上午|中午|下午|傍晚|晚上|夜里/g,'').replace(/^[在，,：:\s]+|[。！!，,\s]+$/g,'');
  if(!title||title.length>200||/[?？]/.test(title)) return;
  return {kind:'reminder',title,at:timestamp(at),repeat};
}
export function shouldAutoExecute(text:string,proposal:Proposal,now=new Date()):boolean {
  if(!proposal||unsafeCommand(text)) return false;
  if(proposal.kind==='ledger') {
    const expected=hasLedgerIntent(text)?parseLocalLedger(text,now):undefined;
    return !!expected && expected.amount===proposal.amount && expected.date===proposal.date && expected.direction===proposal.direction;
  }
  if(proposal.kind==='reminder') {
    const expected=parseLocalReminder(text,now);
    return !!expected && expected.at===proposal.at && expected.repeat===proposal.repeat && expected.title===proposal.title.trim();
  }
  return false;
}
