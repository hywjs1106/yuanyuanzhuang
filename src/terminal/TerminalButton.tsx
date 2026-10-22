import {forwardRef,type ButtonHTMLAttributes} from 'react';

/** Native hit area stays still; only the paper and label respond to a press. */
export const TerminalButton=forwardRef<HTMLButtonElement,ButtonHTMLAttributes<HTMLButtonElement>&{busy?:boolean;tone?:'primary'|'quiet'|'danger'}>(function TerminalButton({busy=false,tone,className='',children,disabled,...props},ref){
  return <button {...props} ref={ref} className={`terminal-action ${className}`} data-tone={tone} aria-busy={busy||undefined} disabled={disabled||busy}>{typeof children==='string'||typeof children==='number'?<span className="terminal-action-label">{children}</span>:children}{busy&&<svg className="terminal-action-busy" viewBox="0 0 20 20" aria-hidden="true"><path d="M15 4C5 0 0 12 8 16c7 3 12-5 8-10"/></svg>}</button>;
});
