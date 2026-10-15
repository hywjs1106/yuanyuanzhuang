import {test,expect} from '@playwright/test';

test('minimal home refreshes configured weather into the cache without rendering weather controls',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('https://geocoding-api.open-meteo.com/**',route=>route.fulfill({json:{results:[{name:'北京',latitude:39.9,longitude:116.4,admin1:'北京'}]}}));
 let temperature=22;
 const day=(offset:number)=>{const d=new Date();d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
 await page.route('https://api.open-meteo.com/**',route=>route.fulfill({json:{utc_offset_seconds:28800,current:{temperature_2m:temperature,relative_humidity_2m:50,apparent_temperature:temperature,is_day:1,weather_code:3,time:`${day(0)}T12:00`},daily:{time:[day(0),day(1),day(2)],weather_code:[3,61,0],temperature_2m_max:[25,20,22],temperature_2m_min:[14,12,13],precipitation_sum:[0,2,0],precipitation_probability_max:[10,70,0]}}}));
 await page.goto('/');await page.getByRole('button',{name:'打开天气',exact:true}).click();await page.getByLabel('搜索城市').fill('北京');await page.getByRole('button',{name:'搜索城市',exact:true}).click();await page.getByRole('button',{name:/选择 北京/}).click();await expect(page.getByText('22°',{exact:true})).toBeVisible();
 await page.getByRole('navigation',{name:'功能导航'}).getByRole('button',{name:'今日',exact:true}).click();temperature=24;await page.reload();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dailyterminal.weather.lastgood.v1')??'null')?.bundle?.now?.temp)).toBe(24);
 await expect(page.locator('main').getByRole('button')).toHaveCount(4);await expect(page.getByRole('region',{name:'天气摘要'})).toHaveCount(0);
});
