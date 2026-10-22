export const TASK_POLICY_MARKER:string;
export const TASK_POLICY_CHECK:string;
export function buildTaskPolicy(date:string):string;
export function buildTaskPolicyParts(date:string):{rules:string;examples:string};
export function augmentTerminalMessages<T extends {role:string;content:unknown}>(messages:T[]):T[];
export function withTaskTurnGuidance<T extends {role:string;content:unknown}>(messages:T[]):T[];
export function fitTerminalTaskPolicy<T extends {role:string;content:unknown}>(messages:T[],limit?:number):T[];
