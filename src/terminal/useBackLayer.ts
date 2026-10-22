import {useEffect,useRef,type RefObject} from 'react';
import {createBackLayers} from './backLayers';
const layers=createBackLayers();
function back(event:Event){if(!event.defaultPrevented&&layers.dismiss())event.preventDefault();}
function escape(event:KeyboardEvent){if(event.key==='Escape'&&!event.defaultPrevented&&layers.dismiss()){event.preventDefault();}}

/** Shared with Android's terminal-back event; no browser history entries added. */
export function useBackLayer(active:boolean,close:()=>void,restoreTo?:RefObject<HTMLElement>){
 const latest=useRef(close);latest.current=close;
 const target=useRef(restoreTo);target.current=restoreTo;
 useEffect(()=>{
  if(!active)return;
  const origin=document.activeElement instanceof HTMLElement&&document.activeElement!==document.body?document.activeElement:null;
  const remove=layers.add(()=>{latest.current();queueMicrotask(()=>{const opener=target.current?.current??origin;if(opener?.isConnected)opener.focus({preventScroll:true});});});
  if(layers.size()===1){window.addEventListener('terminal-back',back);window.addEventListener('keydown',escape);}
  return()=>{remove();if(!layers.size()){window.removeEventListener('terminal-back',back);window.removeEventListener('keydown',escape);}};
 },[active]);
}
