import type { Proposal } from './assistant';
import { shouldAutoExecute } from './assistantCommands';

export type AssistantActionExecutor = (action: Proposal, operationId: string, signal: AbortSignal) => Promise<string | void>;
export interface AssistantExecutionResult {
  actions: Proposal[];
  states: Record<number, string>;
  receipts: string[];
}

export async function executeAssistantActions(
  text: string,
  actions: Proposal[],
  requestId: string,
  onExecute: AssistantActionExecutor,
  signal: AbortSignal,
  now = new Date(),
): Promise<AssistantExecutionResult> {
  const unique = [...new Map(actions.map(action => [
    JSON.stringify(action, Object.keys(action).sort()), action,
  ])).values()];
  const result: AssistantExecutionResult = { actions: unique, states: {}, receipts: [] };
  let attempted = false;
  for (const [index, action] of unique.entries()) {
    if (signal.aborted) break;
    if (!shouldAutoExecute(text, action, now)) continue;
    // The conservative local parser authorizes one operation per user instruction.
    // Model metadata variations cannot authorize another write or an implicit retry.
    if (attempted) {
      result.states[index] = '已忽略';
      result.receipts.push('额外重复操作已忽略，未执行。');
      continue;
    }
    attempted = true;
    try {
      const receipt = await onExecute(action, `ai-${requestId}-${index}`, signal);
      // The callback returning confirms the write, even if cancellation arrived while it ran.
      result.states[index] = '已保存';
      if (typeof receipt === 'string' && receipt.trim()) result.receipts.push(receipt);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      result.receipts.push(`操作未完成：${detail || '执行失败'}，可以手动重试。`);
    }
  }
  return result;
}
