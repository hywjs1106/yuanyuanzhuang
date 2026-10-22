import {createContext,useContext,useRef,useState,type ReactNode,type SetStateAction} from 'react';
const PageViews=createContext<Map<string,unknown>|undefined>(undefined);
/** Session-only browsing choices, never credentials or saved business data. */
export function PageViewProvider({children}:{children:ReactNode}){const values=useRef(new Map<string,unknown>());return <PageViews.Provider value={values.current}>{children}</PageViews.Provider>;}
export function usePageValue<T,>(key:string,initial:T|(()=>T)){
 const values=useContext(PageViews);const [value,setValue]=useState<T>(()=>values?.has(key)?values.get(key) as T:typeof initial==='function'?(initial as ()=>T)():initial);
 const current=useRef(value);const update=(next:SetStateAction<T>)=>{const result=typeof next==='function'?(next as (before:T)=>T)(current.current):next;current.current=result;values?.set(key,result);setValue(result);};return [value,update] as const;
}
