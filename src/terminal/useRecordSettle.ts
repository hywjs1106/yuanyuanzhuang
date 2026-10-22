import {useEffect,useLayoutEffect,useRef} from 'react';
/** Keep surviving rows visually connected when records are removed or restored. */
export function useRecordSettle(ids:string[]){
 const host=useRef<HTMLDivElement>(null);const previous=useRef<{signature:string;tops:Map<string,number>}>();const motions=useRef<Animation[]>([]);const signature=JSON.stringify(ids);
 const cancel=()=>{motions.current.forEach(a=>a.cancel());motions.current=[];};
 useLayoutEffect(()=>{const node=host.current;if(!node)return;const rows=Array.from(node.querySelectorAll<HTMLElement>('[data-record-id]'));const top=node.getBoundingClientRect().top;const tops=new Map(rows.map(row=>[row.dataset.recordId!,row.getBoundingClientRect().top-top-new DOMMatrix(getComputedStyle(row).transform==='none'?undefined:getComputedStyle(row).transform).m42]));
  if(previous.current&&previous.current.signature!==signature){cancel();if(!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches)for(const row of rows){const before=previous.current.tops.get(row.dataset.recordId!);const after=tops.get(row.dataset.recordId!)!;if(before!==undefined&&Math.abs(before-after)>1)motions.current.push(row.animate([{transform:`translateY(${before-after}px)`},{transform:'none'}],{id:'record-settle',duration:160,easing:'cubic-bezier(.16,1,.3,1)'}));else if(before===undefined)motions.current.push(row.animate([{opacity:.65},{opacity:1}],{id:'record-settle',duration:140}));}}
  previous.current={signature,tops};
 });
 useEffect(()=>{const pref=matchMedia('(prefers-reduced-motion: reduce)');const reduce=()=>{if(pref.matches)cancel();};const hidden=()=>{if(document.hidden)cancel();};pref.addEventListener('change',reduce);document.addEventListener('visibilitychange',hidden);window.addEventListener('resize',cancel);return()=>{cancel();pref.removeEventListener('change',reduce);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('resize',cancel);};},[]);
 return host;
}
