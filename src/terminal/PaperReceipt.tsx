/** Only mounted after persistence succeeds; its text remains after the gesture ends. */
export function PaperReceipt({kind}:{kind:'ledger'|'reminder'}){
 return <div className={`paper-save-feedback paper-receipt paper-receipt-${kind}`} role="status">
  <span className="paper-receipt-seal" aria-hidden="true">{kind==='ledger'?'记':'收'}</span>
  <span className="paper-receipt-copy">{kind==='ledger'?'已记入账簿':'提醒已收好'}<svg className="paper-receipt-stroke" viewBox="0 0 180 14" fill="none" aria-hidden="true"><path d="M4 10Q49 4 91 8T175 5" pathLength="1"/></svg></span>
 </div>;
}
