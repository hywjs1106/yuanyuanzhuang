import React from 'react';
import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {WeatherPanel} from '../src/terminal/WeatherPanel';
test('overview weather opens the dedicated page without duplicating city configuration',()=>{
 const html=renderToStaticMarkup(<WeatherPanel config={{provider:'openmeteo'}} onConfigChange={async()=>{}} compact onOpen={()=>{}}/>);
 assert.match(html,/选择城市/);assert.match(html,/查看天气/);assert.doesNotMatch(html,/搜索城市|保存天气设置|API Host/);
});
