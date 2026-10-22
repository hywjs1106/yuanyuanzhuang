import {usePageValue} from './pageViewState';
import {useEffect,useRef,type ReactNode} from 'react';
import {useDisclosureMotion} from './panelMotion';
/** Native disclosure retains form drafts; the logical close immediately removes interactive content. */
export function SettingsGroup({id,title,status,initialOpen=false,onOpenChange,children}:{id:string;title:string;status?:string;initialOpen?:boolean;onOpenChange?:(open:boolean)=>void;children:ReactNode}){
 const [open,setOpen]=usePageValue(`settings.group.${id}`,initialOpen);const host=useRef<HTMLDetailsElement>(null);const present=useDisclosureMotion(open,host,true);
 useEffect(()=>{onOpenChange?.(open);},[]);
 return <details ref={host} className="settings-group" data-settings-group={id} open={present}><summary aria-expanded={open} onClick={event=>{event.preventDefault();const next=!open;if(!next&&host.current?.querySelector('.settings-group-content')?.contains(document.activeElement))event.currentTarget.focus({preventScroll:true});setOpen(next);onOpenChange?.(next);}}><span className="settings-group-title">{title}</span>{status&&<small>{status}</small>}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7 5 6 5-6"/></svg></summary><div ref={node=>{if(node)node.inert=!open;}} data-motion-content className="settings-group-content" aria-hidden={!open||undefined}>{children}</div></details>;
}
