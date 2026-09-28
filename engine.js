// Thin public adapter. It never sends private input to a server or calls a real model.
import {CURATED} from './narratives.js';
import {WRITING} from './v2-writing.js';

export const MODES = Object.freeze(['mock','baseline','iu-enhanced']);
export const DISCLAIMER = '假设情景，不是真实历史或未来预测。';
export const MODEL_STATUS = 'NOT_IMPLEMENTED_CONFIG_LOCK_REQUIRED';
const trim = value => String(value ?? '').trim();
const short = (text, n=95) => text.length > n ? `${text.slice(0,n-1)}…` : text;
const crisis = /自杀|轻生|结束生命|伤害自己|自残|不想活|想死/;

export function validateInput(raw) {
  const data = {
    background:trim(raw?.background), decision:trim(raw?.decision), alternative:trim(raw?.alternative),
    known_then:trim(raw?.known_then), learned_later:trim(raw?.learned_later),
    horizon_months:Number(raw?.horizon_months), theme:trim(raw?.theme), demo_id:trim(raw?.demo_id ?? raw?.id),
  };
  if (data.background.length<10 || data.background.length>400) return {ok:false,error:'请用 10–400 字写下当时的生活背景。'};
  if (data.decision.length<4 || data.decision.length>220) return {ok:false,error:'请写下现实中的选择（4–220 字）。'};
  if (data.alternative.length<4 || data.alternative.length>220) return {ok:false,error:'请写下想改变的一个选择（4–220 字）。'};
  if (data.decision===data.alternative) return {ok:false,error:'两条路需要不同的选择。请修改其中一项。'};
  if (data.known_then.length>300 || data.learned_later.length>300) return {ok:false,error:'补充信息每项最多 300 字。'};
  if (![12,24,36,60,120].includes(data.horizon_months)) return {ok:false,error:'请选择有效的时间范围。'};
  if (crisis.test(`${data.background} ${data.decision} ${data.alternative}`)) return {ok:false,error:'听起来你可能正经历非常难熬的时刻。这个故事工具无法提供危机支持；请尽快联系身边可信任的人或当地紧急求助服务。'};
  return {ok:true,data};
}

function themeFor(data) {
  if (['career','city','relationship'].includes(data.theme)) return data.theme;
  const text=`${data.background} ${data.decision} ${data.alternative}`;
  if (/亲情|友情|爱情|家人|父母|朋友|恋人|关系|告白|聊天|谈话|联系/.test(text)) return 'relationship';
  if (/搬|城市|异地|迁居|住/.test(text)) return 'city';
  if (/工作|申请|职业|公司|学校|专业|创业/.test(text)) return 'career';
  return 'general';
}

