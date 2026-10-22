import {useEffect,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {terminalDb} from './data';
import {readConversationState} from './conversationState';
import {initialMessageWindow,readMessagePage,messageCursor,roleStart,roleEnd,type MessageCursor} from './chatHistory';
import type {Message,VisualTheme} from './ledger';
interface Window {lower?:MessageCursor;upper?:MessageCursor;}
const empty:Message[]=[];
export function useChatHistory(character:VisualTheme,enabled=true){
 const [window,setWindow]=useState<Window>();const [loading,setLoading]=useState(false);const [failure,setFailure]=useState('');const [retry,setRetry]=useState(0);
 useEffect(()=>{if(!enabled)return;let alive=true;setWindow(undefined);setFailure('');void initialMessageWindow(character,readConversationState(character)).then(value=>{if(alive)setWindow(value);}).catch(e=>{if(alive)setFailure(e instanceof Error?e.message:'聊天记录暂时无法读取');});return()=>{alive=false;};},[character,enabled,retry]);
 const result=useLiveQuery(async()=>{
  if(!enabled||!window)return;
  try{
   const [messages,pending,earlier,newer]=await Promise.all([
    window.lower?terminalDb.messages.where('[character+createdAt+id]').between(window.lower,window.upper??roleEnd(character),true,true).toArray():readMessagePage(character),
    terminalDb.messages.where('pendingCharacter').equals(character).toArray(),
    window.lower?terminalDb.messages.where('[character+createdAt+id]').between(roleStart(character),window.lower,true,false).count():0,
    window.upper?terminalDb.messages.where('[character+createdAt+id]').between(window.upper,roleEnd(character),false,true).count():0,
   ]);return {window,messages,pending,hasEarlier:earlier>0,hasNewer:newer>0,error:''};
  }catch(e){return {window,messages:empty,pending:empty,hasEarlier:false,hasNewer:false,error:e instanceof Error?e.message:'聊天记录暂时无法读取'};}
 },[character,enabled,window]);
 useEffect(()=>{if(window&&!window.lower&&result?.window===window&&result.messages[0])setWindow(current=>current?{...current,lower:messageCursor(result.messages[0])}:current);},[window,result]);
 async function earlier(){if(loading||!window?.lower)return;setLoading(true);setFailure('');try{const rows=await readMessagePage(character,window.lower);if(rows[0])setWindow(current=>({...current,lower:messageCursor(rows[0])}));}catch(e){setFailure(e instanceof Error?e.message:'更早消息读取失败');}finally{setLoading(false);}}
 async function latest(){if(loading)return;setLoading(true);setFailure('');try{setWindow(await initialMessageWindow(character,{nearBottom:true}));}catch(e){setFailure(e instanceof Error?e.message:'最新消息读取失败');}finally{setLoading(false);}}
 return {messages:result?.messages??empty,pending:result?.pending??empty,ready:!!result&&result.window===window&&!result.error,hasEarlier:result?.hasEarlier??false,hasNewer:result?.hasNewer??false,error:failure||result?.error||'',loading,earlier,latest,retry:()=>setRetry(value=>value+1)};
}
