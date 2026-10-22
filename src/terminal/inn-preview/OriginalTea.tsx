import {useEffect,useRef,useState} from 'react';

// The camera has returned to the steady, wide tea-serving shot by 12 seconds.
const TAIL_LOOP_START=12;

/** One native decoder, mounted only on Today. No per-frame canvas work. */
export function OriginalTea({quiet}:{quiet:boolean}){
 const video=useRef<HTMLVideoElement>(null);
 const [playing,setPlaying]=useState(false),[failed,setFailed]=useState(false);
 const [choice,setChoice]=useState<'auto'|'play'|'pause'>('auto');
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[]);
 useEffect(()=>{
  const element=video.current;if(!element)return;
  let disposed=false;
  const update=()=>{
   if(document.hidden||quiet||choice==='pause'||(choice==='auto'&&reduced)){element.pause();return}
   if(element.ended)element.currentTime=TAIL_LOOP_START;
   void element.play().catch(()=>{if(!disposed)setPlaying(false)});
  };
  update();document.addEventListener('visibilitychange',update);element.addEventListener('ended',update);
  return()=>{disposed=true;document.removeEventListener('visibilitychange',update);element.removeEventListener('ended',update);element.pause()};
 },[quiet,choice,reduced]);
 return <section className="tea-scene original-tea" aria-label="祀和茶馆小伙计的原片动画">
  <video ref={video} src="/previews/tea-original.mp4" poster="/previews/tea-original-poster.webp" muted playsInline preload="metadata" disablePictureInPicture onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>setFailed(true)}/>
  {failed?<p className="original-error" role="status">原片暂时没有加载出来</p>:<button type="button" className="original-control" aria-label={playing?'暂停原片':'播放原片'} aria-pressed={playing} disabled={quiet} onClick={()=>setChoice(playing?'pause':'play')}>{quiet?'安静模式':playing?'暂停':'播放'}</button>}
 </section>
}
