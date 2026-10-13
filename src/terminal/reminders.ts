export type ReminderRecurrence = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export interface Reminder {
  id: string;
  notificationId: number;
  title: string;
  body: string;
  startAt: string;
  recurrence: ReminderRecurrence;
  enabled: boolean;
  completedAt?: string;
  skipUntil?: string;
  snoozedUntil?: string;
  createdAt: string;
  updatedAt: string;
}
export type ReminderInput = Pick<Reminder, 'title' | 'startAt' | 'recurrence'> & Partial<Pick<Reminder, 'body' | 'enabled'>>;

/** Calendar wall time in the device's local timezone, never interpreted as UTC. */
export function parseReminderDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error('请选择有效的日期和时间');
  const [year, month, day, hour, minute] = value.split(/[-T:]/).map(Number);
  if (year < 1900 || year > 9999) throw new Error('年份须为 1900–9999');
  const date = new Date(year, month - 1, day, hour, minute);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date.getHours() !== hour || date.getMinutes() !== minute) throw new Error('日期或时间不存在');
  return date;
}
export function localDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
export function validateReminder(value: unknown): Reminder {
  if (!value || typeof value !== 'object') throw new Error('提醒格式无效');
  const r = value as Reminder;
  if (typeof r.id !== 'string' || !r.id || typeof r.title !== 'string' || !r.title.trim() || r.title.length > 200 || typeof r.body !== 'string' || r.body.length > 4000) throw new Error('提醒标题或内容无效');
  if (!Number.isInteger(r.notificationId) || r.notificationId < 2 || r.notificationId > 2147483646 || r.notificationId % 2 !== 0) throw new Error('通知编号无效');
  if (!['once','daily','weekly','monthly','yearly'].includes(r.recurrence) || typeof r.enabled !== 'boolean') throw new Error('重复规则无效');
  parseReminderDate(r.startAt);
  for (const date of [r.createdAt, r.updatedAt]) if (typeof date !== 'string' || !Number.isFinite(Date.parse(date))) throw new Error('提醒记录时间无效');
  for (const date of [r.completedAt, r.skipUntil, r.snoozedUntil]) if (date !== undefined && (typeof date !== 'string' || !Number.isFinite(Date.parse(date)))) throw new Error('提醒状态时间无效');
  return {...r, title:r.title.trim()};
}
export function createReminder(input: ReminderInput, existing: Reminder[] = [], now = new Date()): Reminder {
  const occupied = new Set(existing.map(r => r.notificationId));
  let notificationId = 2;
  while (occupied.has(notificationId)) notificationId += 2;
  return validateReminder({...input, id:crypto.randomUUID(), notificationId, body:input.body ?? '', enabled:input.enabled ?? true, createdAt:now.toISOString(), updatedAt:now.toISOString()});
}

/** Month31 and leap birthdays skip months/years where the selected day does not exist. */
export function nextReminderOccurrence(reminder: Reminder, after = new Date()): Date | null {
  if (!reminder.enabled || (reminder.recurrence === 'once' && reminder.completedAt)) return null;
  const start = parseReminderDate(reminder.startAt);
  const floor = Math.max(after.getTime(), reminder.skipUntil ? Date.parse(reminder.skipUntil) : -Infinity);
  if (reminder.recurrence === 'once' && reminder.snoozedUntil) {
    const snoozed = new Date(reminder.snoozedUntil);
    return snoozed.getTime() > floor ? snoozed : null;
  }
  if (start.getTime() > floor) return start;
  if (reminder.recurrence === 'once') return null;
  const candidate = new Date(start);
  if (reminder.recurrence === 'daily' || reminder.recurrence === 'weekly') {
    const step = reminder.recurrence === 'daily' ? 1 : 7;
    const approximateDays = Math.floor((floor - start.getTime()) / 86400000);
    candidate.setDate(start.getDate() + Math.max(0, Math.floor(approximateDays / step) - 1) * step);
    while (candidate.getTime() <= floor) candidate.setDate(candidate.getDate() + step);
    return candidate;
  }
  const basis = new Date(floor);
  let year = Math.max(start.getFullYear(), basis.getFullYear());
  let month = reminder.recurrence === 'monthly' ? (year === basis.getFullYear() ? basis.getMonth() : start.getMonth()) : start.getMonth();
  while (year <= 9999) {
    const date = new Date(year, month, start.getDate(), start.getHours(), start.getMinutes());
    if (date.getMonth() === month && date.getTime() >= start.getTime() && date.getTime() > floor) return date;
    if (reminder.recurrence === 'yearly') year++;
    else if (++month === 12) {month=0; year++;}
  }
  return null;
}
export function completeReminder(reminder: Reminder, now = new Date()): Reminder {
  if (reminder.recurrence === 'once') return {...reminder, enabled:false, completedAt:now.toISOString(), snoozedUntil:undefined, updatedAt:now.toISOString()};
  const start = parseReminderDate(reminder.startAt);
  // On its due day, complete that occurrence; on other days, complete the next upcoming one.
  const midnight = new Date(now); midnight.setHours(0,0,0,0);
  const today = nextReminderOccurrence(reminder, new Date(midnight.getTime() - 1));
  const target = today && localDateTime(today).slice(0,10) === localDateTime(now).slice(0,10) ? today : nextReminderOccurrence(reminder, now) ?? now;
  const skipUntil = new Date(Math.max(now.getTime(), start.getTime() > now.getTime() ? start.getTime() : target.getTime())).toISOString();
  return {...reminder, skipUntil, completedAt:now.toISOString(), snoozedUntil:undefined, updatedAt:now.toISOString()};
}
export function snoozeReminder(reminder: Reminder, minutes = 10, now = new Date()): Reminder {
  if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 1440) throw new Error('稍后提醒须为 1 分钟至 24 小时');
  const base = reminder.recurrence === 'once' ? reminder : completeReminder({...reminder, enabled:true}, now);
  return {...base, enabled:true, completedAt:reminder.recurrence === 'once' ? undefined : reminder.completedAt, snoozedUntil:new Date(now.getTime() + minutes * 60000).toISOString(), updatedAt:now.toISOString()};
}

/** Native actions refer to an already delivered occurrence, possibly acted on days later. */
export function completeDeliveredReminder(reminder: Reminder, now = new Date()): Reminder {
  if (reminder.recurrence === 'once') return completeReminder(reminder, now);
  const skipUntil = new Date(Math.max(now.getTime(), reminder.skipUntil ? Date.parse(reminder.skipUntil) : -Infinity)).toISOString();
  return {...reminder, skipUntil, completedAt:now.toISOString(), snoozedUntil:undefined, updatedAt:now.toISOString()};
}
export function snoozeDeliveredReminder(reminder: Reminder, minutes = 10, now = new Date()): Reminder {
  if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 1440) throw new Error('稍后提醒须为 1 分钟至 24 小时');
  const base=completeDeliveredReminder(reminder,now);
  return {...base, enabled:true, completedAt:reminder.recurrence === 'once' ? undefined : reminder.completedAt, snoozedUntil:new Date(now.getTime()+minutes*60000).toISOString(), updatedAt:now.toISOString()};
}
