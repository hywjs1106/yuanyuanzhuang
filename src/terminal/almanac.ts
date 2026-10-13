import { Solar } from 'lunar-javascript';

export interface AlmanacDay {
  date: string; weekday: string; lunarDate: string; solarTerm: string;
  festivals: string[]; zodiac: string;
  ganzhi: { year: string; month: string; day: string };
  yi: string[]; ji: string[]; chong: string; sha: string;
  pengzu: string[]; auspiciousSpirits: string[]; inauspiciousSpirits: string[];
  positions: { joy: string; fortune: string; wealth: string };
  source: string;
}
export const ALMANAC_SOURCE = 'lunar-javascript · 农历与传统黄历参考（非科学预测）';
export function todayAlmanacDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function civilDate(key: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw new Error('日期须为 YYYY-MM-DD');
  const [y,m,d] = key.split('-').map(Number);
  const date = new Date(y,m-1,d,12);
  if (y < 1900 || y > 2100 || date.getFullYear() !== y || date.getMonth() !== m-1 || date.getDate() !== d) throw new Error('日期无效，请选择 1900—2100 年的真实日期');
  return date;
}
export function shiftAlmanacDate(key: string, delta: number): string {
  if (!Number.isInteger(delta)) throw new Error('日期偏移须为整数');
  const date = civilDate(key); date.setDate(date.getDate() + delta);
  const next = todayAlmanacDate(date); civilDate(next); return next;
}
export function getAlmanac(key: string): AlmanacDay {
  const date = civilDate(key);
  const solar = Solar.fromYmd(date.getFullYear(), date.getMonth()+1, date.getDate());
  const lunar = solar.getLunar();
  return {
    date: key, weekday: `星期${solar.getWeekInChinese()}`, lunarDate: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    solarTerm: lunar.getJieQi(), festivals: [...new Set([...lunar.getFestivals(),...solar.getFestivals()])],
    zodiac: lunar.getYearShengXiao(), ganzhi: {year:lunar.getYearInGanZhi(),month:lunar.getMonthInGanZhi(),day:lunar.getDayInGanZhi()},
    yi:lunar.getDayYi(), ji:lunar.getDayJi(), chong:lunar.getDayChongDesc(),sha:lunar.getDaySha(),
    pengzu:[lunar.getPengZuGan(),lunar.getPengZuZhi()], auspiciousSpirits:lunar.getDayJiShen(), inauspiciousSpirits:lunar.getDayXiongSha(),
    positions:{joy:lunar.getDayPositionXiDesc(),fortune:lunar.getDayPositionFuDesc(),wealth:lunar.getDayPositionCaiDesc()},source:ALMANAC_SOURCE,
  };
}
export function getAlmanacSummary(key = todayAlmanacDate()): string {
  const day = getAlmanac(key);
  return [day.lunarDate,day.solarTerm,...day.festivals].filter(Boolean).join(' · ');
}
