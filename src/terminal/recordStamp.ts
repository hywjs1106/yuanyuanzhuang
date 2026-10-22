/** Stable nested JSON identity, including Date values, without filtering nested keys. */
export function recordStamp(value:unknown):string{
 const sort=(v:any):any=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;
 return JSON.stringify(sort(JSON.parse(JSON.stringify(value))));
}
