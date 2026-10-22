import {parseAssistantReply,type Proposal} from './assistant';
import {parseMoney} from './ledger';
export type ProposalFields=Partial<Record<'direction'|'amount'|'date'|'type'|'note'|'title'|'at'|'repeat'|'text',string>>;
/** Reuse the same validated action boundary as model responses. Never executes. */
export function applyProposalDraft(original:Proposal,fields:ProposalFields):Proposal{
 let value:unknown;
 if(original.kind==='manage'){if(!original.value)throw new Error('此操作请在聊天中重新说明');return {...original,value:applyProposalDraft(original.value,fields) as typeof original.value};}
 if(original.kind==='ledger')value={...original,...fields,kind:'ledger',amount:fields.amount===undefined?original.amount:parseMoney(fields.amount)};
 else if(original.kind==='reminder')value={...original,...fields,kind:'reminder'};
 else value={...original,text:fields.text??original.text,kind:'note'};
 return parseAssistantReply(JSON.stringify({reply:'',actions:[value]})).actions[0];
}
