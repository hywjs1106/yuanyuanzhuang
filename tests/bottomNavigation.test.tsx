import {test} from 'node:test';
import React from 'react';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {BottomNavigation} from '../src/terminal/BottomNavigation';
import {TerminalInstrument} from '../src/terminal/TerminalVisuals';

test('three primary destinations group daily tools under Today and directly expose Settings',()=>{
  const html=renderToStaticMarkup(<BottomNavigation currentPage="weather" onNavigate={()=>{}}/>);
  const nav=html.slice(html.indexOf('<nav'),html.indexOf('</nav>'));
  assert.equal((nav.match(/<button/g)||[]).length,3);
  assert.match(nav,/aria-label="助手"/);
  assert.match(nav,/aria-label="今日"[^>]*aria-current="location"/);
  assert.match(nav,/aria-label="设置"/);
  assert.doesNotMatch(nav,/aria-label="天气"/);
  assert.doesNotMatch(html,/更多功能/);
});

test('budget instrument preserves overspend in visible and accessible value',()=>{
  const html=renderToStaticMarkup(<TerminalInstrument expense={125} budget={100} reminderCount={0}/>);
  assert.match(html,/本月预算已使用 125%/);
  assert.match(html,/<b>125<small>%/);
});
