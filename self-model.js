export const EVIDENCE_KINDS=Object.freeze(['KNOWN','SELF_REPORT','PSYCHOMETRIC','SYMBOLIC_BAZI','SYMBOLIC_ZIWEI','INFERENCE','COUNTERFACTUAL','POSSIBLE_FUTURE']);
export const LENSES=Object.freeze(['reality','big-five','mbti','symbolic']);
export const VIEW_MODES=Object.freeze({
  reality:['reality'],
  psychology:['reality','big-five','mbti'],
  symbolic:['reality','symbolic'],
  fusion:['reality','big-five','mbti','symbolic'],
});
export const MODE_LABELS=Object.freeze({reality:'现实',psychology:'心理',symbolic:'命理',fusion:'融合',custom:'自选镜头'});
export function mbtiNarrative(type){
  if(!/^[EI][SN][TF][JP]$/.test(type))return '';
  const phrases={E:'在人群里整理想法',I:'在独处时整理想法',S:'先抓住眼前的细节',N:'先想到还可能发生什么',T:'用结构语言讲清选择',F:'用关系语言讲清选择',J:'偏好先定下一步',P:'偏好给下一步留余地'};
  return [type[0],type[1],type[2],type[3]].map(letter=>phrases[letter]).join('，');
}

export function activeLenses(mode,overrides=null){
  const selected=VIEW_MODES[mode]??VIEW_MODES.reality;
  return Object.fromEntries(LENSES.map(lens=>[lens,overrides?.[lens]??selected.includes(lens)]));
}
export function tag(kind,value,source){
  if(!EVIDENCE_KINDS.includes(kind))throw new Error('Unknown evidence kind');
  return {kind,value,source};
}
export function assembleSelfModel({reality,score,mbti,birth,chart}){
  const records=[tag('SELF_REPORT',reality,'用户描述；未独立核实')];
  if(score?.status==='SCORED')records.push(tag('PSYCHOMETRIC',score.scores,'Mini-IPIP 20 项原始自评分；非百分位或诊断'));
  if(mbti)records.push(tag('SELF_REPORT',mbti,'用户自选 MBTI 叙事标签；不由 Big Five 推导'));
  if(birth?.date||birth?.time||birth?.place)records.push(tag('SELF_REPORT',birth,'出生资料仅由用户提供；只在本机内存使用'));
  if(chart?.bazi)records.push(tag('SYMBOLIC_BAZI',chart.bazi,'lunar-javascript 确定性历法排盘；仅传统符号'));
  if(chart?.ziwei)records.push(tag('SYMBOLIC_ZIWEI',chart.ziwei,'iztro 确定性排盘；仅传统符号'));
  return records;
}
export function tagNarrativeEvidence({input,story,mode}){
  if(!input||!story)return [];
  return [
    tag('KNOWN',{original_choice:input.decision,known_then:input.known_then??''},'故事内固定前提；来自用户自报，未独立核实'),
    tag('INFERENCE',{mode,note:'镜头解释仅改变呈现，不作为世界线因果输入'},'产品解释层'),
    tag('COUNTERFACTUAL',{changed_choice:input.alternative},'用户指定的一次改变'),
    tag('POSSIBLE_FUTURE',story.worldlines.map(line=>({id:line.id,scenes:line.scenes.length})),'虚构情景；不是真实未来预测'),
  ];
}
