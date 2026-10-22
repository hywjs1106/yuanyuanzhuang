import {SI_STICKER_CATALOG} from './siStickers';

const faces=['(￣▽￣)','(・ω・)？','(•̀ᴗ•́)و','(´▽｀)'];
export function SiStickerPicker({onSelect,onKaomoji,disabled=false}:{onSelect:(id:string)=>void;onKaomoji:(face:string)=>void;disabled?:boolean}){
 return <section className="sticker-picker si-sticker-picker" aria-label="祀表情库">
  <div className="sticker-picker__heading"><strong>祀的小表情</strong><span>点选预览 · {SI_STICKER_CATALOG.length} 张</span></div>
  <div className="sticker-picker__grid">{SI_STICKER_CATALOG.map(s=><button key={s.id} type="button" className="sticker-picker__item" aria-label={`预览祀表情：${s.label}`} onClick={()=>onSelect(s.id)}><img src={s.poster} alt={s.label} width="72" height="72" loading="lazy" decoding="async"/><span>{s.label}</span></button>)}</div>
  <div className="si-kaomoji" role="group" aria-label="插入颜文字">{faces.map(face=><button key={face} type="button" disabled={disabled} aria-label={`插入颜文字 ${face}`} onClick={()=>onKaomoji(face)}>{face}</button>)}</div>
  <small className="sticker-picker__credit">官方第十弹 · 点击颜文字加入输入框</small>
 </section>;
}