const times = {
  12:['选择当晚','一周后','3 个月后','半年后','1 年后'],
  24:['选择当晚','1 个月后','3 个月后','1 年后','2 年后'],
  36:['选择当晚','3 个月后','1 年后','2 年后','3 年后'],
  60:['选择当晚','3 个月后','1 年后','3 年后','5 年后'],
  120:['选择当晚','3 个月后','1 年后','5 年后','10 年后'],
};
const motifs = {
  career:{object:'一页未完成的作品',place:'工作日结束后的桌前',gain:'更清楚自己愿意投入的方向',cost:'可以自由支配的时间'},
  city:{object:'一张还没收进抽屉的车票',place:'一条渐渐熟悉的街',gain:'对生活环境更具体的判断',cost:'想见就见的距离'},
  relationship:{object:'手机里那段没有写完的话',place:'回家途中的街角',gain:'表达自己感受的勇气',cost:'对某种回应的期待'},
  general:{object:'日历上被圈起来的那一天',place:'熟悉生活里的一个角落',gain:'对自己更清楚的认识',cost:'原来稳定的节奏'},
};
const genericUncertain = [
  '这只是把选择写成故事，并不知道当晚以外会发生什么。',
  '另一种际遇、别人的决定，都可能让这一步完全不同。',
  '眼前的感受不能证明之后一定会怎样。',
  '这段发展没有现实证据，也不代表结果更好或更坏。',
  '故事停在这里，真正的生活仍有更多未写出的路。',
];
const genericTexture={
  original:[
    '有人问你“想好了吗”，你点头，又在关灯前看了眼窗外。桌上的杯子还没洗，明早的安排已经写好。没有戏剧性的转折，只有一个会继续影响你日常的小决定。',
    '你在熟悉的路上遇见一个认识的人，聊了几句天气和近况。等红灯时，你想起那条未走过的路，绿灯一亮又跟着人群往前。好奇没有消失，也没有替你过今天。',
    '“最近怎么样？”有人问。你先说“还好”，随后补上一个真正让你烦恼的小问题。你发现自己仍可在原本的生活里求助、尝试和拒绝，而不是被那一次选择固定住。',
    '日历上有一件事被推迟，你没有立刻责怪自己。窗外的光慢慢变暗，你把下次能试的时间重新圈出来。留下来的路径也有摩擦，不是一直顺着熟悉的路走。',
    '一个旧提醒跳出来，你把它读完，没有急着删。厨房里正等着一顿普通晚饭；你去关火，再回到桌前。没走过的路仍让你想象，也许正因此，眼前的选择需要更认真。',
    '“明天再谈吧。”你对身边的人说，先把手里的事做完。你已经能承认收获与遗憾会同时存在，不必让任何一方把另一方抹掉。窗外的声音和过去一样，听的人却变了。',
  ],
  alternate:[
    '“真的要试？”有人问。你回答得不算坚定，却仍完成了第一步。水杯碰到桌角发出轻响，你回头检查自己有没有遗漏重要的现实安排；这条新路从来不只是一个勇敢的姿势。',
    '你在陌生的流程里弄错了一件小事，回家后把解决办法记在纸上。第二天再遇见类似的问题，你知道要找谁问，也知道自己未必需要独自扛着。新鲜感里开始有了重量。',
    '“最近怎么样？”有人问。你没有再说一切都好，只讲了一个高兴的瞬间和一个让你失眠的夜晚。对方听完换了个话题；你仍觉得，说出两面都是真的很重要。',
    '你发现新选择带来的某个便利，也开始计算它消耗掉的时间和关系。路灯亮起时，你把一个邀请写进日历，想办法不让生活只剩下这条路的要求，仍给自己留一点喘息。',
    '有人夸你“变了很多”，你笑着说“也有很多没变”。桌上的旧物被你带到今天，它没有证明哪条路更好，只提醒你离开一个起点以后，还得不断照顾自己。',
    '你给未来的自己留下一张便签：“不喜欢时还能调整。”这句话没有解决眼前的问题，但让你能继续吃完晚饭、回一条消息，再决定明天要做什么。',
  ],
};

function genericScenes(data, path, theme) {
  const motif=motifs[theme], alternate=path==='alternate', choice=alternate?data.alternative:data.decision;
  const time=times[data.horizon_months];
  const places=['做出选择的那个房间',motif.place,'一个普通的清晨','季节更替时的路上','此刻的生活里'];
  const moments=alternate?[
    `你把「${short(choice,65)}」变成一个动作。${motif.object}还在眼前，房间没有变，但你知道明天得面对新的问题。`,
    `你又一次想到那个决定。走在${motif.place}，你开始辨认哪些困难是暂时的，哪些需要认真求助或调整。`,
    '你在忙碌间停下几分钟，想起自己当初为什么要试。事情没有照一句愿望直线发展，却有了属于这条路的日常。',
    '你翻出旧日历，看到当年写下的提醒。过去盼望的某些东西来到身边，另一些仍然没有。',
    `你在${motif.place}放慢脚步。另一个选择还会偶尔浮现，但此刻的你已经不是出发时的你。`,
  ]:[
    `你按原来的选择继续：「${short(choice,65)}」。关灯前，${motif.object}仍留在心里，明天却依旧从熟悉的安排开始。`,
    `你继续处理眼前的生活。经过${motif.place}，你想起没有发生的另一条路，又把注意力放回当下要做的事。`,
    '一个普通的早晨，你发现自己已经形成新的习惯。它没有解决所有疑问，却让今天比选择当晚更有形状。',
    '你在日历上划掉一件完成的小事。留下并不意味着什么都不改变，你也在尝试争取更多空间。',
    '你回望那个选择，能看见当时保护了什么，也能承认自己仍对另一种可能好奇。',
  ];
  const shifts=alternate?[
    '变化先发生在行动上，结果仍没有答案。','新路逐渐出现具体的作息、人和成本。','你开始把“试试看”变成每天的安排。','收获与代价不再能用一句好坏概括。','你能更诚实地看见自己的成长和缺口。',
  ]:[
    '熟悉的生活继续，却不等于没有选择。','你在原有资源里寻找新的主动权。','关系、工作和兴趣仍在各自变化。','你不再把留下理解成原地不动。','你开始容纳未走过的路，而不让它定义自己。',
  ];
  const gained=alternate?[motif.gain,'亲自观察新路的信息','更主动地安排日常','一些没预料到的连接','重新认识自己的机会']:['熟悉的资源','日常的连续性','已经建立的信任','慢慢积累的经验','重新选择的余地'];
  const lost=alternate?['即刻的安稳',motif.cost,'原本轻松的某些时刻','对“完美转折”的想象','另一条路的亲身体验']:['马上试一次的机会','对新路的直接了解','某种想象中的速度','一次及时冒险的可能','另一条路的亲身体验'];
  const feelings=alternate?['紧张而清醒','新鲜里带着不安','疲惫，却仍想看看','复杂，不再只有兴奋','柔软地承认得失']:['松了一口气','平静里有好奇','有时踏实，有时迟疑','逐渐坚定','带着遗憾继续向前'];
  return time.map((t,i)=>({time:t,place:places[i],moment:moments[i],shift:shifts[i],gained:gained[i],lost:lost[i],feeling:feelings[i],uncertain:genericUncertain[i]}));
}

