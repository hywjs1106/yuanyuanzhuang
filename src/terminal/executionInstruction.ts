import type {Message} from './ledger';import {hasLedgerIntent,hasReminderIntent,unsafeCommand} from './assistantCommands';
/** Only a direct answer to the latest unresolved clarification can inherit intent. */
export function executionInstruction(text:string,history:Message[]):string{
 if(text.length>100||unsafeCommand(text)||!/\d|[一二两三四五六七八九十]|早上|上午|下午|晚上/.test(text)||/删除|删掉|取消|修改|改成|记账|提醒我|保存/.test(text))return text;
 const last=history[history.length-1];if(last?.role!=='assistant'||!/[?？]|几点|日期|时间|金额|请.*(?:说明|补充|明确|指定)/.test(last.text))return text;
 const previous=[...history.slice(0,-1)].reverse().find(m=>m.role==='user');if(!previous||previous.actionBatch||unsafeCommand(previous.text)||!(hasLedgerIntent(previous.text)||hasReminderIntent(previous.text)))return text;
 return `${previous.text}\n本轮补充：${text}`;
}
