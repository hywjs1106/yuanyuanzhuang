import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TerminalIcon} from '../src/terminal/TerminalVisuals';

const icons = ['today','ledger','assistant','reminders','more','weather','almanac','notes','settings','close'];

test('every terminal glyph leaves three units of clearance within its 24 unit frame', () => {
  for (const name of icons) {
    const html = renderToStaticMarkup(<TerminalIcon name={name}/>);
    assert.match(html, /viewBox="0 0 24 24"/);
    assert.match(html, /stroke-width="1.6"/);
    assert.match(html, /stroke-linecap="round" stroke-linejoin="round"/);
    assert.match(html, /aria-hidden="true" focusable="false"/);
    for (const path of html.matchAll(/ d="([^"]+)"/g)) {
      // Absolute line/cubic coordinates bound the complete glyph, including
      // cubic curves because their control points bound their convex hull.
      const tokens = path[1].match(/[A-Za-z]|\d+(?:\.\d+)?/g) ?? [];
      for (const token of tokens) {
        if (/^[A-Za-z]$/.test(token)) {
          assert.match(token, /^[MLHVCZ]$/, `${name}: use auditable absolute geometry`);
        } else {
          const coordinate = Number(token);
          assert.ok(coordinate >= 3 && coordinate <= 21, `${name}: ${coordinate} leaves the padded frame`);
        }
      }
    }
    for (const circle of html.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)) {
      const [,cx,cy,r] = circle.map(Number);
      assert.ok(cx-r >= 3 && cx+r <= 21 && cy-r >= 3 && cy+r <= 21, `${name}: circle leaves the padded frame`);
    }
  }
});