function genericSelf(data,theme) {
  const motif=motifs[theme];
  return {
    city:'未指定城市 · 由你的故事留白',
    work:'继续处理自己的工作与日常；这条假设路也有琐碎、疲惫和普通的早晨。',
    ties:'和重要的人仍需沟通、约定与尊重；任何人的回应都不能由故事决定。',
    character:'更愿意承认自己不确定，也更敢把想法变成小行动。',
    regret:`没能同时保有所有选择；也曾为${motif.cost}感到难过。`,
    gain:`得到${motif.gain}，即使它没有解决全部问题。`,
    view:'那个选择没有把我变成另一个完美的人。它只是让我面对另一组真实的问题。',
    voice:'说真的，我也有很多普通得不能再普通的日子。不是每天都像故事的结尾。',
    opening:`你来了。我走过了「${short(data.alternative,55)}」这条假设的路。想问我的，不一定非得是“成功了吗”。`,
  };
}

const selfExtras={
  letter:{daily:'早晨常先回工作消息，夜里才翻自己的笔记；周末偶尔去书店帮忙摆书。',habit:'每次看打样都先摸一摸纸边，再决定要不要改。',problem:'下一期项目的方向和自己的休息时间都还要重新谈。',doubt:'偶尔想，如果留在稳定岗位，会不会更常见到老朋友。'},
  city:{daily:'下班后沿河走一段路；每周留一个晚上给家人通话，另一个晚上给新朋友。',habit:'会把陌生街区里好走的小路画在手机地图上。',problem:'正在决定下一份工作要不要继续留在成都。',doubt:'偶尔想，如果留在原来的城市，是否能陪家人过更多普通周末。'},
  conversation:{daily:'工作日照常忙碌，晚饭后常散一小段步，再决定要不要回复一条重要消息。',habit:'写重要消息前先去倒一杯水，等呼吸慢下来。',problem:'仍要学习如何在关系里表达需要又不追着要保证。',doubt:'偶尔想，如果没有发那条消息，自己是否会更轻松。'},
};
const genericPresent=(data,theme,path)=>({
  time:'现在',place:'此刻的生活里',
  moment:path==='alternate'?`你走在${motifs[theme].place}，想起当年试着「${short(data.alternative,55)}」的那个晚上。今天仍有一件小事要处理，你没有因为选择过一次就不再犹豫。`:`你走在${motifs[theme].place}，想起当年决定「${short(data.decision,55)}」的那个晚上。另一条路仍偶尔浮现，眼前的生活也一直在变化。`,
  shift:'每一次后来的调整，都受到最初选择与新经历的共同影响。',
  gained:path==='alternate'?motifs[theme].gain:'熟悉资源中的新主动权',
  lost:path==='alternate'?motifs[theme].cost:'那次尝试的直接经验',
  feeling:'带着遗憾，也仍能往前',uncertain:'未来仍会继续分岔，无法由一个故事确定。',
});
function sceneToContract(seed,texture,index,writing) {
  const scene_text=`${seed.moment}${texture}${seed.shift}`;
  return {
    time_label:seed.time,location:seed.place,scene_title:seed.place,
    scene_text,gain:seed.gained,cost:seed.lost,
    causal_link:seed.shift,
    uncertainty:index===0?'LOW':index<3?'MEDIUM':'HIGH',
    emotion:seed.feeling,tension:writing?.tension?.[index]??[2,3,4,3,4,2][index],
    visual_motif:writing?.motif??seed.place,
    ambient:writing?.ambient?.[index]??'日常生活的声音',
  };
}
function genericMeeting(data,theme) {
  const place=motifs[theme].place;
  return {
    setting:`一处虚构的${place}`,
    scene:`你在${place}看见那个人时，先以为是玻璃上映出了自己。走近才发现，他的步子和你不太一样：经过一张摆得有些歪的椅子，他停下来扶正，像是已经习惯了处理眼前的小麻烦。桌上有一杯喝了一半的水、一张写着明天待办的纸。他抬头认出你，并没有立刻讲一个“后来我成功了”的故事。你想问「${short(data.alternative,45)}」是否值得，话到嘴边却看见他的手机屏幕亮起：还有人等他回消息，还有今天没有做完的事。他把另一把椅子拉开，轻声说：“先坐吧。你想从哪一天听起？”你忽然意识到这条路并没有停在那个选择上，它也有疲惫、失误、关系和可以重新开始的早晨。你们坐在同一张桌子两侧，谁也不比谁更像正确答案。`,
    first_difference:'他处理眼前的小麻烦时，没有急着把它解释成命运的暗示。',
    first_words:'先坐吧。你想从哪一天听起？',
  };
}
function localStory(data) {
  const theme=themeFor(data);
  const hasDemo=Object.hasOwn(CURATED,data.demo_id)&&Object.hasOwn(WRITING,data.demo_id);
  const source=hasDemo?CURATED[data.demo_id]:null;
  const writing=hasDemo?WRITING[data.demo_id]:null;
  const base=source?.fork ?? `在「${short(data.background,90)}」的生活里，你面前有两个动作。故事从同一个时刻开始，不替任何一个选择预先宣判。`;
  const paths=['original','alternate'];
  const worldlines=paths.map((path,index)=>{
    const seeds=source?source[path].concat(writing[path].present):genericScenes(data,path,theme).concat(genericPresent(data,theme,path));
    const style=writing?.[path];
    const textures=style?.texture??genericTexture[path];
    return {
      id:index===0?'A':'B',name:index===0?'沿着原来的选择':'改变一个选择',
      theme:theme,emotion_curve:style?.emotion_curve??(index?['fear','novelty','friction','connection','doubt','open_ending']:['relief','curiosity','friction','adaptation','regret','open_ending']),
      scenes:seeds.map((seed,i)=>sceneToContract(seed,textures[i],i,style)),
    };
  });
  const persona=source?.self??genericSelf(data,theme);
  const extra=(Object.hasOwn(selfExtras,data.demo_id)?selfExtras[data.demo_id]:null)??{
    daily:'过着有工作、休息、消息和琐事的普通日子；不是每天都在经历转折。',habit:'做决定前先写下自己目前知道和不知道的事。',problem:'还在处理这条路带来的日常摩擦。',doubt:'偶尔也会想，原来的选择会不会更适合那时的自己。',
  };
  const meetingSource=writing?.meeting??genericMeeting(data,theme);
  const meeting={setting:meetingSource.setting,scene:meetingSource.scene,first_difference:meetingSource.first_difference,first_words:meetingSource.first_words};
  return {
    title:source?{letter:'那封没有寄出的申请',city:'搬去另一座城的夏天',conversation:'那场没有开启的谈话'}[data.demo_id]:'另一条可能的人生',
    fork:{original_choice:data.decision,counterfactual_choice:data.alternative,moment:`${base} ${data.known_then?`当时你能知道的还有：${short(data.known_then,90)}`:'当时仍有许多信息缺失。'}`,opening_line:'同一个起点，两条路都没有标准答案。'},
    worldlines,
    alternate_self:{
      current_scene:`${persona.city}；${meeting.setting}`,
      daily_life:extra.daily,work_or_study:persona.work,relationships:persona.ties,
      habit:extra.habit,personality_change:persona.character,
      biggest_gain:persona.gain,biggest_regret:persona.regret,
      unresolved_problem:extra.problem,thought_about_real_world:`${extra.doubt} 我不知道现实中的你后来怎样。`,
    },
    meeting,
    conversation_starters:writing?.starters??['你真的快乐吗？','你还有遗憾吗？','如果重来呢？'],
    epistemic_note:'这是一条基于你提供信息构造的反事实人生，不是真实历史，也不是未来预测。',
  };
}

