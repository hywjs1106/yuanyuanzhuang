import {test} from 'node:test';import assert from 'node:assert/strict';
import {planWeatherBriefing} from '../src/terminal/weatherBriefing';
import type {WeatherBundle} from '../src/terminal/weather';
const bundle:WeatherBundle={fetchedAt:'2026-10-14T10:00:00+08:00',forecastAttribution:'https://open-meteo.com',now:{temp:20,feelsLike:20,humidity:50,text:'晴',icon:'clear-day',provider:'openmeteo',attribution:'https://open-meteo.com',observedAt:new Date('2026-10-14T10:00:00+08:00')},days:[{date:'2026-10-14',min:10,max:20,text:'晴',precipitationMm:0,rainProbability:0},{date:'2026-10-15',min:9,max:18,text:'小雨',precipitationMm:2,rainProbability:70}]};
test('weather briefing schedules only future dates covered by a fresh forecast and labels source date',()=>{
  const result=planWeatherBriefing(bundle,'07:30',new Date(2026,9,14,12));assert.equal(result.length,1);assert.equal(result[0].schedule?.at?.getDate(),15);assert.match(result[0].body,/带伞/);assert.match(result[0].body,/预报/);
});
test('weather briefing does not schedule stale or absent forecast and rejects invalid clock',()=>{
  assert.equal(planWeatherBriefing(bundle,'07:30',new Date(2026,9,17,12)).length,0);assert.equal(planWeatherBriefing(null,'07:30').length,0);assert.throws(()=>planWeatherBriefing(bundle,'25:00'));
});
