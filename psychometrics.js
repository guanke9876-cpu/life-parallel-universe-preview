// Mini-IPIP (Donnellan et al., 2006), using the public-domain IPIP items and
// official 1–5 reverse-key scoring. Chinese prompts are unvalidated reading aids.
export const MINI_IPIP = Object.freeze([
  ['E1','外向','Am the life of the party.','聚会时我常是带动气氛的人。',1],
  ['A1','亲和','Sympathize with others\' feelings.','我会体谅别人的感受。',1],
  ['C1','尽责','Get chores done right away.','该做的日常事务我会及时完成。',1],
  ['N1','情绪波动','Have frequent mood swings.','我的情绪经常起伏。',1],
  ['I1','想象','Have a vivid imagination.','我的想象很鲜活。',1],
  ['E2','外向','Don\'t talk a lot.','我通常话不多。',-1],
  ['A2','亲和','Am not really interested in others.','我其实不太关心别人。',-1],
  ['C2','尽责','Often forget to put things back in their proper place.','我常忘记把东西放回原处。',-1],
  ['N2','情绪波动','Am relaxed most of the time.','多数时候我很放松。',-1],
  ['I2','想象','Have difficulty understanding abstract ideas.','我不容易理解抽象概念。',-1],
  ['E3','外向','Talk to a lot of different people at parties.','聚会时我会和许多不同的人交谈。',1],
  ['A3','亲和','Feel others\' emotions.','我能感受到别人的情绪。',1],
  ['C3','尽责','Like order.','我喜欢有条理。',1],
  ['N3','情绪波动','Get upset easily.','我容易心烦。',1],
  ['I3','想象','Am not interested in abstract ideas.','我对抽象概念不感兴趣。',-1],
  ['E4','外向','Keep in the background.','我倾向于待在不显眼的位置。',-1],
  ['A4','亲和','Am not interested in other people\'s problems.','我对别人的难题不感兴趣。',-1],
  ['C4','尽责','Make a mess of things.','我会把事情弄得杂乱。',-1],
  ['N4','情绪波动','Seldom feel blue.','我很少感到低落。',-1],
  ['I4','想象','Do not have a good imagination.','我的想象力不太丰富。',-1],
].map(([id,factor,english,chinese,key])=>Object.freeze({id,factor,english,chinese,key})));

export const FACTORS=Object.freeze(['外向','亲和','尽责','情绪波动','想象']);
export function scoreMiniIpip(answers={}) {
  const missing=MINI_IPIP.filter(item=>![1,2,3,4,5].includes(Number(answers[item.id]))).map(item=>item.id);
  if(missing.length)return {status:'INCOMPLETE',answered:20-missing.length,missing,scores:null};
  const scores=Object.fromEntries(FACTORS.map(factor=>[factor,0]));
  for(const item of MINI_IPIP){const value=Number(answers[item.id]);scores[item.factor]+=item.key===1?value:6-value;}
  return {status:'SCORED',answered:20,missing:[],scores};
}