// A single stable response contract; real baseline/IU transports require separate CONFIG_LOCK authorization.
const adapters=Object.freeze({mock:localStory,baseline:localStory,'iu-enhanced':localStory});
export function simulate(raw,mode='mock') {
  if (!MODES.includes(mode)) throw new Error('Unsupported backend mode');
  const checked=validateInput(raw);
  if (!checked.ok) throw new Error(checked.error);
  return adapters[mode](checked.data,mode);
}

export function reply(message,self,history=[]) {
  const text=trim(message);
  if (!text || text.length>300) throw new Error('请输入 1–300 字。');
  if (crisis.test(text)) return '听起来你现在很难受。先别独自扛着；请联系身边可信任的人，或当地紧急求助服务。这个虚构角色不能提供危机支持。';
  if (/他.*想|她.*想|对方.*想|会不会喜欢|会不会答应|一定会|预测/.test(text)) return '这个我真的不知道。我不能替现实中的任何人说话。那天我能做的，只有把自己的部分说清楚，再给对方自由。';
  const turn=history.length;
  const inNewCity=self.current_scene.startsWith('成都');
  if (/成了家|算家吗|是家吗|把.*当家|安家|归属|这里.*家/.test(text)) return inNewCity
    ? '算是家了吧。我能带刚来的同事绕开积水，也知道哪家早餐店便宜。可手机里那张返乡车次截图，我还留着。我不想为了证明这里是家，就假装不想原来的家。'
    : '我正在把这里过成日子，但“家”不是一个选择之后立刻得到的答案。有些关系要重新照料，有些旧地方也仍会想念。';
  if (/想家|想念家|回家看看/.test(text)) return inNewCity
    ? '会啊。有些周末我会看回去的车次，迟迟不订。下班能熟门熟路地走过成都的街，不代表我不想家。'
    : '会。换了一条路，旧生活也没有从我身上消失。我会想念那些不用特意安排就能见到人的普通日子。';
  if (/最想念什么|想念什么|怀念什么/.test(text)) return self.current_scene.startsWith('杭州')
    ? '老朋友那些不用提前很久约、就能见面的周末吧。我喜欢现在做的事，也确实错过过一些聚餐；两句话都是真的。'
    : '有些普通的日子吧。不是因为另一条路一定更好，而是我没法同时把两种生活都留住。';
  if (/快乐|幸福|好吗|过得怎么样|满意/.test(text)) return turn>2?`今天还不错，但上周也有想躲起来的时候。${self.daily_life}`:`有快乐的时候，也有只是把一天过完的时候。${self.daily_life}`;
  if (/遗憾|后悔|失去|代价/.test(text)) return `有。${self.biggest_regret} 我不会把它说成“值得所以没关系”；有些东西失去就是会疼。`;
  if (/得到|收获|值得|成功/.test(text)) return `${self.biggest_gain} 但如果你问我值不值，我没法替当年的你打分。`;
  if (/朋友|恋爱|家人|关系|孤独/.test(text)) return `${self.relationships} 有时候我也会想，能不能既走新路又谁都不疏远。`;
  if (/工作|住|城市|现在在哪里|生活/.test(text)) return `我现在的生活是这样：${self.current_scene}。${self.work_or_study} 大多数日子其实很普通。`;
  if (/为什么|当年|选择|如果重来|重新/.test(text)) return `${self.thought_about_real_world} 说出来像很勇敢，其实我那天也怕得不行。`;
  if (/建议|应该|怎么选|怎么办/.test(text)) return '我不想替你选。也许先问问自己：当时知道什么，愿意承担什么，又有什么人能陪你商量？';
  const gentle=['我想听准你问的部分。你是想知道当年的选择，还是我现在怎么过日子？','这句我没法替你补完。你愿意再说具体一点吗？','我在听。你想从哪一天、哪件小事问起？'];
  return gentle[turn%gentle.length];
}
