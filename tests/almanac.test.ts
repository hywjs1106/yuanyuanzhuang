import test from 'node:test';
import assert from 'node:assert/strict';
import { getAlmanac, getAlmanacSummary, shiftAlmanacDate } from '../src/terminal/almanac.ts';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AlmanacPanel } from '../src/terminal/AlmanacPanel.tsx';

test('known Chinese New Year has lunar date and festival offline', () => {
  const day = getAlmanac('2026-02-17');
  assert.equal(day.lunarDate, '正月初一');
  assert.ok(day.festivals.includes('春节'));
  assert.equal(day.zodiac, '马');
  assert.match(day.ganzhi.year, /丙午/);
  assert.ok(day.yi.length > 0 && day.ji.length > 0);
  assert.match(day.source, /lunar-javascript/);
});
test('known solar term and leap month are preserved', () => {
  assert.equal(getAlmanac('2026-04-05').solarTerm, '清明');
  assert.match(getAlmanac('2025-07-25').lunarDate, /闰六月初一/);
});
test('rejects normalized and malformed civil dates', () => {
  for (const key of ['2026-02-30', '2025-02-29', 'garbage', '2026-1-1', '1899-12-31']) {
    assert.throws(() => getAlmanac(key), /日期/);
  }
});
test('date navigation and compact summary retain important information', () => {
  assert.equal(shiftAlmanacDate('2024-02-28', 1), '2024-02-29');
  assert.equal(shiftAlmanacDate('2026-01-01', -1), '2025-12-31');
  assert.match(getAlmanacSummary('2026-02-17'), /正月初一.*春节/);
});
test('almanac page renders navigation and complete traditional details offline', () => {
  const html = renderToStaticMarkup(React.createElement(AlmanacPanel));
  for (const text of ['上一天','下一天','回到今天','宜','忌','干支','冲煞','彭祖百忌','lunar-javascript']) assert.ok(html.includes(text), text);
});
