import { useMemo, useState } from 'react';
import { STICKER_CATALOG } from './stickerCatalog';

export interface StickerPickerProps {
  onSelect: (id: string) => void;
}

const PAGE_SIZE = 24;

export function StickerPicker({ onSelect }: StickerPickerProps) {
  const [part, setPart] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const matches = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return STICKER_CATALOG.filter(sticker => (part === 'all' || sticker.part === Number(part))
      && (!query || [sticker.id, sticker.label, ...sticker.tags].join(' ').toLocaleLowerCase().includes(query)));
  }, [part, search]);
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = matches.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  return (
    <section className="sticker-picker" aria-label="方宜表情库">
      <div className="sticker-picker__heading"><strong>方宜表情</strong><span>共 {STICKER_CATALOG.length} 张</span></div>
      <div className="sticker-picker__filters">
        <select aria-label="表情分组" value={part} onChange={event => { setPart(event.target.value); setPage(0); }}>
          <option value="all">全部 · {STICKER_CATALOG.length} 张</option>
          {Array.from({ length: 11 }, (_, index) => index + 1).map(group => <option key={group} value={group}>
            第 {group} 组 · {STICKER_CATALOG.filter(sticker => sticker.part === group).length} 张
          </option>)}
        </select>
        <input type="search" aria-label="表情搜索" placeholder="搜索情绪或动作" value={search}
          onChange={event => { setSearch(event.target.value); setPage(0); }} />
      </div>
      <div className="sticker-picker__grid">
        {visible.map(sticker => <button key={sticker.id} type="button" className="sticker-picker__item"
          aria-label={`选择表情：${sticker.label}`} title={`${sticker.label} · ${sticker.id}`}
          onClick={() => onSelect(sticker.id)}>
          <img src={sticker.poster} alt={`方宜表情：${sticker.label}`} width={72} height={72}
            loading="lazy" decoding="async" onError={event => { event.currentTarget.style.visibility = 'hidden'; }} />
          <span>{sticker.label}</span>
        </button>)}
        {!visible.length && <p className="sticker-picker__empty">没有找到这类表情，换个词试试。</p>}
      </div>
      <div className="sticker-picker__pages">
        <button type="button" aria-label="上一页表情" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>上一页</button>
        <span aria-live="polite">{matches.length} 张 · {currentPage + 1} / {pageCount}</span>
        <button type="button" aria-label="下一页表情" disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)}>下一页</button>
      </div>
      <small className="sticker-picker__credit">表情作者：夏雪NazuYuki</small>
    </section>
  );
}

export default StickerPicker;
