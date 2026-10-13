import type { LedgerEntry } from '@/types';
import type { WeatherConfig } from '@/utils/weather';
import type { AIConfig } from '@/utils/aiClient';
import { validateReminder, type Reminder } from './reminders';
export interface TerminalSettings { id: 'main'; budget: number; ai?: AIConfig; weather?: WeatherConfig; theme?: 'light' | 'dark'; weatherBriefing?:boolean; weatherBriefingTime?:string; }
export interface Note { id: string; text: string; createdAt: string; }
export interface Message { id: string; role: 'user' | 'assistant'; text: string; createdAt: string; }
export interface Snapshot { entries: LedgerEntry[]; reminders: Reminder[]; notes: Note[]; messages: Message[]; settings: TerminalSettings; }
export function localDateKey(d = new Date()): string { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function validDateKey(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y,m,d] = s.split('-').map(Number);
  const date = new Date(y,m-1,d,12);
  return y >= 1900 && y <= 2100 && date.getFullYear()===y && date.getMonth()===m-1 && date.getDate()===d;
}
export function parseMoney(s: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(s.trim())) throw new Error('金额请填写正数，最多两位小数');
  const amount = Number(s);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000) throw new Error('金额需大于零且不超过一亿元');
  return amount;
}
export function validateEntry(value: unknown): LedgerEntry {
  if (!value || typeof value !== 'object') throw new Error('流水格式不正确');
  const e = value as LedgerEntry;
  if (typeof e.id !== 'string' || !e.id || !['income','expense','adjust'].includes(e.direction)
    || typeof e.amount !== 'number' || !Number.isFinite(e.amount) || Math.abs(e.amount)>100000000
    || (e.direction !== 'adjust' && e.amount <= 0) || Math.abs(e.amount*100-Math.round(e.amount*100))>0.00001
    || !validDateKey(e.date) || e.currency !== 'CNY' || !['manual','ai'].includes(e.source)) throw new Error('流水的金额、日期或货币不正确');
  const createdAt = new Date(e.createdAt);
  if (!Number.isFinite(createdAt.getTime())) throw new Error('流水创建时间不正确');
  if (e.note !== undefined && (typeof e.note !== 'string' || e.note.length > 2000)) throw new Error('流水备注过长');
  return {...e, amount:Math.round(e.amount*100)/100, createdAt};
}
export function summarizeLedger(entries: LedgerEntry[], period: string) {
  let balance=0,income=0,expense=0;
  for (const e of entries) {
    const cents = Math.round(e.amount*100);
    balance += e.direction==='expense' ? -cents : cents;
    if (e.date.startsWith(period) && e.direction==='income') income+=cents;
    if (e.date.startsWith(period) && e.direction==='expense') expense+=cents;
  }
  return {balance:balance/100,income:income/100,expense:expense/100};
}
export function makeBackup(snapshot: Snapshot) {
  const settings = {...snapshot.settings, ai:snapshot.settings.ai ? {...snapshot.settings.ai,apiKey:''} : undefined,
    weather:snapshot.settings.weather ? {...snapshot.settings.weather,apiKey:''} : undefined};
  return { ...snapshot, settings, format: 'daily-terminal', version: 1, exportedAt:new Date().toISOString() };
}
const uniqueRows = <T extends {id:string}>(rows: T[]):T[] => {
  if(rows.some(r=>!r || typeof r.id!=='string' || !r.id) || new Set(rows.map(r=>r.id)).size !== rows.length) throw new Error('备份中有缺失或重复的记录编号');
  return rows;
};
export function validateBackup(value: unknown): Snapshot {
  if(!value || typeof value!=='object') throw new Error('备份格式不正确');
  const b = value as Snapshot & {format:string;version:number};
  if(b.format!=='daily-terminal' || b.version!==1 || ![b.entries,b.reminders,b.notes,b.messages].every(Array.isArray)) throw new Error('这不是日常终端的完整备份');
  if(b.entries.length+b.reminders.length+b.notes.length+b.messages.length>100000) throw new Error('备份记录过多');
  const entries = uniqueRows(b.entries.map(validateEntry));
  const reminders = uniqueRows(b.reminders.map(validateReminder));
  const ids = reminders.map(r=>r.notificationId);
  if(new Set(ids).size!==ids.length) throw new Error('备份提醒通知编号重复');
  const notes = uniqueRows(b.notes.map(n=>{
    if(typeof n.text!=='string'||n.text.length>10000||!Number.isFinite(Date.parse(n.createdAt))) throw new Error('备忘格式不正确');
    return {id:n.id,text:n.text,createdAt:n.createdAt};
  }));
  const messages = uniqueRows(b.messages.map(m=>{
    if(!['user','assistant'].includes(m.role)||typeof m.text!=='string'||m.text.length>30000||!Number.isFinite(Date.parse(m.createdAt))) throw new Error('聊天格式不正确');
    return {id:m.id,role:m.role,text:m.text,createdAt:m.createdAt};
  }));
  const s = b.settings;
  if(!s || s.id!=='main' || !Number.isFinite(s.budget) || s.budget<0 || s.budget>100000000) throw new Error('预算设置不正确');
  if(s.weatherBriefingTime && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(s.weatherBriefingTime))throw new Error('天气早报时间不正确');
  if(s.ai && (typeof s.ai.model!=='string' || typeof s.ai.baseUrl!=='string' || !/^https:\/\//.test(s.ai.baseUrl))) throw new Error('AI 地址或模型不正确');
  if(s.weather?.city && (!Number.isFinite(s.weather.city.lat)||Math.abs(s.weather.city.lat)>90 || !Number.isFinite(s.weather.city.lon)||Math.abs(s.weather.city.lon)>180 || typeof s.weather.city.name!=='string')) throw new Error('天气城市不正确');
  return {entries,reminders,notes,messages,settings:{...s,id:'main',ai:s.ai?{...s.ai,apiKey:''}:undefined,weather:s.weather?{...s.weather,apiKey:''}:undefined}};
}
