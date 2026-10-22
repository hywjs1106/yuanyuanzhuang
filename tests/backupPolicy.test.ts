import {test} from 'node:test';import assert from 'node:assert/strict';import {assertBackupSize,BACKUP_MAX_BYTES,encodeBackup} from '../src/terminal/backupPolicy';
test('backup export and import share the same UTF8 byte limit',()=>{
 assert.doesNotThrow(()=>assertBackupSize(BACKUP_MAX_BYTES));assert.throws(()=>assertBackupSize(BACKUP_MAX_BYTES+1),/25MB/);
 const snapshot={entries:[],reminders:[],messages:[],settings:{id:'main' as const,budget:0},notes:[{id:'note',text:'中文',createdAt:new Date().toISOString()}]};const encoded=encodeBackup(snapshot);assert.ok(new TextEncoder().encode(encoded).byteLength>encoded.length);assert.match(encoded,/中文/);
 const oversized={...snapshot,notes:[{...snapshot.notes[0],text:'字'.repeat(Math.ceil(BACKUP_MAX_BYTES/3))}]};assert.throws(()=>encodeBackup(oversized),/25MB/);
});
