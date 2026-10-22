import {recordStamp} from './recordStamp';
import {modelMayExecute} from './assistantAuthorization';
import type { Proposal } from './assistant';
import { shouldAutoExecute } from './assistantCommands';

export type AssistantActionExecutor = (action: Proposal, operationId: string, signal: AbortSignal) => Promise<string | void>;
export interface AssistantExecutionResult {
  actions: Proposal[];
  states: Record<number, string>;
  receipts: string[];
  errors: Record<number,string>;
}

export function uniqueAssistantActions(actions:Proposal[]):Proposal[]{
 return [...new Map(actions.map(action=>[recordStamp(action),action])).values()];
}

export async function executeAssistantActions(
  text: string,
  actions: Proposal[],
  requestId: string,
  onExecute: AssistantActionExecutor,
  signal: AbortSignal,
  now = new Date(),
  mode:'local'|'model'='local',
): Promise<AssistantExecutionResult> {
  const unique=uniqueAssistantActions(actions);
  const result: AssistantExecutionResult = { actions: unique, states: {}, receipts: [], errors:{} };
  let attempted = false;const performed=new Map<string,number>();
  for (const [index, action] of unique.entries()) {
    if (signal.aborted) break;
    if (!(mode==='model'?modelMayExecute(text,action,now):shouldAutoExecute(text, action, now))) continue;
    // The conservative local parser authorizes one operation per user instruction.
    // Model metadata variations cannot authorize another write or an implicit retry.
    const operationKey=action.kind==='ledger'?`${action.kind}:${action.date}:${action.amount}:${action.direction}`:action.kind==='manage'?`${action.kind}:${action.target}:${action.id}`:recordStamp(action);
    const mentions=action.kind==='ledger'?(text.replace(/\d{4}-\d{2}-\d{2}/g,'').match(/\d+(?:\.\d+)?/g)??[]).filter(n=>Number(n)===action.amount).length:1;
    const limit=action.kind==='ledger'?Math.max(1,mentions):1;
    if ((mode==='local'&&attempted)||(mode==='model'&&(performed.get(operationKey)??0)>=limit)) {
      result.states[index] = '已忽略';
      result.receipts.push('额外重复操作已忽略，未执行。');
      continue;
    }
    attempted = true;performed.set(operationKey,(performed.get(operationKey)??0)+1);
    try {
      const receipt = await onExecute(action, `ai-${requestId}-${index}`, signal);
      // The callback returning confirms the write, even if cancellation arrived while it ran.
      result.states[index] = '已保存';
      if (typeof receipt === 'string' && receipt.trim()) result.receipts.push(receipt);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      result.errors[index]=detail||'执行失败';
      result.receipts.push(`操作未完成：${detail || '执行失败'}，可以手动重试。`);
    }
  }
  return result;
}
