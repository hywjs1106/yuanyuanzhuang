import {makeBackup,validateBackup,type Snapshot} from './ledger';
export const BACKUP_MAX_BYTES=25*1024*1024;
export function assertBackupSize(bytes:number){if(bytes>BACKUP_MAX_BYTES)throw new Error('备份文件超过25MB，请减少内容后再导出或导入');}
export function encodeBackup(snapshot:Snapshot):string{const backup=makeBackup(snapshot);const text=JSON.stringify(backup);assertBackupSize(new TextEncoder().encode(text).byteLength);validateBackup(backup);return text;}
