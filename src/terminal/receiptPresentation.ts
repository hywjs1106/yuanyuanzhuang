import type {Proposal} from './assistant';
/** Never collapse a failure, an unconfirmed action or a notification warning. */
export function compactActionSummary(actions:Proposal[],states:Record<number,string>):string|undefined{
 if(!actions.length||actions.some((action,index)=>(action.kind==='reminder'||action.kind==='manage')||states[index]!=='已保存'))return;
 if(actions.length>1)return `${actions.length} 项已保存。`;
 return actions[0].kind==='ledger'?'已记入账簿。':'已保存备忘。';
}
