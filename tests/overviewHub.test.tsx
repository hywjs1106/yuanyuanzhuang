import React, {isValidElement, type ReactElement, type ReactNode} from 'react';
import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {OverviewPanel} from '../src/terminal/OverviewPanel';
import type {TerminalPage} from '../src/terminal/BottomNavigation';

const props = {date:'2026-10-14', reminderCount:7, expense:1234.5, balance:8765.43, budget:1000, almanacSummary:'农历九月初五 · 宜出行', onNavigate:(_page:TerminalPage)=>{}};
function buttons(node:ReactNode):ReactElement[] {
  if(Array.isArray(node)) return node.flatMap(buttons);
  if(!isValidElement(node)) return [];
  const element=node as ReactElement<{children?:ReactNode}>;
  return [...(element.type==='button'?[element]:[]), ...buttons(element.props.children)];
}

test('overview renders supplied date, active reminder count and monthly finance without invented status',()=>{
 const html=renderToStaticMarkup(<OverviewPanel {...props}/>);
 assert.match(html, /今日总览/);
 assert.match(html, /dateTime="2026-10-14"/);
 assert.match(html, /7\s*(?:<!-- -->)?\s*项待提醒/);
 assert.match(html, /1,234\.50/);
 assert.match(html, /预算超支/);
 assert.match(html, /234\.50/);
 assert.doesNotMatch(html, /同步完成|定位成功|已连接|坐标|雷达|ORIGIN|THE HUB/);
});

test('all four hub plates navigate to their actual destination with distinct accessible names',()=>{
 const destinations:TerminalPage[]=[];
 const tree=OverviewPanel({...props,onNavigate:page=>destinations.push(page)});
 for(const label of ['打开记账','打开提醒','打开天气','打开黄历','查看今日黄历','与庄方宜对话']) {
   const button=buttons(tree).find(node=>node.props['aria-label']===label);
   assert.ok(button, `Missing accessible control: ${label}`);
   button.props.onClick();
 }
 assert.deepEqual(destinations,['ledger','reminders','weather','almanac','almanac','assistant']);
});

test('no-budget overview uses actual balance and preserves large amounts and zero reminders',()=>{
 const html=renderToStaticMarkup(<OverviewPanel {...props} budget={0} expense={12345678.9} balance={-98.76} reminderCount={0}/>);
 assert.match(html,/记录余额/);
 assert.match(html,/-98\.76/);
 assert.match(html,/12,345,678\.90/);
 assert.match(html,/0\s*(?:<!-- -->)?\s*项待提醒/);
 assert.doesNotMatch(html,/预算超支|预算剩余/);
 assert.match(html,/src="\/characters\/fangyi-avatar.png"/);
 assert.match(html,/农历九月初五/);
});
