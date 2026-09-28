export const REGRET_PATHS={
 family:{label:'亲情',people:['父母','祖辈','兄弟姐妹','其他家人'],moments:['一次没能回家的时候','一通没来得及打的电话','一次争执之后','有句话一直没有说'],choices:['我没有主动联系。','我把陪伴推迟了。','我没有说出自己的感受。'],alternatives:['我主动打那通电话。','我留出时间陪伴对方。','我把那句话认真说出来。']},
 friend:{label:'友情',people:['曾经很亲近的朋友','渐渐疏远的朋友','一起长大的伙伴'],moments:['最后一次见面','一场没有解释的误会','各自离开那座城市时','一次没有赴的约'],choices:['我没有解释那次误会。','我没有再主动联系。','我没有去赴那次约。'],alternatives:['我主动解释自己的感受。','我发出一条问候。','我认真安排一次见面。']},
 love:{label:'爱情',people:['曾经的恋人','没有说出口的喜欢','现在的伴侣'],moments:['想挽留却没有开口的时候','错过的一次坦诚交谈','决定分开的那一天','把喜欢藏起来的时候'],choices:['我没有把喜欢说出口。','我回避了那次谈话。','我没有说清自己的需要。'],alternatives:['我坦诚表达自己的喜欢。','我认真听完，也说出自己的感受。','我把自己的需要和边界说清楚。']}
};
export function regretDraft(a){
 const path=REGRET_PATHS[a.category];if(!path)return {error:'先选一个想聊的方向。'};
 if(!a.person?.trim()||!a.moment?.trim()||!a.decision?.trim()||!a.alternative?.trim())return {error:'还差一点线索，可以选提示，也可以用自己的话说。'};
 if(a.decision.trim().length<4||a.alternative.trim().length<4)return {error:'请把当时和这次的行动各说成一句短句，至少四个字。'};
 if(a.decision===a.alternative)return {error:'这次想尝试的行动，需要和当时不同。'};
 const background=`我想回看一件关于${path.label}的遗憾。与${a.person}有关。我想到的时刻是：${a.moment}。`;
 return {background,decision:a.decision,alternative:a.alternative,known_then:'',learned_later:'',when:'',person:'',horizon_months:'24',theme:'relationship'};
}
export function installRegretGuide(doc,win,onReady,onStep=()=>{}){
 if(!doc.querySelectorAll)return {reset(){},show(){}};
 const $=id=>doc.getElementById(id),root=$('regret-guide');let index=0,answers={};
 const questions=['先不急着找“这辈子最大的遗憾”。现在，你最想聊哪一种关系？','想到这段关系，你先想起谁？','如果只停在一个画面，你会回到哪一刻？','那一刻，你做了什么，或没能做什么？','如果只改变自己的一个行动，你想试着做什么？','这是你想回看的那个岔路口吗？'];
 const keys=['category','person','moment','decision','alternative'];
 function remember(){if(index>0&&index<5)answers[keys[index]]=$('guide-answer').value.trim();}
 function draw(){
  onStep();
  const path=REGRET_PATHS[answers.category];$('guide-progress').textContent=`${index+1} / 6 · 慢慢说，不必讲得完整`;
  $('guide-question').textContent=questions[index];$('guide-question').focus();$('guide-error').textContent='';
  $('guide-answer-wrap').hidden=index===0||index===5;$('guide-answer').value=answers[keys[index]]??'';$('guide-review').hidden=index!==5;
  $('guide-back').hidden=index===0;$('guide-next').hidden=index===0;$('guide-next').textContent=index===5?'确认这个选择，继续聊聊自己 →':'继续 →';
  $('guide-hint').textContent=index===4?'只改自己的行动，不假定对方一定回应、原谅或回来。':index===2?'不必证明这是最大的遗憾。只说你现在愿意触碰的一小段；不写真实姓名也可以。':'可以点一句贴近你的话，再修改；也可以直接用语音说。';
  const options=index===0?Object.entries(REGRET_PATHS).map(([value,p])=>[value,p.label]):(index===1?path?.people:index===2?path?.moments:index===3?path?.choices:index===4?path?.alternatives:[])?.map(text=>[text,text])??[];
  $('guide-options').replaceChildren();
  for(const [value,text] of options){const b=doc.createElement('button');b.type='button';b.className=`guide-choice${index===0?' relation-choice relation-'+value:''}`;b.textContent=text;b.addEventListener('click',()=>{if(index===0){if(answers.category!==value)answers={category:value};index=1;draw();}else{$('guide-answer').value=value;}});$('guide-options').append(b);}
  if(index===5){const draft=regretDraft(answers);$('guide-review').textContent=draft.error??`${draft.background}\n\n当时：${draft.decision}\n\n这次只改：${draft.alternative}\n\n这不承诺关系会变好，也不要求你现在联系任何人。`;}
 }
 $('guide-next').addEventListener('click',()=>{remember();if(index<5){if(!$('guide-answer').value.trim()){$('guide-error').textContent='选一句贴近你的话，或只说几个字也可以。';return;}if(index===4){const draft=regretDraft(answers);if(draft.error){$('guide-error').textContent=draft.error;return;}}index++;draw();}else{const draft=regretDraft(answers);if(!draft.error)onReady(draft);}});
 $('guide-back').addEventListener('click',()=>{remember();index=Math.max(0,index-1);draw();});
 $('guide-pause').addEventListener('click',()=>{onStep();remember();root.hidden=true;$('guide-resume').hidden=false;});
 $('guide-resume').addEventListener('click',()=>{root.hidden=false;$('guide-resume').hidden=true;draw();});
 const show=()=>{root.hidden=false;$('guide-resume').hidden=true;draw();};show();return {show,reset(){index=0;answers={};show();}};
}

