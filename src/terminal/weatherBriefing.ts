import {LocalNotifications,type LocalNotificationSchema} from '@capacitor/local-notifications';
import {Capacitor} from '@capacitor/core';
import type {WeatherBundle} from './weather';
import {validDateKey} from './ledger';
export function planWeatherBriefing(bundle:WeatherBundle|null,time:string,now=new Date()):LocalNotificationSchema[]{
  if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('天气早报时间不正确');
  if(!bundle||now.getTime()-Date.parse(bundle.fetchedAt)>24*3600000)return [];
  const [hour,minute]=time.split(':').map(Number);
  return bundle.days.slice(0,3).flatMap((d,index)=>{
    if(!validDateKey(d.date))return [];
    const [y,m,day]=d.date.split('-').map(Number);const at=new Date(y,m-1,day,hour,minute);
    if(at.getTime()<=now.getTime())return [];
    const umbrella=d.precipitationMm>=0.5||(d.rainProbability??0)>=40;
    return [{id:-5000+index,title:'出门前 · 天气早报',body:`${d.text}，${Math.round(d.min)}–${Math.round(d.max)}°。${umbrella?'可能有降水，记得带伞。':'出门前再看一眼天气。'}依据${new Date(bundle.fetchedAt).toLocaleDateString('zh-CN')}预报。`,channelId:'terminal-reminders',schedule:{at,allowWhileIdle:true},extra:{terminalWeather:true}}];
  });
}
let queue=Promise.resolve();
export function syncWeatherBriefing(bundle:WeatherBundle|null,enabled:boolean,time='07:30'):Promise<void>{
  const work=queue.then(async()=>{
    if(!Capacitor.isNativePlatform())return;
    const old=(await LocalNotifications.getPending()).notifications.filter(n=>n.id>=-5000&&n.id<=-4998);
    if(old.length)await LocalNotifications.cancel({notifications:old.map(n=>({id:n.id}))});
    if(!enabled||(await LocalNotifications.checkPermissions()).display!=='granted')return;
    await LocalNotifications.createChannel({id:'terminal-reminders',name:'日常提醒',importance:4});
    const notifications=planWeatherBriefing(bundle,time);if(notifications.length)await LocalNotifications.schedule({notifications});
  });queue=work.catch(()=>undefined);return work;
}
