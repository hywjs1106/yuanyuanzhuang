import test from 'node:test';
import assert from 'node:assert/strict';
import { mapOpenMeteoForecast, mapQWeatherForecast, rainGuidance, weatherFreshness, readWeatherCache, writeWeatherCache, fetchWeatherBundle } from '../src/terminal/weather.ts';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WeatherPanel } from '../src/terminal/WeatherPanel.tsx';

const cfg = { provider: 'openmeteo' as const, city: { name: '北京', lat: 39.9, lon: 116.4 } };
const open = { daily: { time: ['2026-10-14','2026-10-15','2026-10-16'], temperature_2m_max: [23,21,20], temperature_2m_min: [12,11,10], weather_code: [3,61,0], precipitation_sum: [0,2.5,0], precipitation_probability_max: [10,70,0] } };
test('unconfigured page has accessible manual city selection and no invented weather', () => {
  const html = renderToStaticMarkup(React.createElement(WeatherPanel,{config:{},onConfigChange:async()=>{}}));
  for (const text of ['Open-Meteo','搜索城市','天气服务','请先选择城市','API']) assert.ok(html.includes(text),text);
  assert.ok(!html.includes('22°'));
});
test('maps three-day temperatures and rainfall with no fabricated defaults', () => {
  const days = mapOpenMeteoForecast(open);
  assert.equal(days.length, 3);
  assert.equal(days[1].precipitationMm, 2.5);
  assert.equal(days[1].rainProbability, 70);
  assert.match(days[1].text, /雨/);
  assert.throws(() => mapOpenMeteoForecast({daily:{...open.daily,temperature_2m_max:[null,21,20]}}), /数据/);
  assert.throws(() => mapOpenMeteoForecast({daily:{...open.daily,precipitation_probability_max:[null,70,0]}}), /数据/);
});
test('QWeather derives combined day/night probability and total precipitation', () => {
  const period = (value:number, probability:number) => ({condition:{text:'多云'},precipitation:{amount:{value,unit:'mm'},probability}});
  const days = mapQWeatherForecast({days:[{forecastStartTime:'2026-10-14T00:00+08:00',temperatureMax:{value:22,unit:'°C'},temperatureMin:{value:12,unit:'°C'},daytime:period(0,0.1),nighttime:period(2,0.8)}]});
  assert.equal(days[0].rainProbability, 80);
  assert.equal(days[0].precipitationMm, 2);
  assert.equal(days[0].date, '2026-10-14');
});
test('guidance uses forecast and marks old or missing data', () => {
  assert.match(rainGuidance(mapOpenMeteoForecast(open)), /10-15.*带伞/);
  assert.match(rainGuidance([]), /暂无/);
  assert.match(rainGuidance(mapOpenMeteoForecast(open), true), /缓存.*重新/);
  assert.equal(weatherFreshness('2026-10-14T00:00:00Z', new Date('2026-10-14T01:00:01Z')), 'stale');
  assert.equal(weatherFreshness('2026-10-14T00:00:00Z', new Date('2026-10-14T00:10:00Z')), 'fresh');
});
test('cache survives reload, matches city/provider and ignores malformed data', () => {
  const data = new Map<string,string>();
  const storage = {getItem:(k:string)=>data.get(k) ?? null,setItem:(k:string,v:string)=>{data.set(k,v);}};
  const bundle = {now:{temp:22,text:'多云',icon:'partly' as const,feelsLike:22,humidity:60,observedAt:new Date('2026-10-14T00:00:00Z'),provider:'openmeteo' as const,attribution:'https://open-meteo.com'},days:mapOpenMeteoForecast(open),fetchedAt:'2026-10-14T00:00:00Z',forecastAttribution:'https://open-meteo.com'};
  writeWeatherCache(cfg,bundle,storage);
  assert.ok(readWeatherCache(cfg,storage)?.now.observedAt instanceof Date);
  assert.equal(readWeatherCache({...cfg,city:{...cfg.city,lat:40}},storage), null);
  assert.ok(!Array.from(data.values()).join('').includes('apiKey'));
  storage.setItem(Array.from(data.keys())[0], '{broken');
  assert.equal(readWeatherCache(cfg,storage), null);
});
test('page retains stale cached values with explicit age warning and safe rain guidance', () => {
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis,'window');
  const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  const data = new Map<string,string>();
  const storage = {getItem:(k:string)=>data.get(k) ?? null,setItem:(k:string,v:string)=>{data.set(k,v);}};
  writeWeatherCache(cfg,{now:{temp:22,text:'多云',icon:'partly',feelsLike:22,humidity:60,observedAt:new Date('2020-01-01T00:00:00Z'),provider:'openmeteo',attribution:'https://open-meteo.com'},days:mapOpenMeteoForecast(open),fetchedAt:'2020-01-01T00:00:00Z',forecastAttribution:'https://open-meteo.com'},storage);
  Object.defineProperty(globalThis,'window',{value:{},configurable:true});
  Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});
  try {
    const html = renderToStaticMarkup(React.createElement(WeatherPanel,{config:cfg,onConfigChange:async()=>{}}));
    for (const text of ['22°','上次有效结果','数据已过时','缓存预报已过时','预报来源']) assert.ok(html.includes(text),text);
  } finally {
    if(windowDescriptor)Object.defineProperty(globalThis,'window',windowDescriptor);else Reflect.deleteProperty(globalThis,'window');
    if(storageDescriptor)Object.defineProperty(globalThis,'localStorage',storageDescriptor);else Reflect.deleteProperty(globalThis,'localStorage');
  }
});
test('current and forecast fetch use real service mapping and reject HTTP failure', async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    return new Response(JSON.stringify(url.includes('daily=') ? {...open,utc_offset_seconds:28800} : {current:{temperature_2m:22,apparent_temperature:21,relative_humidity_2m:60,weather_code:3,is_day:1,time:'2026-10-14T08:00'}}), {status:200});
  };
  try {
    const bundle = await fetchWeatherBundle(cfg);
    assert.equal(bundle.now.temp,22);
    assert.equal(bundle.now.observedAt.toISOString(),'2026-10-14T00:00:00.000Z');
    assert.equal(bundle.days.length,3);
    globalThis.fetch = async () => new Response('unavailable',{status:503});
    await assert.rejects(fetchWeatherBundle(cfg), /503|暂时/);
  } finally { globalThis.fetch = previous; }
});
