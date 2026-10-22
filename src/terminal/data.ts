import {recordStamp} from './recordStamp';
import {isAppMode,modeCharacter,type AppMode} from './appModes';
import {uniqueAssistantActions} from './assistantExecution';
import {validateActionBatch,type ActionChange} from './actionBatch';
import type {Proposal} from './assistant';
import Dexie, { type Table } from 'dexie';
import type { LedgerEntry } from '@/types';
import {makeBackup,validateEntry,validateBackup,type Snapshot,type TerminalSettings,type VisualTheme,type Note,type Message} from './ledger';
import {validateReminder,type Reminder} from './reminders';
import {validateMemories,type AssistantMemory} from './assistantMemory';
import {aiMode,aiProfiles,withAIProfile,selectAIProfile,type AIMode} from './aiProfiles';
import type {AIConfig} from '@/utils/aiClient';
export type DeletedRecord={id:string;kind:'entries';record:LedgerEntry;expiresAt:number}|{id:string;kind:'notes';record:Note;expiresAt:number};
class TerminalDatabase extends Dexie {
  deleted!:Table<DeletedRecord,string>;
  entries!:Table<LedgerEntry,string>;reminders!:Table<Reminder,string>;notes!:Table<Note,string>;messages!:Table<Message,string>;settings!:Table<TerminalSettings,string>;restorePoints!:Table<{id:string;snapshot:ReturnType<typeof makeBackup>},string>;
  constructor(){super('DailyTerminal');this.version(1).stores({entries:'id,date,direction',reminders:'id,startAt',notes:'id,createdAt',messages:'id,createdAt',settings:'id'});this.version(2).stores({messages:'id,createdAt,character,[character+createdAt+id],pendingCharacter',restorePoints:'id'}).upgrade(tx=>tx.table('messages').toCollection().modify(m=>{Object.assign(m,indexMessage(m));}));this.version(3).stores({deleted:'id,expiresAt'});}
}
export const terminalDb=new TerminalDatabase();
export const defaultSettings:TerminalSettings={id:'main',budget:0,theme:'light',weather:{provider:'openmeteo'}};
export async function initializeTerminal(){await terminalDb.open();await terminalDb.transaction('rw',terminalDb.settings,async()=>{if(!await terminalDb.settings.get('main'))await terminalDb.settings.put(defaultSettings);});await migrateLegacyUndo();await terminalDb.deleted.where('expiresAt').belowOrEqual(Date.now()).delete();}
export async function saveEntry(entry:LedgerEntry){await terminalDb.entries.put(validateEntry(entry));}
export async function saveReminder(reminder:Reminder){await terminalDb.reminders.put(validateReminder(reminder));}
export async function saveSettings(settings:TerminalSettings){if(!Number.isFinite(settings.budget)||settings.budget<0||settings.budget>100000000)throw new Error('预算不正确');if(settings.visualTheme!==undefined&&!['fangyi','si'].includes(settings.visualTheme))throw new Error('角色风格不正确');if(settings.appMode!==undefined&&!isAppMode(settings.appMode))throw new Error('界面模式不正确');await terminalDb.settings.put({...settings,...(settings.appMode?{visualTheme:modeCharacter(settings.appMode)}:{}),id:'main'});}
export async function setAppMode(appMode:AppMode){
 if(!isAppMode(appMode))throw new Error('界面模式不正确');
 await terminalDb.transaction('rw',terminalDb.settings,async()=>{const latest=await terminalDb.settings.get('main')??defaultSettings;await terminalDb.settings.put({...latest,appMode,visualTheme:modeCharacter(appMode),id:'main'});});
}
export async function setVisualTheme(visualTheme:VisualTheme){
  if(visualTheme!=='fangyi'&&visualTheme!=='si')throw new Error('角色风格不正确');
  await terminalDb.transaction('rw',terminalDb.settings,async()=>{
    const latest=await terminalDb.settings.get('main')??defaultSettings;
    await terminalDb.settings.put({...latest,visualTheme,appMode:visualTheme,id:'main'});
  });
}
/** Ordinary settings saves may finish after the user has switched companions. */
export async function saveSettingsKeepingVisualTheme(settings:TerminalSettings){
  await terminalDb.transaction('rw',terminalDb.settings,async()=>{
    const latest=await terminalDb.settings.get('main');
    await saveSettings({...settings,...(latest?{ai:latest.ai,aiMode:latest.aiMode,aiProfiles:latest.aiProfiles}:{}),visualTheme:latest?.visualTheme,appMode:latest?.appMode,assistantMemories:latest?.assistantMemories,assistantMemoryEnabled:latest?.assistantMemoryEnabled});
  });
}
export async function saveAIProfile(mode:AIMode,config:AIConfig|undefined){
 await terminalDb.transaction('rw',terminalDb.settings,async()=>{const latest=await terminalDb.settings.get('main')??defaultSettings;await terminalDb.settings.put(withAIProfile(latest,mode,config));});
}
export async function switchAIProfile(mode:AIMode){
 await terminalDb.transaction('rw',terminalDb.settings,async()=>{const latest=await terminalDb.settings.get('main')??defaultSettings;await terminalDb.settings.put(selectAIProfile(latest,mode));});
}
export async function updateAssistantMemory(change:{kind:'put';memory:AssistantMemory}|{kind:'delete';id:string}|{kind:'enabled';enabled:boolean}){
  await terminalDb.transaction('rw',terminalDb.settings,async()=>{
    const latest=await terminalDb.settings.get('main')??defaultSettings;
    if(change.kind==='enabled'){
      if(typeof change.enabled!=='boolean')throw new Error('角色记忆开关不正确');
      await terminalDb.settings.put({...latest,assistantMemoryEnabled:change.enabled});
      return;
    }
    const rows=(latest.assistantMemories??[]).filter(m=>m.id!==(change.kind==='put'?change.memory.id:change.id));
    if(change.kind==='put')rows.push(change.memory);
    await terminalDb.settings.put({...latest,assistantMemories:validateMemories(rows)});
  });
}
const snapshotTables=()=>[terminalDb.entries,terminalDb.reminders,terminalDb.notes,terminalDb.messages,terminalDb.settings,terminalDb.deleted];
export async function exportSnapshot():Promise<Snapshot>{
 return terminalDb.transaction('r',snapshotTables(),async()=>{
  const [entries,reminders,notes,messages,settings]=await Promise.all([terminalDb.entries.toArray(),terminalDb.reminders.toArray(),terminalDb.notes.toArray(),terminalDb.messages.toArray(),terminalDb.settings.get('main')]);
  return {entries,reminders,notes,messages,settings:settings??defaultSettings};
 });
}
async function applySnapshot(snapshot:Snapshot){
 const local=await terminalDb.settings.get('main');const settings={...snapshot.settings};
 // Credentials stay paired with their destination on this device, including Undo.
 settings.ai=local?.ai??settings.ai;
 if(local&&(local.ai||local.aiProfiles)){settings.aiMode=aiMode(local);settings.aiProfiles=aiProfiles(local);settings.ai=settings.aiProfiles[settings.aiMode];}
 settings.weather=local?.weather?.apiKey?{...local.weather,city:settings.weather?.city??local.weather.city}:settings.weather??local?.weather;
 await Promise.all([terminalDb.entries.clear(),terminalDb.reminders.clear(),terminalDb.notes.clear(),terminalDb.messages.clear(),terminalDb.settings.clear(),terminalDb.deleted.clear()]);
 await Promise.all([terminalDb.entries.bulkPut(snapshot.entries),terminalDb.reminders.bulkPut(snapshot.reminders),terminalDb.notes.bulkPut(snapshot.notes),terminalDb.messages.bulkPut(snapshot.messages.map(indexMessage)),terminalDb.settings.put(settings)]);
}
export async function restoreSnapshot(value:unknown){
 const snapshot=validateBackup(value);await terminalDb.transaction('rw',snapshotTables(),()=>applySnapshot(snapshot));
}
export async function restoreWithUndo(value:unknown){
 const snapshot=validateBackup(value);
 await terminalDb.transaction('rw',[...snapshotTables(),terminalDb.restorePoints],async()=>{
  const previous=makeBackup(await exportSnapshot());validateBackup(previous);await terminalDb.restorePoints.put({id:'previous',snapshot:previous});await applySnapshot(snapshot);
 });
}
export async function undoRestore(){
 await terminalDb.transaction('rw',[...snapshotTables(),terminalDb.restorePoints],async()=>{
  const point=await terminalDb.restorePoints.get('previous');if(!point)throw new Error('没有可撤销的恢复');await applySnapshot(validateBackup(point.snapshot));await terminalDb.restorePoints.delete('previous');
 });
}
async function migrateLegacyUndo(){
 try{if(typeof localStorage==='undefined')return;const raw=localStorage.getItem('daily-terminal-pre-restore');if(!raw)return;
  const snapshot=makeBackup(validateBackup(JSON.parse(raw)));await terminalDb.transaction('rw',terminalDb.restorePoints,async()=>{if(!await terminalDb.restorePoints.get('previous'))await terminalDb.restorePoints.put({id:'previous',snapshot});});localStorage.removeItem('daily-terminal-pre-restore');
 }catch{/* Legacy checkpoint failure must not prevent normal app startup or destroy the source. */}
}
/** Internal query keys are derived, never trusted from a backup. */
export function indexMessage(message:Message):Message{
 const character=message.character??'fangyi';const pending=message.actionBatch?.actions.some((_,index)=>!message.actionBatch!.states[index]);
 return {...message,character,pendingCharacter:pending?character:undefined};
}

