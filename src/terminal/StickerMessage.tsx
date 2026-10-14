import { useEffect, useRef, useState } from 'react';
import { getSticker } from './stickerCatalog';

export interface StickerMessageProps {
  stickerId: string;
  autoPlay?: boolean;
}

/** Historical messages stay still. Animation is bounded and only mounted while playing. */
export function StickerMessage({ stickerId, autoPlay = false }: StickerMessageProps) {
  const sticker = getSticker(stickerId);
  const [playing, setPlaying] = useState(false);
  const [remote, setRemote] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [animationFailed, setAnimationFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const remoteTried = useRef(false);

  useEffect(() => {
    remoteTried.current = false;
    setRemote(false);
    setUnavailable(false);
    setAnimationFailed(false);
    const preference = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)') : undefined;
    setReducedMotion(preference?.matches ?? false);
    setPlaying(autoPlay && !preference?.matches);
    const update = () => {
      setReducedMotion(preference?.matches ?? false);
      if (preference?.matches) setPlaying(false);
    };
    preference?.addEventListener?.('change', update);
    return () => preference?.removeEventListener?.('change', update);
  }, [stickerId, autoPlay]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setPlaying(false), 5000);
    return () => window.clearTimeout(timer);
  }, [playing, stickerId]);

  if (!sticker) return null;
  const src = playing ? (remote ? sticker.remoteUrl : sticker.localAsset) : sticker.poster;
  const handleError = () => {
    if (playing && !remoteTried.current) {
      // URLs come only from the immutable source whitelist, never from a chat response.
      remoteTried.current = true;
      setRemote(true);
    } else if (playing) {
      setPlaying(false);
      setAnimationFailed(true);
    } else {
      setUnavailable(true);
    }
  };
  return (
    <figure className="sticker-message" aria-label={`方宜表情：${sticker.label}`}>
      {!unavailable && <img key={src} src={src} width={144} height={144}
        className="sticker-message__image" alt={`方宜表情：${sticker.label}`}
        loading={playing ? 'eager' : 'lazy'} decoding="async" onError={handleError} />}
      {unavailable && <span className="sticker-message__fallback">{sticker.label} · 表情暂时无法显示</span>}
      <figcaption>
        <button type="button" className="sticker-message__play"
          aria-label={playing ? '停止这张表情' : `播放表情：${sticker.label}`}
          disabled={animationFailed}
          onClick={() => {
            if (playing) setPlaying(false);
            else { setUnavailable(false); setPlaying(true); }
          }}>
          {playing ? '停止' : animationFailed ? '动画暂不可用' : '播放'}
        </button>
        {reducedMotion && !playing && <span className="sticker-message__hint">已减少动态效果，显示静态预览；可手动播放。</span>}
        {animationFailed && <span className="sticker-message__hint" role="status">动画加载失败，保留静态预览。</span>}
      </figcaption>
    </figure>
  );
}

export default StickerMessage;
