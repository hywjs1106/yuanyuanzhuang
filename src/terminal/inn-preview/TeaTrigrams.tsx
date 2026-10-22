/** Eight trigrams around a small taiji, in the shared icon viewBox. */
export function TeaTrigrams(){
 const trigrams=['111','110','101','100','000','001','010','011'];
 return <g strokeWidth="1.25"><circle cx="16" cy="16" r="6.2"/><path d="M16 9.8c-6.2 3.1 6.2 9.3 0 12.4"/><circle cx="15" cy="13" r=".75" fill="currentColor" stroke="none"/><circle cx="17" cy="19" r=".75" fill="currentColor" stroke="none"/>{trigrams.map((bits,i)=><g key={bits} transform={`rotate(${i*45} 16 16)`}>{[...bits].map((solid,row)=><path key={row} d={solid==='1'?`M13 ${2+row*2.6}h6`:`M13 ${2+row*2.6}h2m2 0h2`}/>)}</g>)}</g>
}
