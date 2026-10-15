import React, {isValidElement, type ReactElement, type ReactNode} from 'react';
import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {OverviewPanel} from '../src/terminal/OverviewPanel';
import type {TerminalPage} from '../src/terminal/BottomNavigation';
const props={date:'2026-10-15',onNavigate:(_page:TerminalPage)=>{}};
function buttons(node:ReactNode):ReactElement[] {
 if(Array.isArray(node))return node.flatMap(buttons);
 if(!isValidElement(node))return [];
 const element=node as ReactElement<{children?:ReactNode}>;
 return [...(element.type==='button'?[element]:[]),...buttons(element.props.children)];
}

test('minimal home presents only four tool controls and does not mount secondary summaries',()=>{
 const tree=OverviewPanel(props);assert.equal(buttons(tree).length,4);
 const html=renderToStaticMarkup(tree);
 assert.doesNotMatch(html,/接下来|项待提醒|本月支出|预算|与庄方宜对话|打开备忘/);
 assert.match(html,/alt="帝江号飞船"/);
});

test('all four tools navigate to their real destination with distinct accessible names',()=>{
 const destinations:TerminalPage[]=[];const tree=OverviewPanel({...props,onNavigate:page=>destinations.push(page)});
 for(const label of ['打开记账','打开提醒','打开天气','打开黄历']){
  const button=buttons(tree).find(node=>node.props['aria-label']===label);assert.ok(button);button.props.onClick();
 }
 assert.deepEqual(destinations,['ledger','reminders','weather','almanac']);
});

test('date and clock stay in the header, separate from the ship and tool targets',()=>{
 const html=renderToStaticMarkup(<OverviewPanel {...props}/>);
 assert.match(html,/<header class="hub-heading">[\s\S]*?<time class="overview-date" dateTime="2026-10-15">[\s\S]*?<\/header>/);
 const orbit=html.split('<div class="hub-orbit">')[1]?.split('<div class="hub-modules">')[0];assert.ok(orbit);
 assert.doesNotMatch(orbit,/<button|<time|class="hub-clock"/);assert.match(orbit,/alt="帝江号飞船"/);
});
