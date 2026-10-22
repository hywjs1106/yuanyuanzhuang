/** Matching the intended action is insufficient if a model also proposes other writes. */
export function onlyAction(reply,kind,predicate){
 return Array.isArray(reply?.actions)&&reply.actions.length===1&&reply.actions[0]?.kind===kind&&predicate(reply.actions[0])===true;
}
