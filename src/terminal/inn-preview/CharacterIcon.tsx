const poses:Record<string,number>={记账:0,提醒:1,天气:2,黄历:3,今日:4,助手:5,设置:6,日光:4,夜色:7};

/** A static character sheet: eight isolated poses, with function labels outside. */
export function CharacterIcon({name}:{name:string}){
 const index=poses[name]??6;
 if(index===6)return <span className="character-icon character-icon--keeper" data-pose={index} aria-hidden="true"/>;
 return <span className="character-icon" data-pose={index} aria-hidden="true" style={{backgroundPosition:`${(index%4)*100/3}% ${Math.floor(index/4)*100}%`}}/>;
}
