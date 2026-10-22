import {useEffect,useRef,useState} from 'react';
import type {AIConfig} from '@/utils/aiClient';
import type {SiAction,MoliaoAction} from './performance';
import {askTeaModel} from './teaModel';

export type TeaMessage={id:string;who:'si'|'you';text:string;gesture?:boolean;sticker?:string;tool?:'记账'|'提醒';action?:SiAction;summon?:MoliaoAction};
type Reply={text:string;mood:string;sticker?:string;followups:string[];tool?:'记账'|'提醒';action:SiAction;summon?:MoliaoAction};
const message=(who:TeaMessage['who'],text:string,extra:Partial<TeaMessage>={}):TeaMessage=>({id:crypto.randomUUID(),who,text,...extra});

function respond(text:string,history:TeaMessage[],gesture?:boolean,sticker?:string):Reply{
 if(/墨魉|小伙计/.test(text)){
  const summon:MoliaoAction=/扇|风|太热/.test(text)?'fan':/茶/.test(text)?'tea':/睡|盹/.test(text)?'doze':/庆祝|欢呼/.test(text)?'cheer':/作揖|鞠躬/.test(text)?'bow':'peek';
  const lines:Record<MoliaoAction,string>={peek:'喏，探头探脑的那只。你一来，它也想凑个热闹。',tea:'小伙计，茶端稳些。只是画里的茶，可别真拿手机当茶杯呀。',fan:'让小伙计摇摇扇子，添点茶馆的悠闲。真热的话，还得靠你身边的风扇。',cheer:'今天有值得庆祝的事？连小伙计都举起手啦 (≧▽≦)',doze:'瞧，已经团成一小团了。我们轻点说，别搅了这份清闲。',bow:'小伙计还挺讲礼数。好了，招呼打过，坐下慢慢聊。'};
  return {text:lines[summon],mood:'助手',action:summon==='doze'?'sleepy':summon==='cheer'?'happy':'agree',summon,followups:['让墨魉端杯茶','让墨魉扇扇风']};
 }
 if(sticker){const answers:Record<string,string>={天气:'困成这样了？那就眯一会儿。我会小点声，不闹你。',今日:'看到啦，手都挥到我眼前了。来，坐这边。',助手:'慢慢喝，茶还有呢。喝完这一口，接着说你的事。',黄历:'这么开心？那我也跟着高兴一下。说说，是碰到什么好事了？'};return {text:answers[sticker]??'这个表情倒是很传神 (￣▽￣)',mood:sticker,sticker,action:sticker==='天气'?'comfort':sticker==='助手'?'tea':'happy',followups:['你今天心情怎么样？','给我倒杯茶']}}
 if(/提醒|叫我|几点|明早/.test(text))return {text:'这件事值得记下来。这里还只是演示，我不会假装已经替你设好提醒。先去小笺里写上，免得你转头又忘了。',mood:'助手',action:'serious',followups:['陪我聊会儿'],tool:'提醒'};
 if(/记账|记一笔|流水|花了|买了|支出/.test(text))return {text:'好，这笔可别漏掉。不过这次是对话预览，账本还没动。打开小账本，就能试着记一笔。',mood:'助手',action:'serious',followups:['今天还发生了一件事…'],tool:'记账'};
 const emotionText=text.replace(/(?:并)?不(?:是)?(?:太|怎么|觉得)?(?:难过|累|焦虑|委屈|烦|伤心)/g,'');
 if(/累|难过|烦|焦虑|委屈|不(?:是)?(?:太|怎么|很)?开心|不高兴|伤心/.test(emotionText))return {text:'今天扛了不少事吧。先坐一会儿，不急着把自己收拾得精神抖擞。想说的话，我听着；不想说，就一起把这杯茶喝完。',mood:'天气',action:'comfort',followups:['最累的其实是…','陪我坐一会儿']};
 if(/茶|喝一口/.test(text))return {text:gesture?'喏，给你。小口喝，别烫着。……又不是特地给你留的，刚好还剩一杯。':'茶还有，慢慢喝。你想说的事，我也有时间听。',mood:'助手',sticker:'助手',action:'tea',followups:['陪我坐一会儿','今天有点累']};
 if(/戳|招呼/.test(text))return {text:history.filter(m=>m.gesture&&/戳/.test(m.text)).length%2?'又戳？好啦，知道你在。说吧，今天有什么新鲜事？':'嗯？我又没走神。你一过来，我就看见了。',mood:'黄历',sticker:'黄历',action:'shy',followups:['今天发生了一件有趣的事…','想听你聊点什么']};
 if(/哈哈|好笑|笑死/.test(text))return {text:'这事还真有意思，怪不得你忍不住笑。然后呢？我还想听 (≧▽≦)',mood:'黄历',action:'laugh',followups:['后面更好笑…','换个话题']};
 if(/假装生气|轻哼|傲娇/.test(text))return {text:'哼，特地来逗掌柜？好啦，逗够了就说正事，我还听着呢。',mood:'助手',action:'pout',followups:['好啦，不逗你了','给我倒杯茶']};
 if(/困了|晚安|打哈欠/.test(text))return {text:'嗯……眼皮都要打架了。今天就慢一点吧，茶馆里也安静下来了。',mood:'天气',action:'sleepy',summon:'doze',followups:['让墨魉也休息吧','陪我安静坐会儿']};
 if(/吓一跳|意想不到|居然|惊喜/.test(text))return {text:'咦，还真没想到！你快说说，后来怎么样了？',mood:'今日',action:'surprise',followups:['事情是这样的…','想听听你的想法']};
 if(/决定了|就这么办|准备好了/.test(text))return {text:'好，有自己的主意就往前试试。慢慢做，我听你说后续。',mood:'黄历',action:'agree',followups:['第一步我想…','让墨魉庆祝一下']};
 if(/只想说|安静|别说话|听我说/.test(text))return {text:'好，听你说。',mood:'助手',action:'listen',followups:['我想说的是…','先坐一会儿']};
 if(/坐一会|聊会儿|陪我/.test(text))return {text:'好，我不催你。外头忙归忙，到了这张茶桌边，至少这一会儿可以慢一点。',mood:'助手',sticker:'助手',action:'tea',followups:['你今天过得怎么样？','现在感觉好一点了']};
 if(/开心|太好了|好消息|成功了|考过了|好耶/.test(text))return {text:'好消息当然要好好听！来，慢慢讲，今天这杯茶就当替你庆祝啦 (ﾉ◕ヮ◕)ﾉ',mood:'黄历',action:'happy',followups:['事情是这样的…','给我倒杯茶']};
 if(/为什么|怎么办|怎么选|你觉得|不明白|拿不准|不知道|疑惑/.test(text))return {text:'唔……让我想想。先说说你卡在哪一步？我们一件一件捋，别急着给自己出难题。',mood:'助手',action:'thinking',followups:['我拿不准的是…','先陪我坐一会儿']};
 if(/话题|聊点什么|过得怎么样/.test(text)){
  const topics=['今天院子里落了几片叶子，那个小伙计追着扫了半天。你呢，今天有没有哪件小事，让你忍不住笑了一下？','刚才想给茶添点桂花，结果小伙计比我还积极。要是你来选，热茶旁边该摆甜点，还是一碗热乎的面？','我有时候觉得，发会儿呆也算正经事。你最近有没有一个想去、却还没抽空去的地方？'];
  return {text:topics[history.filter(m=>m.who==='si').length%topics.length],mood:'今日',action:'thinking',followups:['说起来，还真有…','换个话题']};
 }
 if(/谢谢|可爱|好看|喜欢|好一点/.test(text))return {text:'嗯，这话听着还不错。那就多坐一会儿吧，反正茶还没凉 (｡･ω･｡)',mood:'黄历',sticker:'黄历',action:'shy',followups:['再聊一会儿','给我倒杯茶']};
 if(/你好|来啦|在吗/.test(text))return {text:'在呢。给你留了个位置，坐。今天想先讲好事，还是先倒倒苦水？',mood:'今日',action:'happy',followups:['先说件好事…','今天有点累']};
 const last=history.filter(m=>m.who==='you').slice(-1)[0];
 return {text:last&&/累|烦|委屈/.test(last.text)?'原来最让你累的是这件事。那我们先不急着找答案。你最想有人听见的，是哪一部分？':'嗯，我听着呢。你刚说的这件事，对你来说最在意的是什么？慢慢讲，我不抢你的话。',mood:'助手',action:last&&/累|烦|委屈/.test(last.text)?'comfort':'thinking',followups:['我最在意的是…','想听听你的想法']};
}

