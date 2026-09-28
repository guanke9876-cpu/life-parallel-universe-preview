// Product-authored reflection prompts. Measurement, chart facts and interpretation
// stay separate; none of these prompts enter simulate() or determine an outcome.
export const FOCUS_LABELS={general:'我想怎样生活',work:'工作与学习',relationship:'关系与亲密',place:'城市与归属'};
const FACTORS={
  '外向':{low:'更少主动寻求社交互动',high:'更常主动参与社交互动',care:'社交的多少不能代表关系的深度。',questions:{general:'哪条路给我合适的独处与交流空间？',work:'我希望工作里有多少协作，又需要多少安静完成事情的时间？',relationship:'我是在需要陪伴，还是需要别人认可这个选择？',place:'到了新的地方，我愿意怎样建立支持我的关系？'}},
  '亲和':{low:'更少认同题目中的共情描述',high:'更认同题目中的共情描述',care:'关心别人和保留自己的边界可以同时存在。',questions:{general:'我是在照顾谁的期待，又有没有说清自己的需要？',work:'为了合作，我愿意让步到哪里？',relationship:'哪条路容得下对方的需要，也容得下我的边界？',place:'留下或离开，分别回应了谁的期待？'}},
  '尽责':{low:'更少认同题目中的秩序与及时行动描述',high:'更认同题目中的秩序与及时行动描述',care:'四道题不能判断能力，也不能衡量一个人的价值。',questions:{general:'哪条路需要我建立新的习惯？我愿意怎样落实？',work:'我能为改变安排一个什么样的可执行的小步骤？',relationship:'我的承诺需要哪些日常行动来支撑？',place:'改变城市前，我需要准备哪些现实条件？'}},
  '情绪波动':{low:'更少认同题目中的心烦和情绪起伏描述',high:'更认同题目中的心烦和情绪起伏描述',care:'这是当前自报的感受，不是临床诊断，也不证明当年的状态。',questions:{general:'面对未知时，我需要怎样的支持和缓冲？',work:'我担心的是具体风险，还是尚未发生的想象？',relationship:'这次选择里的不安，我能和谁安全地谈一谈？',place:'离开熟悉环境后，什么能让我重新获得安定感？'}},
  '想象':{low:'更少认同题目中的想象与抽象兴趣描述',high:'更认同题目中的想象与抽象兴趣描述',care:'这是想象与抽象兴趣的自我描述，不是智力或创造力排名。',questions:{general:'吸引我的是一种新可能，还是已经想清楚的日常？',work:'这条新路最吸引我的部分，能不能先小范围尝试？',relationship:'我期待的关系里，哪些是想象，哪些可以实际沟通？',place:'我向往的是那座城市，还是在那里成为另一种自己的想象？'}},
};
export function psychologyPortrait(score,focus='general'){
  if(score?.status!=='SCORED')return [];
  return Object.entries(FACTORS).map(([name,copy])=>{
    const raw=score.scores?.[name];
    if(!Number.isFinite(raw)||raw<4||raw>20)return null;
    const mean=raw/4;
    const direction=mean===3?'回答合计位于量表中点；不同题目可能相互抵消':mean>3?copy.high:copy.low;
    return {kind:'PSYCHOMETRIC',name,raw,mean,text:`本次四题计分均值 ${mean.toFixed(2)} / 5，${direction}。${copy.care}`,question:copy.questions[focus]??copy.questions.general};
  }).filter(Boolean);
}
const STEMS={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
const ELEMENTS={木:['生长','哪条路让我有空间学习，而不只是证明自己？'],火:['表达','这次选择里，有什么愿望我还没有说出口？'],土:['安放','我需要什么样的日常，才会有安定感？'],金:['边界','为了这条路，我愿意舍下什么，又必须保留什么？'],水:['转向','如果现实不如设想，我允许自己怎样调整？']};
const PALACES={
  '命宫':['自我','我想成为怎样的人，而不只是得到什么身份？'],
  '兄弟':['同伴','遇到困难时，谁能和我互相支持？'],
  '夫妻':['亲密','我希望重要关系如何参与这次选择？'],
  '子女':['照顾','这条路上，我承担哪些照顾与创造的责任？'],
  '财帛':['资源','这条路需要多少可支配的时间和资源？'],
  '疾厄':['身心照顾','我能给自己留出休息与求助的余地吗？'],
  '迁移':['环境','新的环境会改变什么日常？哪些仍要由我自己处理？'],
  '仆役':['合作','我需要怎样的合作，才能承担这个选择？'],
  '交友':['合作','我需要怎样的合作，才能承担这个选择？'],
  '官禄':['工作','我想投入怎样的工作过程，而不只是追求结果？'],
  '田宅':['归属','对我来说，什么条件会让一个地方成为家？'],
  '福德':['内在满足','没有别人评价时，这条路还值得我过下去吗？'],
  '父母':['家庭期待','哪些期待来自家人，哪些已经成为我的愿望？'],
};
const RELEVANT={general:['命宫','福德','财帛'],work:['官禄','财帛','交友','仆役'],relationship:['夫妻','父母','福德'],place:['迁移','田宅','交友','仆役']};
export function symbolicPortrait(chart,focus='general'){
  if(chart?.bazi?.pillars?.length!==4)return null;
  const dayStem=Array.from(chart.bazi.pillars[2])[0],element=STEMS[dayStem];
  const elements=Object.entries(ELEMENTS).map(([name,[theme,question]])=>({kind:'SYMBOLIC_BAZI',name,theme,count:chart.bazi.elements?.[name]??0,question}));
  const palaces=(chart.ziwei?.palaces??[]).map(p=>{
    const key=Object.keys(PALACES).find(name=>p.name===name||p.name===`${name}宫`);
    const [theme,question]=PALACES[key]??['生活视角','这个生活领域里，我有什么尚未说清的需要？'];
    return {kind:'SYMBOLIC_ZIWEI',name:p.name,theme,question,stars:[...p.stars],relevant:(RELEVANT[focus]??RELEVANT.general).includes(key)};
  });
  return {dayStem,element,dayQuestion:ELEMENTS[element]?.[1]??'',elements,palaces};
}
export function decisionReflections({input={},score,mbti='',chart,flags={},focus='general'}){
  const groups=[];
  if(flags['big-five']){
    const portrait=psychologyPortrait(score,focus);
    groups.push({source:'psychology',kind:'PSYCHOMETRIC',title:'人格倾向怎样进入这次选择',note:portrait.length?'这些问题来自当前自评，能帮助你回看选择；不能证明当时的动机。':'完成 20 题后，这里会结合五个维度提出决策问题。',items:portrait.map(p=>({title:`${p.name} · ${p.raw}/20`,text:p.text,question:p.question}))});
  }
  if(flags.mbti&&mbti)groups.push({source:'mbti',kind:'SELF_REPORT',title:`你自选的 ${mbti}`,note:'这是叙事标签，不是额外测量。',items:[{title:'把标签变成一个问题',text:'它是否贴近这次选择，由你判断。',question:'这个标签里，哪一部分帮我表达需要，哪一部分反而限制了我？'}]});
  if(flags.symbolic){
    const portrait=symbolicPortrait(chart,focus);
    groups.push({source:'symbolic',kind:'SYMBOLIC_BAZI',title:'借传统符号，换一种问法',note:portrait?'下列问题是本产品创作的反思隐喻，不是命盘断语；星曜不决定选择。':'尚无有效命盘；不编造出生信息或命理结论。',items:portrait?[{title:`日干 ${portrait.dayStem} · ${portrait.element} 的象征提问`,text:'这里只用作自我提问，不据此判断性格、旺衰或吉凶。',question:portrait.dayQuestion},...portrait.palaces.filter(p=>p.relevant).map(p=>({title:`${p.name} · ${p.theme}`,text:`盘面主星：${p.stars.join('、')||'无主星'}。这是盘面记录，不代表该领域的好坏。`,question:p.question}))]:[]});
  }
  return {original:String(input.decision??''),alternative:String(input.alternative??''),focus:FOCUS_LABELS[focus]??FOCUS_LABELS.general,groups};
}
