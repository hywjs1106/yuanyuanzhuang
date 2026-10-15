import React from 'react';
export function TerminalIcon({name}:{name:string}){
  const shapes:Record<string,React.ReactNode>={
    today:<><path d="M4 6H20V20H4ZM4 10H20M8 4V7M16 4V7"/><path d="M8 14H11V17H8Z"/></>,
    ledger:<g fill="currentColor" stroke="none"><path fillRule="evenodd" d="M6 3H16L21 8V21H6ZM8.5 6H14.5V9.5H18.5V18.5H8.5Z"/><path d="M3 6H4.5V21H3ZM10.5 11.5H16.5V13H10.5ZM10.5 15H15V16.5H10.5Z"/></g>,
    assistant:<><circle cx="12" cy="12" r="8.5"/><g fill="currentColor" stroke="none"><circle cx="8" cy="12" r=".9"/><circle cx="12" cy="12" r=".9"/><circle cx="16" cy="12" r=".9"/></g></>,
    reminders:<g fill="currentColor" stroke="none"><path fillRule="evenodd" d="M12 5C15 5 17 7.2 17 10V14L19 17V18H5V17L7 14V10C7 7.2 9 5 12 5ZM10 8H11.5V13.5H10Z"/><path d="M10.5 3H13.5V5H10.5ZM10 19.5H14V21H10Z"/></g>,
    more:<><path d="M4 4H10V10H4ZM14 4H20V10H14ZM4 14H10V20H4ZM17 14V20M14 17H20"/></>,
    weather:<g fill="currentColor" stroke="none"><path fillRule="evenodd" d="M16 3H19L21 5V7L19 9H16L14 7V5ZM16.5 5H18.5L19 5.5V6.5L18.5 7H16.5L16 6.5V5.5Z"/><path fillRule="evenodd" d="M6 21H18L21 18V17C21 15.3 19.7 14 18 14H16.7C16.1 11.5 14.2 10 12 10C9.2 10 7 12.2 7 15H6C4.4 15 3 16.4 3 18ZM9 15C9 12.8 10.3 12 12 12V13.5C11.1 13.5 10.5 14 10.5 15Z"/></g>,
    almanac:<g fill="currentColor" stroke="none">{['111','110','101','100','011','010','001','000'].map((pattern,i)=><g key={pattern} transform={`rotate(${i*45} 12 12)`}>{[...pattern].map((solid,j)=>{const y=[3.6,5.2,6.8][j];return <path key={j} d={solid==='1'?`M9.6 ${y}H14.4V${y+.9}H9.6Z`:`M9.6 ${y}H11.1V${y+.9}H9.6ZM12.9 ${y}H14.4V${y+.9}H12.9Z`}/>;})}</g>)}<path fillRule="evenodd" d="M12 8.7C13.82 8.7 15.3 10.18 15.3 12C15.3 13.82 13.82 15.3 12 15.3C10.18 15.3 8.7 13.82 8.7 12C8.7 10.18 10.18 8.7 12 8.7ZM12 9.5C10.62 9.5 9.5 10.62 9.5 12C9.5 13.38 10.62 14.5 12 14.5C13.38 14.5 13.38 12 12 12C10.62 12 10.62 9.5 12 9.5ZM12 10.2C12.3 10.2 12.55 10.45 12.55 10.75C12.55 11.05 12.3 11.3 12 11.3C11.7 11.3 11.45 11.05 11.45 10.75C11.45 10.45 11.7 10.2 12 10.2Z"/><circle cx="12" cy="13.25" r=".55"/></g>,
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
