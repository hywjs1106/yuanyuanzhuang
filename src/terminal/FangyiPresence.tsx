import {useEffect,useRef,useState} from 'react';
import {getSticker} from './stickerCatalog';

const portrait='/characters/stickers/fy-01-08.jpg';
const greetings=['fy-01-06','fy-01-08','fy-01-17'] as const;

/** A local, user-triggered character gesture; never an AI message or inferred emotion. */
export function FangyiPresence({busy}:{busy:boolean}){
  const [reaction,setReaction]=useState<string>();
  const [reduced,setReduced]=useState(false);
  const [visible,setVisible]=useState(true);
  const [failed,setFailed]=useState(false);
  const count=useRef(0);
  const target=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReduced(media.matches);update();
    media.addEventListener('change',update);
    let inView=true;
    const visibility=()=>{const shown=inView&&document.visibilityState!=='hidden';setVisible(shown);if(!shown)setReaction(undefined);};
    const observer=typeof IntersectionObserver==='undefined'?undefined:new IntersectionObserver(entries=>{inView=entries[0]?.isIntersecting??false;visibility();});
    if(target.current)observer?.observe(target.current);
    document.addEventListener('visibilitychange',visibility);visibility();
    return()=>{media.removeEventListener('change',update);observer?.disconnect();document.removeEventListener('visibilitychange',visibility);};
  },[]);
  useEffect(()=>{if(!reaction)return;const timer=window.setTimeout(()=>setReaction(undefined),5000);return()=>window.clearTimeout(timer);},[reaction]);
  useEffect(()=>{if(busy)setReaction(undefined);},[busy]);
  const sticker=getSticker(reaction??(busy?'fy-01-02':''));
  const src=failed?portrait:sticker?(reaction&&visible&&!reduced?sticker.localAsset:sticker.poster):portrait;
  return <button ref={target} type="button" className="fangyi-presence" disabled={busy}
    aria-label={reaction?'停止人物表情':'和方宜打个招呼'} aria-pressed={!!reaction}
    onClick={()=>{setFailed(false);setReaction(current=>current?undefined:greetings[count.current++%greetings.length]);}}>
    <span className="fangyi-presence-frame">
      <svg className="fangyi-presence-orbit" viewBox="0 0 120 120" aria-hidden="true"><path d="M10 36V10h26M84 10h26v26M110 84v26H84M36 110H10V84"/><path d="M4 64a56 56 0 0 0 52 52M64 4a56 56 0 0 1 52 52"/></svg>
      <img className="fangyi-presence-art" src={src} alt="庄方宜头像" width="104" height="104" onError={()=>setFailed(true)}/>
    </span>
    <span className="fangyi-presence-hint" aria-hidden="true">{busy?'正在回复':reaction?<svg viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" rx="1"/></svg>:'打个招呼'}</span>
  </button>;
}
