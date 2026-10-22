/** One back gesture dismisses one layer, in opening order. */
export function createBackLayers(){
 const layers=new Map<symbol,()=>void>();
 return {
  add(close:()=>void){const id=Symbol();layers.set(id,close);return()=>{layers.delete(id);};},
  dismiss(){const open=[...layers.values()];const close=open[open.length-1];if(!close)return false;close();return true;},
  size(){return layers.size;},
 };
}
