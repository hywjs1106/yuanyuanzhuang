import Dexie, { type Table } from 'dexie';
import type { LedgerEntry } from '@/types';
import {validateEntry,validateBackup,type Snapshot,type TerminalSettings,type VisualTheme,type Note,type Message} from './ledger';
import {validateReminder,type Reminder} from './reminders';
class TerminalDatabase extends Dexie {
  entries!:Table<LedgerEntry,string>;reminders!:Table<Reminder,string>;notes!:Table<Note,string>;messages!:Table<Message,string>;settings!:Table<TerminalSettings,string>;
  constructor(){super('DailyTerminal');this.version(1).stores({entries:'id,date,direction',reminders:'id,startAt',notes:'id,createdAt',messages:'id,createdAt',settings:'id'});}
}
export const terminalDb=new TerminalDatabase();
export const defaultSettings:TerminalSettings={id:'main',budget:0,theme:'light',weather:{provider:'openmeteo'}};
export async function initializeTerminal(){await terminalDb.open();await terminalDb.transaction('rw',terminalDb.settings,async()=>{if(!await terminalDb.settings.get('main'))await terminalDb.settings.put(defaultSettings);});}
export async function saveEntry(entry:LedgerEntry){await terminalDb.entries.put(validateEntry(entry));}
export async function saveReminder(reminder:Reminder){await terminalDb.reminders.put(validateReminder(reminder));}
export async function saveSettings(settings:TerminalSettings){if(!Number.isFinite(settings.budget)||settings.budget<0||settings.budget>100000000)throw new Error('预算不正确');if(settings.visualTheme!==undefined&&!['fangyi','si'].includes(settings.visualTheme))throw new Error('角色风格不正确');await terminalDb.settings.put({...settings,id:'main'});}
export async function setVisualTheme(visualTheme:VisualTheme){
  if(visualTheme!=='fangyi'&&visualTheme!=='si')throw new Error('角色风格不正确');
  await terminalDb.transaction('rw',terminalDb.settings,async()=>{
    const latest=await terminalDb.settings.get('main')??defaultSettings;
    await terminalDb.settings.put({...latest,visualTheme,id:'main'});
  });
}
/** Ordinary settings saves may finish after the user has switched companions. */
export async function saveSettingsKeepingVisualTheme(settings:TerminalSettings){
  await terminalDb.transaction('rw',terminalDb.settings,async()=>{
    const latest=await terminalDb.settings.get('main');
    await saveSettings({...settings,visualTheme:latest?.visualTheme});
  });
}
export async function exportSnapshot():Promise<Snapshot>{
  const [entries,reminders,notes,messages,settings]=await Promise.all([terminalDb.entries.toArray(),terminalDb.reminders.toArray(),terminalDb.notes.toArray(),terminalDb.messages.toArray(),terminalDb.settings.get('main')]);
  return {entries,reminders,notes,messages,settings:settings??defaultSettings};
}
export async function restoreSnapshot(value:unknown){
  const snapshot=validateBackup(value);
  await terminalDb.transaction('rw',[terminalDb.entries,terminalDb.reminders,terminalDb.notes,terminalDb.messages,terminalDb.settings],async()=>{
    const local=await terminalDb.settings.get('main');
    const settings={...snapshot.settings};
    // Credentials and their destination stay paired on this device, even when the backup has no provider.
    // A different backup cannot redirect an existing key to its own endpoint, and Undo does not lose it.
    settings.ai=local?.ai??settings.ai;
    settings.weather=local?.weather?.apiKey?{...local.weather,city:settings.weather?.city??local.weather.city}:settings.weather??local?.weather;
    await Promise.all([terminalDb.entries.clear(),terminalDb.reminders.clear(),terminalDb.notes.clear(),terminalDb.messages.clear(),terminalDb.settings.clear()]);
    await Promise.all([terminalDb.entries.bulkPut(snapshot.entries),terminalDb.reminders.bulkPut(snapshot.reminders),terminalDb.notes.bulkPut(snapshot.notes),terminalDb.messages.bulkPut(snapshot.messages),terminalDb.settings.put(settings)]);
  });
}
