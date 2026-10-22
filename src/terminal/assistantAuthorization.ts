import type {Proposal} from './assistant';import {hasLedgerIntent,hasReminderIntent,unsafeCommand,parseLocalLedger} from './assistantCommands';
/** User intent authorizes a domain; model validity alone never grants write access. */
export function modelMayExecute(text:string,action:Proposal,now=new Date()){
 if(unsafeCommand(text)||/是否|有没有|查[一看询]|看看|统计|多少|多少钱|几笔|哪[一条笔些]|对不对|记错|核对|先别|先不要|先不|暂时不|先整理|先列|先看看|研究|讨论|如何|能否|支不支持/.test(text))return false;
 if(action.kind==='manage'){
  const explicitDomains=[/账|流水/.test(text)?'ledger':null,/提醒|闹钟|待办|通知/.test(text)?'reminder':null,/备忘|清单/.test(text)?'note':null].filter(Boolean);
  if(explicitDomains.length&&(explicitDomains.length!==1||explicitDomains[0]!==action.target))return false;
  const domain=action.target==='ledger'?/账|收入|支出|花费|开销|消费|饭|餐|咖啡|奶茶|车费|元|块|金额|钱|分类/:action.target==='reminder'?/提醒|闹钟|待办|通知/:/备忘|清单/;
  if(!domain.test(text))return false;
  if(action.operation!=='update'||!action.unique||!/改成|改为|改到|修改|更正|调整|推迟|提前|挪到|停用|暂停|启用|恢复提醒/.test(text)||!/改成|改为|改到|更正为|调整为|调整到|推迟到|提前到|挪到|^(?:请|帮我|替我|给我|把|将|修改|更正|调整|停用|暂停|启用|恢复提醒)/.test(text))return false;
  if(action.value?.kind==='ledger'){const before=JSON.parse(action.before);if(before.amount!==action.value.amount){const values=(text.match(/\d+(?:\.\d+)?/g)??[]).map(Number);if(values.length&&!values.includes(action.value.amount))return false;}}
  return true;
 }
 if(action.kind==='note')return /(?:帮我|替我|给我|请|保存|记下|记录|添加)/.test(text)&&(/备忘|清单/.test(text)||(/记下|记录/.test(text)&&!hasReminderIntent(text)&&!/[元块]|花了|支出|收入/.test(text)));
 if(action.kind==='ledger'){
  if(!hasLedgerIntent(text)||/预算|预计|打算|准备|计划|报价|还没|未支付/.test(text)||/美元|美金|港币|欧元|日元|英镑|USD|EUR|HKD|JPY/i.test(text))return false;const expected=parseLocalLedger(text,now);if(expected)return expected.amount===action.amount&&expected.date===action.date&&expected.direction===action.direction;
  if(/\d+(?:\.\d+)?\s*(?:分钟|小时|页|天|次|个|公里)/.test(text)&&!/(?:元|块|人民币|CNY|RMB)/i.test(text))return false;
  const moneyText=text.replace(/\d{4}-\d{2}-\d{2}/g,'');const numbers=(moneyText.match(/\d+(?:\.\d+)?/g)??[]).map(Number);return numbers.length?numbers.includes(action.amount):/[一二两三四五六七八九十百千]+[元块]/.test(text);
 }
 if(!hasReminderIntent(text)||/什么时候|几点|到时候|晚点|过一会|改天/.test(text))return false;
 // An unqualified12-hour time still needs clarification; 明早/今晚 are qualified.
 if(/(?:^|[^\d])(?:[一二两三四五六七八九十]{1,3}|[0-9]|1[0-2])点/.test(text)&&!/凌晨|早上|上午|中午|下午|傍晚|晚上|夜里|明早|今早|今晚|明晚|今晨|明晨/.test(text))return false;
 return /\d{1,2}:\d{2}|[点时]|分钟后|小时后/.test(text);
}
