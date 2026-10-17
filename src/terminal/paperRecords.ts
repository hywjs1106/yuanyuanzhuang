import {localDateTime,nextReminderOccurrence,type Reminder} from './reminders';

/** Group stored wall dates directly: UTC conversion would move some records to another page. */
export function groupLedgerDays<T extends {date:string;createdAt:Date}>(entries:T[]) {
  const groups=new Map<string,T[]>();
  for(const entry of [...entries].sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.getTime()-a.createdAt.getTime())) {
    const day=groups.get(entry.date)??[];day.push(entry);groups.set(entry.date,day);
  }
  return [...groups].map(([date,entries])=>({date,entries}));
}
export const paperGroupOrder=['已到期','今日','明日','之后','已暂停','已完成'] as const;
export function reminderPaperGroup(reminder:Reminder,now=new Date()):typeof paperGroupOrder[number] {
  if(reminder.completedAt&&reminder.recurrence==='once')return '已完成';
  if(!reminder.enabled)return '已暂停';
  const next=nextReminderOccurrence(reminder,now);
  if(!next)return '已到期';
  const day=localDateTime(next).slice(0,10);
  if(day===localDateTime(now).slice(0,10))return '今日';
  const tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);
  return day===localDateTime(tomorrow).slice(0,10)?'明日':'之后';
}
