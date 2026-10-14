import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localAssistantReply } from '../src/terminal/assistant';
import * as commands from '../src/terminal/assistantCommands';
const now = new Date(2026, 9, 14, 15, 20);
test('explicit ledger command preserves actual amount and yesterday date', () => {
  const text = '帮我记一下，昨天午饭花了28.50元';
  const action = localAssistantReply(text, now).actions[0];
  assert.deepEqual(action, {kind:'ledger',direction:'expense',amount:28.5,date:'2026-10-13',note:text,type:'food'});
  assert.equal(commands.shouldAutoExecute(text, action, now), true);
  assert.equal(commands.shouldAutoExecute(text, {...action, amount:29} as typeof action, now), false);
});
test('clear Chinese reminder times and delays cross midnight accurately', () => {
  for (const [text, at, repeat] of [
    ['明天上午九点提醒我交电费','2026-10-15T09:00','none'],
    ['今天晚上八点半提醒我读书','2026-10-14T20:30','none'],
    ['后天14:05提醒我开会','2026-10-16T14:05','none'],
    ['明天09:00提醒我开会','2026-10-15T09:00','none'],
    ['提醒我明天下午三点交电费','2026-10-15T15:00','none'],
    ['每天晚上九点提醒我喝水','2026-10-14T21:00','daily'],
    ['每周一上午九点提醒我开会','2026-10-19T09:00','weekly'],
    ['10小时后提醒我交电费','2026-10-15T01:20','none'],
  ]) {
    const action = localAssistantReply(text,now).actions[0];
    assert.deepEqual(action, {kind:'reminder',title:text.includes('交电费')?'交电费':text.includes('读书')?'读书':text.includes('喝水')?'喝水':'开会',at,repeat});
    assert.equal(commands.shouldAutoExecute(text,action,now),true);
  }
});
test('vague, negated, quoted, hypothetical and invalid commands stay unscheduled', () => {
  for (const text of ['明天9点提醒我交费','明天提醒我交费','不要明天上午九点提醒我交费','如果明天上午九点提醒我交费会怎样','他说“明天上午九点提醒我交费”','明天上午九点提醒我','今天上午九点提醒我交费','明天25:00提醒我交费','天气提醒我带伞','明天上午九点提醒我交费，晚上八点提醒我开会']) {
    assert.deepEqual(localAssistantReply(text,now).actions,[],text);
    assert.equal(commands.shouldAutoExecute(text,{kind:'reminder',title:'交费',at:'2026-10-15T09:00',repeat:'none'},now),false,text);
  }
});
test('missing transaction subject and non-money quantities cannot become a ledger action', () => {
  for(const text of ['帮我记一笔28元','帮我记一下读书花了28分钟','帮我记一下花了28页书','帮我记一下去年午饭花了28元','帮我记一下昨天2026-10-14午饭花了28元']) assert.deepEqual(localAssistantReply(text,now).actions,[],text);
});
test('casual money is confirmation only, multiple or foreign money cannot autosave', () => {
  const proposal = {kind:'ledger' as const,direction:'expense' as const,amount:28,date:'2026-10-14',note:'午饭花了28元',type:'food'};
  assert.equal(commands.shouldAutoExecute('午饭花了28元',proposal,now),false);
  for(const text of ['不要帮我记一下午饭花了28元','假如帮我记一下午饭花了28元','帮我记一下午饭花了28元，咖啡花了10元','帮我记一下午饭花了28美元','帮我记一下午饭花了28.555元']) assert.equal(commands.shouldAutoExecute(text,proposal,now),false,text);
});

test('uncertain, negated and unsupported temporal commands never autoexecute',()=>{
 const now=new Date('2026-10-14T12:00:00');
 for(const text of ['不必帮我记一下午饭花了28元','帮我记一下上星期一午饭花了28元','帮我记一下午饭大概花了28元','帮我记一下昨晚晚饭花了28元']) assert.equal(commands.parseLocalLedger(text,now),undefined,text);
 assert.equal(commands.parseLocalReminder('明天上午九点提醒我交费，每天晚上',now),undefined);
});
