import {CharacterIcon} from './CharacterIcon';

/** The same isolated character poses as the navigation; no extra decoder. */
export function TeaBuddy({kind='tea'}:{kind?:'tea'|'fan'}){
 return <span className="tea-buddy" data-kind={kind} aria-hidden="true"><CharacterIcon name={kind==='fan'?'提醒':'记账'}/></span>
}
export function TeaFace(){
 return <span className="tea-face" role="img" aria-label="祀"><CharacterIcon name="助手"/></span>
}