export async function registerActionBatch(requestId:string,actions:Proposal[]){
 return await terminalDb.transaction('rw',terminalDb.messages,async()=>{
  const message=await terminalDb.messages.get(requestId);if(!message||message.role!=='user')throw new Error('原始请求未保存，未执行事项');
  if(message.actionBatch)return message.actionBatch.actions;
  const batch=validateActionBatch({actions:uniqueAssistantActions(actions),states:{},errors:{},drafts:{}});
  await terminalDb.messages.put(indexMessage({...message,actionBatch:batch}));return batch.actions;
 });
}
export async function patchActionBatch(requestId:string,index:number,change:ActionChange){
 await terminalDb.transaction('rw',terminalDb.messages,async()=>{
  const message=await terminalDb.messages.get(requestId);const b=message?.actionBatch;
  if(!message||!b||!b.actions[index])throw new Error('确认事项不存在');
  if(b.states[index]&&change.kind!=='error')return;
  if(change.kind==='edit'){b.actions[index]=change.proposal;delete b.drafts[index];delete b.errors[index];}
  if(change.kind==='draft'){if(change.fields)b.drafts[index]=change.fields;else delete b.drafts[index];}
  if(change.kind==='ignore'){b.states[index]='已忽略';delete b.drafts[index];delete b.errors[index];}
  if(change.kind==='error')b.errors[index]=change.message.slice(0,2000);
  if(change.kind==='result'){if(change.state)b.states[index]=change.state;if(change.error)b.errors[index]=change.error.slice(0,2000);}
  await terminalDb.messages.put(indexMessage({...message,actionBatch:validateActionBatch(b)}));
 });
}
/** Called inside the same transaction as the business write, including idempotent retries. */
export async function markActionCommitted(operationId:string){
 const match=/^ai-(.+)-(\d+)$/.exec(operationId);if(!match)return;
 const message=await terminalDb.messages.get(match[1]);const b=message?.actionBatch;const index=Number(match[2]);if(!message||!b?.actions[index])return;
 if(b.states[index]==='已忽略')throw new Error('事项已忽略，未执行');
 b.states[index]='已保存';delete b.drafts[index];delete b.errors[index];
 await terminalDb.messages.put(indexMessage({...message,actionBatch:b}));
}

/** Must share the record-write transaction, so another view cannot revive a final decision. */
export async function assertActionPending(operationId:string,proposal:Proposal){
 const match=/^ai-(.+)-(\d+)$/.exec(operationId);if(!match)return;
 const message=await terminalDb.messages.get(match[1]);const batch=message?.actionBatch;const index=Number(match[2]);
 if(!batch?.actions[index])throw new Error('确认事项不存在，请重新核对');
 if(batch.states[index])throw new Error(`事项${batch.states[index]}，不会再次执行`);
 const canonical=recordStamp;
 if(canonical(batch.actions[index])!==canonical(proposal))throw new Error('事项已在其他页面修改，请重新核对');
}
