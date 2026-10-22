import {siPersonaPrompt} from './siPersonaPrompt';
/** Original adaptation from the official operator roster and 洒扫庭除 / 丹青渡 videos:
 * https://endfield.hypergryph.com/operator · https://endfield.hypergryph.com/video
 * Supplementary game transcript: https://warfarin.wiki/cn/operators/si
 */
export const siPersona = {
  name: '祀',
  badge: '角色风格',
  greeting: '管理员，来了？今天有什么新鲜事，说来听听。我的眼光可不只用来看画。',
  prompt: siPersonaPrompt,
} as const;

export function siOfflineConversation(text: string): string {
  const limited = '（离线预设回复）';
  if (/天气|气温|下雨|黄历|宜忌/.test(text)) return `这个我可不能凭想象画出来。现在没有实时资料，天气和黄历要看终端相应页面。${limited}`;
  if (/你是谁|介绍.*自己|你叫|祀|小葱/.test(text)) return `我是终端里以祀的风格与你交流的 AI 助手。缘缘庄掌柜的眼光可以借来聊聊，真本事可不能冒领；现在只能作有限回应和识别明确的记录请求。${limited}`;
  if (/(?:不|没).{0,6}(?:开心|高兴)|开心不起来|累|烦|难过|焦虑|压力|伤心|痛苦/.test(text)) return `这一天看来没少跟你作对。你想说就说，我听着；暂时不想理它也行。${limited}`;
  if (/(?:不|别|勿|停止).*(?:表情|颜文字|贴图|晚安图|开心图)/.test(text)) return `好，先认真说事。现在是离线模式，能聊的内容仍然有限。${limited}`;
  if (/开心|高兴|好耶|太棒|成功了|考过了/.test(text)) return `这可是值得高兴的事。哪一刻让你最有成就感？讲来听听。${limited}`;
  if (/(?:画|画技|画艺).*(?:真好|厉害|好看|漂亮)|(?:真|好)厉害/.test(text)) return `这眼光不错。夸到我拿手的地方了，这句我收下。${limited}`;
  if (/画|丹青|艺术|配色/.test(text)) return `聊这个，我可有兴致。你是在琢磨颜色，还是画里最想留下的那一点意思？(・ω・)？现在离线，还没法细看作品。${limited}`;
  if (/衣服|穿搭|时装|裙/.test(text)) return `穿得有意思一点，我赞成。不过还得看你准备去哪里，可不能只凭一句话替你挑。${limited}`;
  if (/技术|科技|机器|手机/.test(text)) return `这东西有什么新花样？我倒想弄明白。(・ω・)？只是现在离线，只能接几句，细节还得等接入 AI 再谈。${limited}`;
  if (/谢谢|多谢/.test(text)) return `这就谢上了？那我收下。能帮上这一点，也不错。(´▽｀)${limited}`;
  if (/晚安|睡觉/.test(text)) return `去睡吧，管理员。明天有什么新鲜事，再来讲给我听。${limited}`;
  if (/你好|早上好|晚上好|早安|在吗|嗨/.test(text)) return `${siPersona.greeting}${limited}`;
  return `这话我接到了。不过现在离线，预设的几句话还不足以聊明白；接入 AI 后，我们再把它展开。${limited}`;
}

