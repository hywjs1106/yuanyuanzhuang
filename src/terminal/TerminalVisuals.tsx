import React from 'react';
export function TerminalIcon({name}:{name:string}){
  const shapes:Record<string,React.ReactNode>={
    today:<><path d="M4 5h16v15H4zM4 10h16M8 3v4M16 3v4"/><path d="M8 14h3v3H8z"/></>,
    ledger:<><path d="M5 3h14v18H5zM9 7h6M9 11h6M9 15h3"/><path d="m16 16 2 2 4-4"/></>,
    assistant:<><path d="m12 2 8 5v10l-8 5-8-5V7z"/><path d="M8 10h8M8 14h5M12 2v4M12 18v4"/><circle cx="16" cy="14" r="1"/></>,
    reminders:<><path d="M5 17h14l-2-4V9a5 5 0 0 0-10 0v4zM10 20h4M12 2v2"/></>,
    more:<><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM17 14v6M14 17h6"/></>,
    weather:<><path d="M8 6V3M3 8l2 1M12 4l-1 2M4 15a4 4 0 0 1 3-7 4 4 0 0 1 6 3"/><path d="M7 19h12a3 3 0 0 0 0-6 5 5 0 0 0-9-2 4 4 0 0 0-3 8z"/></>,
    almanac:<><path d="M4 4h16v16H4zM4 9h16M8 2v4M16 2v4"/><path d="M14 12a4 4 0 1 0 2 5 4 4 0 0 1-2-5z"/></>,
    notes:<><path d="M4 3h13v18H4zM8 8h5M8 12h5M8 16h3M17 6l4 4-6 6-4 1 1-4z"/></>,
    settings:<><path d="m9 3-1 3-3 1v4l-2 1 2 1v4l3 1 1 3h6l1-3 3-1v-4l2-1-2-1V7l-3-1-1-3z"/><circle cx="12" cy="12" r="3"/></>,
    close:<path d="m6 6 12 12M18 6 6 18"/>
  };
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" focusable="false">{shapes[name]??shapes.more}</svg>;
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
