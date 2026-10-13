declare module 'lunar-javascript' {
  interface LunarDay {
    getMonthInChinese(): string; getDayInChinese(): string;
    getYearInGanZhi(): string; getMonthInGanZhi(): string; getDayInGanZhi(): string;
    getYearShengXiao(): string; getJieQi(): string; getFestivals(): string[];
    getDayYi(): string[]; getDayJi(): string[]; getDayChongDesc(): string; getDaySha(): string;
    getPengZuGan(): string; getPengZuZhi(): string;
    getDayPositionXiDesc(): string; getDayPositionFuDesc(): string; getDayPositionCaiDesc(): string;
    getDayJiShen(): string[]; getDayXiongSha(): string[];
  }
  interface SolarDay { getLunar(): LunarDay; getFestivals(): string[]; getWeekInChinese(): string; }
  export const Solar: { fromYmd(year: number, month: number, day: number): SolarDay };
}
