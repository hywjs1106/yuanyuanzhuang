import {terminalDb} from './data';
/** Immediate delete + short-lived recovery record commit together. */
export async function deleteWithUndo(kind:'entries'|'notes',id:string,now=Date.now()){
 await terminalDb.transaction('rw',[terminalDb.entries,terminalDb.notes,terminalDb.deleted],async()=>{
  await terminalDb.deleted.where('expiresAt').belowOrEqual(now).delete();
  if(kind==='entries'){const record=await terminalDb.entries.get(id);if(!record)return;await terminalDb.deleted.put({id:`entries:${id}`,kind,record,expiresAt:now+5000});await terminalDb.entries.delete(id);}
  else{const record=await terminalDb.notes.get(id);if(!record)return;await terminalDb.deleted.put({id:`notes:${id}`,kind,record,expiresAt:now+5000});await terminalDb.notes.delete(id);}
 });
}
export async function undoDeleted(now=Date.now()){
 return terminalDb.transaction('rw',[terminalDb.entries,terminalDb.notes,terminalDb.deleted],async()=>{
  await terminalDb.deleted.where('expiresAt').belowOrEqual(now).delete();const rows=await terminalDb.deleted.toArray();
  for(const row of rows){if(row.kind==='entries'){if(await terminalDb.entries.get(row.record.id))throw new Error('同编号的账目已存在，未覆盖，请先核对');await terminalDb.entries.add(row.record);}else{if(await terminalDb.notes.get(row.record.id))throw new Error('同编号的备忘已存在，未覆盖，请先核对');await terminalDb.notes.add(row.record);}}
  await terminalDb.deleted.bulkDelete(rows.map(row=>row.id));return rows.length;
 });
}
