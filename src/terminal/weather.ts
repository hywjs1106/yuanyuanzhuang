import { fetchWeatherNow, normalizeQWeatherHost, weatherReady, type WeatherConfig, type WeatherNow } from '../utils/weather';
export type { WeatherConfig } from '../utils/weather';

export interface ForecastDay { date: string; min: number; max: number; text: string; precipitationMm: number; rainProbability: number | null; }
export interface WeatherBundle { now: WeatherNow; days: ForecastDay[]; fetchedAt: string; forecastAttribution: string; }
type JsonObject = Record<string, unknown>;
function object(value: unknown): JsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('天气数据格式无效');
  return value as JsonObject;
}
function number(value: unknown): number {
  if ((typeof value !== 'number' && typeof value !== 'string') || value === '' || !Number.isFinite(Number(value))) throw new Error('天气数据缺少有效数值');
  return Number(value);
}
function dateKey(value: unknown): string {
  const key = String(value ?? '').slice(0,10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !Number.isFinite(Date.parse(key)) || new Date(`${key}T12:00:00Z`).toISOString().slice(0,10) !== key) throw new Error('天气数据日期无效');
  return key;
}
function checkedDay(day: ForecastDay): ForecastDay {
  if (day.min > day.max || day.precipitationMm < 0 || (day.rainProbability !== null && (day.rainProbability < 0 || day.rainProbability > 100))) throw new Error('天气数据超出有效范围');
  return day;
}
const WMO: Record<number,string> = {0:'晴',1:'晴间多云',2:'多云',3:'阴',45:'雾',48:'雾凇',51:'毛毛雨',53:'小雨',55:'中雨',56:'冻毛毛雨',57:'冻毛毛雨',61:'小雨',63:'中雨',65:'大雨',66:'冻雨',67:'冻雨',71:'小雪',73:'中雪',75:'大雪',77:'雪粒',80:'阵雨',81:'强阵雨',82:'暴雨',85:'阵雪',86:'强阵雪',95:'雷阵雨',96:'雷阵雨伴冰雹',99:'强雷阵雨伴冰雹'};
export function mapOpenMeteoForecast(raw: unknown): ForecastDay[] {
  const daily = object(object(raw).daily);
  const times = daily.time;
  if (!Array.isArray(times) || !times.length) throw new Error('暂无预报数据');
  const fields = ['temperature_2m_min','temperature_2m_max','weather_code','precipitation_sum','precipitation_probability_max'];
  for (const field of fields) if (!Array.isArray(daily[field]) || (daily[field] as unknown[]).length < Math.min(times.length,3)) throw new Error('预报数据不完整');
  const at = (field:string,i:number) => number((daily[field] as unknown[])[i]);
  return times.slice(0,3).map((time,i) => checkedDay({date:dateKey(time),min:at(fields[0],i),max:at(fields[1],i),text:WMO[at(fields[2],i)] ?? '天气代码未知',precipitationMm:at(fields[3],i),rainProbability:at(fields[4],i)}));
}
export function mapQWeatherForecast(raw: unknown): ForecastDay[] {
  const days = object(raw).days;
  if (!Array.isArray(days) || !days.length) throw new Error('暂无预报数据');
  return days.slice(0,3).map(value => {
    const day = object(value), daytime = object(day.daytime), nighttime = object(day.nighttime);
    const dp = object(daytime.precipitation), np = object(nighttime.precipitation);
    const max = object(day.temperatureMax), min = object(day.temperatureMin);
    const da = object(dp.amount), na = object(np.amount);
    if (max.unit !== '°C' || min.unit !== '°C' || da.unit !== 'mm' || na.unit !== 'mm') throw new Error('预报数据单位不受支持');
    const text = String(object(daytime.condition).text ?? '');
    if (!text) throw new Error('预报数据缺少天气描述');
    return checkedDay({date:dateKey(day.forecastStartTime),min:number(min.value),max:number(max.value),text,precipitationMm:number(da.value)+number(na.value),rainProbability:Math.round(Math.max(number(dp.probability),number(np.probability))*100)});
  });
}
export function rainGuidance(days: ForecastDay[], stale = false): string {
  if (stale) return '缓存预报已过时，请重新获取后判断是否带伞。';
  if (!days.length) return '暂无有效预报，无法判断降水。';
  const wet = days.find(day => day.precipitationMm >= 0.1 || (day.rainProbability ?? 0) >= 40);
  return wet ? `${wet.date.slice(5)} 预报有降水${wet.rainProbability !== null ? `（概率 ${wet.rainProbability}%）` : ''}，建议带伞。` : '未来三天预报降水较少；出门前请留意当地天气变化。';
}
export function weatherFreshness(fetchedAt: string, now = new Date()): 'fresh' | 'stale' {
  const age = now.getTime() - Date.parse(fetchedAt);
  return Number.isFinite(age) && age >= -60_000 && age <= 60*60*1000 ? 'fresh' : 'stale';
}
export async function fetchWeatherBundle(config: WeatherConfig, signal?: AbortSignal): Promise<WeatherBundle> {
  const cfg = {...config,provider:config.provider ?? 'openmeteo'};
  if (!weatherReady(cfg)) throw new Error('请先选择城市，并填写天气服务所需配置');
  const city = cfg.city!;
  if (!Number.isFinite(city.lat) || !Number.isFinite(city.lon) || Math.abs(city.lat)>90 || Math.abs(city.lon)>180) throw new Error('城市坐标无效，请重新选择');
  const controller = new AbortController();
  const cancel = () => controller.abort(signal?.reason);
  signal?.addEventListener('abort',cancel,{once:true});
  if (signal?.aborted) cancel();
  let timedOut = false;
  const timeout = setTimeout(() => {timedOut=true;controller.abort();},15000);
  try {
    const open = cfg.provider === 'openmeteo';
    const url = open
      ? `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=3`
      : `https://${normalizeQWeatherHost(cfg.host)}/weather/v1/daily/${city.lat}/${city.lon}?days=3&localTime=true&lang=zh&key=${encodeURIComponent(cfg.apiKey!.trim())}`;
    // Reuse upstream current conditions; this boundary adds forecast and persistent cache.
    const [now, response] = await Promise.all([fetchWeatherNow(cfg,{force:true,signal:controller.signal}),fetch(url,{signal:controller.signal})]);
    if (!response.ok) throw new Error(`天气预报获取失败（HTTP ${response.status}），检查服务配置或稍后重试`);
    const json: unknown = await response.json();
    const raw = object(json);
    const days = open ? mapOpenMeteoForecast(raw) : mapQWeatherForecast(raw);
    if (!Number.isFinite(now.temp) || !Number.isFinite(now.feelsLike) || !Number.isFinite(now.observedAt.getTime())) throw new Error('实时天气数据无效');
    if (open) {
      // Upstream parses the city's naive local timestamp in device timezone. Apply the API's explicit offset instead.
      const d = now.observedAt;
      now.observedAt = new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),d.getHours(),d.getMinutes(),d.getSeconds()) - number(raw.utc_offset_seconds)*1000);
    }
    const attribution = open ? 'https://open-meteo.com' : safeAttribution(object(raw.metadata ?? {}).attributions) ?? 'https://www.qweather.com';
    return {now,days,fetchedAt:new Date().toISOString(),forecastAttribution:attribution};
  } catch(error) {
    if (timedOut) throw new Error('天气请求超时，请检查网络后重试');
    throw error;
  } finally {
    clearTimeout(timeout); signal?.removeEventListener('abort',cancel); controller.abort();
  }
}
function safeAttribution(value: unknown): string | undefined {
  return Array.isArray(value) ? value.find((item): item is string => typeof item === 'string' && /^https:\/\//.test(item)) : undefined;
}
type CacheStorage = Pick<Storage,'getItem'|'setItem'>;
const CACHE_KEY = 'dailyterminal.weather.lastgood.v1';
function identity(cfg: WeatherConfig): string { return JSON.stringify([cfg.provider ?? 'openmeteo',cfg.city?.lat,cfg.city?.lon,normalizeQWeatherHost(cfg.host)]); }
export function writeWeatherCache(cfg: WeatherConfig,bundle: WeatherBundle, storage: CacheStorage = localStorage): void {
  try { storage.setItem(CACHE_KEY,JSON.stringify({identity:identity(cfg),bundle})); } catch { /* Weather remains usable if storage quota is exhausted. */ }
}
export function readWeatherCache(cfg: WeatherConfig,storage: CacheStorage = localStorage): WeatherBundle | null {
  try {
    const parsed = object(JSON.parse(storage.getItem(CACHE_KEY) ?? 'null'));
    if (parsed.identity !== identity(cfg)) return null;
    const raw = object(parsed.bundle), now = object(raw.now);
    const fetchedAt = String(raw.fetchedAt);
    if (!Number.isFinite(Date.parse(fetchedAt)) || !Array.isArray(raw.days) || !raw.days.length || raw.days.length>3) return null;
    const days = raw.days.map(d => {
      const day=object(d);
      return checkedDay({date:dateKey(day.date),min:number(day.min),max:number(day.max),text:String(day.text),precipitationMm:number(day.precipitationMm),rainProbability:day.rainProbability===null ? null : number(day.rainProbability)});
    });
    const observedAt = new Date(String(now.observedAt));
    if (!Number.isFinite(observedAt.getTime()) || now.provider !== (cfg.provider ?? 'openmeteo') || typeof now.text !== 'string' || typeof now.attribution !== 'string' || !/^https:\/\//.test(now.attribution) || typeof raw.forecastAttribution !== 'string' || !/^https:\/\//.test(raw.forecastAttribution)) return null;
    return {now:{...now,temp:number(now.temp),feelsLike:number(now.feelsLike),humidity:now.humidity===null ? null : number(now.humidity),observedAt} as WeatherNow,days,fetchedAt,forecastAttribution:raw.forecastAttribution};
  } catch { return null; }
}