// Existing fields and original scoring stay intact: this only changes how they are presented.
export function installQuestionCards(doc,win){
 if(!doc.querySelectorAll)return;
 function pager(root,items,{title,skip,done}){
  if(!items.length)return;let index=0;
  const bar=doc.createElement('div'),heading=doc.createElement('p'),nav=doc.createElement('div');bar.className='question-card-heading';heading.tabIndex=-1;bar.append(heading);root.prepend(bar);nav.className='question-card-nav';
  const button=(text,fn)=>{const b=doc.createElement('button');b.type='button';b.className='quiet-button';b.textContent=text;b.addEventListener('click',fn);nav.append(b);return b;};
  const back=button('← 上一问',()=>{index=Math.max(0,index-1);draw();});
  button('这题先不答',()=>{skip?.(items[index]);if(index<items.length-1){index++;draw();}else done?.();});
  const next=button('下一问 →',()=>{if(index<items.length-1){index++;draw();}else done?.();});root.append(nav);
  function draw(){items.forEach((item,i)=>item.hidden=i!==index);heading.textContent=`${index+1} / ${items.length} · ${title(index)}`;back.disabled=index===0;next.textContent=index===items.length-1?'先聊到这里，看看已填内容 →':'下一问 →';heading.focus();}
  draw();return {reset(){index=0;draw();},advance(){if(index<items.length-1){index++;draw();}else done?.();}};
 }
 const psych=doc.getElementById('psych-questionnaire'),items=Array.from(psych.children);
 const p=pager(psych,items,{title:()=> '按平常的自己回答，没有对错',skip:item=>{const select=item.querySelector('select');select.value='';select.dispatchEvent(new win.Event('change',{bubbles:true}));},done:()=>{doc.getElementById('ipip-details').open=false;doc.getElementById('big-five-viz').scrollIntoView({block:'center'});}});
 for(const item of items){const select=item.querySelector('select'),choices=doc.createElement('div');choices.className='answer-chips';for(const option of Array.from(select.options).filter(o=>o.value)){const b=doc.createElement('button');b.type='button';b.textContent=option.textContent;b.addEventListener('click',()=>{select.value=option.value;select.dispatchEvent(new win.Event('change',{bubbles:true}));});choices.append(b);}item.append(choices);select.addEventListener('change',()=>{if(select.value)p.advance();});}
 const birth=doc.querySelector('.birth-grid'),fields=Array.from(birth.children);
 const b=pager(birth,fields,{title:i=>['你愿意提供公历生日吗？用于历法换算','记得出生时间吗？不知道可以留空','出生时在哪座城市？用于你核对时区','愿意提供传统排盘参数吗？可以不提供'][i],skip:item=>{const input=item.querySelector('input,select');input.value='';input.dispatchEvent(new win.Event('input',{bubbles:true}));},done:()=>doc.getElementById('birth-utc8').focus()});
 return {reset(){p.reset();b.reset();}};
}