/** Finite local demonstration only. Parent-owned state survives tab navigation. */
export function useTeaConversation(config?:AIConfig){
 const [messages,setMessages]=useState<TeaMessage[]>(()=>[message('si','来啦？这边坐，茶刚沏好。今天的事，慢慢说给我听吧。')]);
 const [draft,setDraft]=useState(''),[pending,setPending]=useState(false),[mood,setMood]=useState('助手');
 const [followups,setFollowups]=useState(['今天有点累','想听你聊点什么']),[status,setStatus]=useState('茶还热着，慢慢说。');
 const [error,setError]=useState('');
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const request=useRef<AbortController|null>(null);
 useEffect(()=>{cancel();return ()=>{if(timer.current!==null)clearTimeout(timer.current);request.current?.abort()}},[config]);
 function submit(text:string,options:{gesture?:boolean;sticker?:string;clearDraft?:boolean}={}){
  if(timer.current!==null||request.current||!text.trim())return false;
  setMessages(m=>[...m,message('you',text.trim(),{gesture:options.gesture,sticker:options.sticker})]);
  if(options.clearDraft)setDraft('');setPending(true);setError('');setStatus('让我想想怎么说…');
  if(config){
   const controller=new AbortController();request.current=controller;
   void askTeaModel(config,text.trim(),messages,controller.signal).then(answer=>{
    if(controller.signal.aborted||request.current!==controller)return;
    request.current=null;setMessages(m=>[...m,message('si',answer.text,{action:answer.action,summon:answer.summon})]);setMood('助手');setFollowups([]);setPending(false);setStatus('嗯，我在听。');
   }).catch(()=>{if(controller.signal.aborted||request.current!==controller)return;request.current=null;setPending(false);setStatus('这次没接上。');setError('没有收到可用的模型回复，请检查连接后重试。')});
  }else{
   const answer=respond(text.trim(),messages,options.gesture,options.sticker);
   timer.current=setTimeout(()=>{timer.current=null;setMessages(m=>[...m,message('si',answer.text,{sticker:answer.sticker,tool:answer.tool,action:answer.action,summon:answer.summon})]);setMood(answer.mood);setFollowups(answer.followups);setPending(false);setStatus('嗯，我在听。')},420+Math.min(text.length*5,220));
  }
  return true;
 }
 function cancel(){if(timer.current!==null)clearTimeout(timer.current);timer.current=null;request.current?.abort();request.current=null;setPending(false);setStatus('好，先听你说。')}
 return {messages,draft,setDraft,pending,mood,followups,status,error,submit,cancel};
}
