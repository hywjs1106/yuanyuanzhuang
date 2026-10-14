import React from 'react';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { STICKER_CATALOG, getSticker, isKnownStickerId, stickerPromptCandidates, chooseOfflineSticker } from '../src/terminal/stickerCatalog';
import { StickerMessage } from '../src/terminal/StickerMessage';
import { StickerPicker } from '../src/terminal/StickerPicker';

test('all 178 sourced stickers are unique and locally available by whitelist', () => {
  assert.equal(STICKER_CATALOG.length, 178);
  assert.equal(new Set(STICKER_CATALOG.map(s => s.id)).size, 178);
  assert.equal(new Set(STICKER_CATALOG.map(s => s.part)).size, 11);
  for (const s of STICKER_CATALOG) {
    assert.equal(getSticker(s.id), s);
    assert.ok(s.localAsset.endsWith(`${s.id}.webp`));
    assert.ok(s.poster.endsWith(`${s.id}.jpg`));
    assert.match(s.remoteUrl, /^https:\/\/i0\.hdslb\.com\/bfs\/new_dyn\/[a-f0-9]+\.gif$/);
    assert.equal(s.author, '夏雪NazuYuki');
    assert.ok(s.tags.length);
  }
  assert.equal(getSticker('../../evil'), undefined);
  assert.equal(isKnownStickerId('https://evil.example/x.gif'), false);
});

test('prompt candidates stay bounded and contextual; offline chat is selective', () => {
  for (const text of ['', '谢谢你', '晚安好困', '今天超开心', '普通记账问题', '喝茶']) {
    const lines = stickerPromptCandidates(text).split('\n').filter(Boolean);
    assert.ok(lines.length > 0 && lines.length <= 12);
    assert.ok(lines.every(line => isKnownStickerId(line.split(' ')[0])));
    assert.ok(stickerPromptCandidates(text).length < 800);
  }
  assert.equal(chooseOfflineSticker('午饭花了28元'), undefined);
  assert.ok(isKnownStickerId(chooseOfflineSticker('谢谢')!));
  assert.equal(chooseOfflineSticker('晚安'), 'fy-01-04');
});

test('history and server rendering load only one static poster', () => {
  const html = renderToStaticMarkup(<StickerMessage stickerId="fy-01-04" />);
  assert.match(html, /fy-01-04\.jpg/);
  assert.doesNotMatch(html, /\.webp|\.gif/);
  assert.match(html, /播放表情：/);
  assert.equal(renderToStaticMarkup(<StickerMessage stickerId="made-up" />), '');
  const autoHtml = renderToStaticMarkup(<StickerMessage stickerId="fy-01-04" autoPlay />);
  assert.doesNotMatch(autoHtml, /\.webp|\.gif/);
});

test('picker advertises all entries but mounts at most 24 lazy posters', () => {
  const html = renderToStaticMarkup(<StickerPicker onSelect={() => {}} />);
  assert.match(html, /178/);
  assert.match(html, /表情分组/);
  assert.match(html, /表情搜索/);
  assert.equal((html.match(/<img /g) || []).length, 24);
  assert.equal((html.match(/loading="lazy"/g) || []).length, 24);
  assert.doesNotMatch(html, /\.webp|\.gif/);
});
