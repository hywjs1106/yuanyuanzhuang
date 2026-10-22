export type AppMode='fangyi'|'si'|'tea';
export const appModes=[
 {id:'fangyi',name:'庄方宜 · 帝江号',short:'方宜',detail:'工业风',image:'/characters/fangyi-bouquet-avatar.webp'},
 {id:'si',name:'祀 · 水墨缘缘庄',short:'水墨',detail:'原水墨风',image:'/themes/si/official/01.png'},
 {id:'tea',name:'祀 · 秋日茶馆',short:'茶馆',detail:'Q版人物与墨魉',image:'/previews/si-conversation-fullbody.webp'}
] as const;
export const isAppMode=(value:unknown):value is AppMode=>value==='fangyi'||value==='si'||value==='tea';
export const modeCharacter=(mode:AppMode):'fangyi'|'si'=>mode==='fangyi'?'fangyi':'si';
export function appMode(settings:{appMode?:AppMode;visualTheme?:'fangyi'|'si'}):AppMode{return isAppMode(settings.appMode)?settings.appMode:settings.visualTheme==='si'?'si':'fangyi';}
export function nextAppMode(mode:AppMode):AppMode{return appModes[(appModes.findIndex(m=>m.id===mode)+1)%appModes.length].id;}
