import type {TerminalPage} from './BottomNavigation';
export type RouteMotion='tab'|'push'|'pop';
const parent=(page:TerminalPage):TerminalPage|undefined=>page==='notes'?'settings':['ledger','reminders','weather','almanac'].includes(page)?'today':undefined;
export function routeMotion(from:TerminalPage,to:TerminalPage,nativeBack=false):RouteMotion{
 if(nativeBack||parent(from)===to)return 'pop';
 if(parent(to)===from)return 'push';
 return 'tab';
}
