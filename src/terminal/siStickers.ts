import type {StickerDefinition} from './stickerCatalog';

/** Locally generated interpretations of the current Si avatar, not official stickers. */
export const SI_LEGACY_STICKERS:readonly StickerDefinition[]=Object.freeze([
  ['smile','开心抱笔',['开心','高兴','好消息','庆祝']],
  ['proud','得意眨眼',['得意','夸奖','画艺','好看']],
  ['thinking','歪头思考',['思考','好奇','琢磨','不懂']],
  ['surprised','惊讶圆眼',['惊讶','意外','没想到']],
  ['comfort','安静陪伴',['陪伴','倾听','安慰']],
  ['sleepy','困困晚安',['晚安','困倦','睡觉']],
].map(([mood,label,tags],index)=>{
  const poster=mood==='smile'?'/themes/si/chibi-avatar.webp':`/themes/si/stickers/${mood}.png`;
  return Object.freeze({id:`si-${mood}`,character:'si' as const,animated:false,part:1,index:index+1,label:label as string,tags:Object.freeze(tags as string[]),localAsset:poster,poster,remoteUrl:'',source:'/themes/si/SOURCES.txt',author:'祀角色风格改绘'});
}));

/** Official pack 10. Legacy IDs remain resolvable for saved conversations only. */
export const SI_STICKER_CATALOG:readonly StickerDefinition[]=Object.freeze(([
 ['wink','眨眼',['招呼','开心','微笑']],
 ['proud','得意',['得意','夸奖','画艺']],
 ['shh','嘘',['保密','悄悄','秘密']],
 ['sigh','叹气',['无奈','叹气']],
 ['disapprove','不满意',['吐槽','不满']],
 ['nod','点头',['理解','赞同','谢谢']],
 ['shocked','震惊',['意外','惊讶']],
 ['painting','挥笔',['画画','创作','灵感']],
] as const).map(([mood,label,tags],index)=>{
 const poster=`/themes/si/official/${String(index+1).padStart(2,'0')}.png`;
 return Object.freeze({id:`si-official-${mood}`,character:'si' as const,animated:false,part:10,index:index+1,label,tags,localAsset:poster,poster,remoteUrl:'',source:'https://www.taptap.cn/moment/857006468283501226',author:'HYPERGRYPH / GRYPHLINE'});
}));

/** Presets never celebrate negated emotions, distress or operational requests. */
export function chooseSiOfflineSticker(text:string):string|undefined {
 if(/不|没|别|勿|停止|难过|焦虑|压力|伤心|痛苦|失眠|崩溃|记账|提醒|备忘|保存|记录/.test(text))return undefined;
 if(/开心|高兴|好耶|太棒|成功了|考过了|happy|yay/i.test(text))return 'si-official-wink';
 if(/(?:画|画技|画艺).*(?:真好|厉害|好看|漂亮)|(?:真|好)厉害/.test(text))return 'si-official-proud';
 if(/谢谢|感谢|多谢/.test(text))return 'si-official-nod';
 return undefined;
}
