import React from 'react';
export function TerminalIcon({name}:{name:string}){
  const shapes:Record<string,React.ReactNode>={
    today:<><path d="M4 6H20V20H4ZM4 10H20M8 4V7M16 4V7"/><path d="M8 14H11V17H8Z"/></>,
    ledger:<><path d="M5 4H16L19 7V20H5ZM16 4V7H19M8 4V20"/><path d="M11 10H16M11 13H16M11 16H14"/></>,
    assistant:<><path d="M7 4H17L20 7V17H14L10 20V17H4V7ZM8 9H16M8 13H13"/><path d="M16 13H16.1"/></>,
    reminders:<><path d="M5 17H19L17 14V10C17 7 15 5 12 5C9 5 7 7 7 10V14ZM10 20H14M12 3V5"/><path d="M4 8V11M20 8V11"/></>,
    more:<><path d="M4 4H10V10H4ZM14 4H20V10H14ZM4 14H10V20H4ZM17 14V20M14 17H20"/></>,
    weather:<><path d="M8 3V4M3 8H4M4 4L5 5M12 4L11 5M5 11C4 8 6 6 8 6C10 6 12 8 11 10"/><path d="M7 20H17C19 20 21 18 21 16C21 14 19 13 17 13C16 10 12 10 10 12C9 13 9 14 9 15C6 14 4 15 4 17C4 19 5 20 7 20Z"/></>,
    almanac:<><path d="M4 6H20V20H4ZM4 10H20M8 4V7M16 4V7"/><path d="M14 13C10 12 9 18 13 18C15 18 16 17 16 16C14 16 13 15 14 13Z"/></>,
    notes:<><path d="M4 4H15V8M4 4V20H15M8 8H11M8 12H10"/><path d="M11 17L12 13L18 7L21 10L15 16ZM16 9L19 12"/></>,
    settings:<><path d="M10 4H14L15 7L18 6L20 10L18 12L20 14L18 18L15 17L14 20H10L9 17L6 18L4 14L6 12L4 10L6 6L9 7Z"/><circle cx="12" cy="12" r="3"/></>,
    close:<path d="M6 6L18 18M18 6L6 18"/>
  };
  return <svg className="terminal-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{shapes[name]??shapes.more}</svg>;
}

export function TerminalStatusStrip({date,reminderCount,aiConfigured}:{date:string;reminderCount:number;aiConfigured:boolean}){
  return <div className="terminal-status-strip"><span className="status-local"><i aria-hidden="true"/>本地数据</span><time dateTime={date}>{date.replace(/-/g,' / ')}</time><span className="status-communication">{aiConfigured?'AI 已配置':'离线助手'}</span><span className="status-reminders">{reminderCount} 项待提醒</span></div>;
}

export function TerminalInstrument({expense,budget,reminderCount}:{expense:number;budget:number;reminderCount:number}){
  const percent=budget>0?Math.max(0,Math.round(expense/budget*100)):0;
  const ratio=Math.min(1,percent/100);
  return <div className="terminal-instrument" aria-label={budget>0?`本月预算已使用 ${percent}%`:`待提醒 ${reminderCount} 项`}>
    <svg viewBox="0 0 160 160" aria-hidden="true"><defs><pattern id="instrument-hatch" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 5 5 0" className="instrument-hatch"/></pattern></defs><circle cx="80" cy="80" r="72" className="instrument-rule"/><circle cx="80" cy="80" r="65" className="instrument-segments"/><circle cx="80" cy="80" r="53" className="instrument-rule"/>
      <path d="M36 91 44 46 70 38 86 51 116 48 127 78 112 111 84 121 63 108 41 113Z" className="instrument-contour"/><path d="m48 89 4-35 19-7 15 17 21-5 10 20-13 23-20 9-21-15Z" className="instrument-terrain"/>
      <circle cx="80" cy="80" r="65" className="instrument-budget" strokeDasharray={`${ratio*408.4} 408.4`} transform="rotate(-90 80 80)"/><path d="M80 10v13M80 137v13M10 80h13M137 80h13M29 29l9 9M122 122l9 9M29 131l9-9M122 38l9-9" className="instrument-ticks"/><path d="m80 65 8 26-8-5-8 5Z" className="instrument-marker"/>
    </svg><span className="instrument-caption">{budget>0?<><b>{percent}<small>%</small></b><span>预算已用</span></>:<><b>{reminderCount}<small>项</small></b><span>待提醒</span></>}</span>
  </div>;
}
