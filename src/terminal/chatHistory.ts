import {terminalDb} from './data';
import type {Message,VisualTheme} from './ledger';
export type MessageCursor=[VisualTheme,string,string];
export const messageCursor=(m:Message):MessageCursor=>[m.character??'fangyi',m.createdAt,m.id];
export const roleStart=(character:VisualTheme)=>[character];
export const roleEnd=(character:VisualTheme)=>[character,[]];
/** Keyset pagination. IDs break timestamp ties, so equal-time messages are never skipped. */
export async function readMessagePage(character:VisualTheme,before?:MessageCursor,take=30,includeBefore=false):Promise<Message[]>{
 return (await terminalDb.messages.where('[character+createdAt+id]').between(roleStart(character),before??roleEnd(character),true,before?includeBefore:true).reverse().limit(take).toArray()).reverse();
}
export async function initialMessageWindow(character:VisualTheme,view:{nearBottom:boolean;anchor?:{id:string}}){
 let upper:MessageCursor|undefined;
 if(!view.nearBottom&&view.anchor){const anchor=await terminalDb.messages.get(view.anchor.id);if(anchor&&(anchor.character??'fangyi')===character){
  const after=await terminalDb.messages.where('[character+createdAt+id]').between(messageCursor(anchor),roleEnd(character),false,true).limit(14).toArray();upper=messageCursor(after[after.length-1]??anchor);
 }}
 const rows=await readMessagePage(character,upper,30,true);
 return {lower:rows[0]?messageCursor(rows[0]):undefined,upper};
}
