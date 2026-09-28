export const REGRET_PATHS={
 family:{label:'亲情',theme:'relationship',people:['妈妈','爸爸','爷爷','奶奶','外公','外婆','兄弟姐妹','养育我的人／养父母','后来才认识的家人','其他家人／暂时不说'],moments:['一起吃饭、被照顾的温暖时刻','一次争执或没有说清的误会','离家、分离或来不及的告别','后来才得知可能有兄弟姐妹','后来重新了解自己的身世或养育关系','久别后的相认或重逢','有一句感谢一直想说'],choices:['我没有说出自己的感受。','我选择暂时保留距离。','我认真陪伴了对方。','我没有继续追问那条消息。'],alternatives:['我把那句话认真说出来。','我先核对信息，再决定是否接触。','我留出时间陪伴对方。','我表达边界，给自己一点时间。']},
 friend:{label:'友情',theme:'relationship',people:['一起长大的伙伴','学生时代的好朋友','曾经亲近、后来疏远的人','现在很重要的朋友','一群一起经历过事情的人'],moments:['一次矛盾或没有解释的误会','毕业、搬家后渐渐分离','没有赴的约或没能出现的那天','一起完成一件事的高光时刻','低落时被接住、被支持的瞬间','多年后重新联系的那一天'],choices:['我没有解释那次误会。','我慢慢减少了联系。','我主动陪对方走过那段时间。','我答应一起做那件事。'],alternatives:['我主动说明自己的感受。','我保持联系，也尊重各自的生活。','我没有答应那次邀请。','我说清自己的边界。']},
 love:{label:'爱情',theme:'relationship',people:['青春期第一次心动的人','初恋','曾经相遇但没有走到一起的人','曾经的恋人','现在的伴侣','暂时不想说是谁'],moments:['第一次心跳加速、懵懂的喜欢','初次相遇或终于说出口的那天','平凡却甜蜜、一直记得的瞬间','因为距离、升学或现实安排分开','因为彼此的需要或相处方式分开','一次误会、沉默或没有完成的谈话','多年后再想起彼此的时候'],choices:['我把喜欢藏在心里。','我勇敢说出了自己的感受。','我没有说清自己的需要。','我选择结束那段关系。'],alternatives:['我坦诚表达喜欢，不要求对方回应。','我没有在那一天开口。','我认真听完，也说出自己的感受。','我更早说清需要和边界。']},
 school:{label:'学业与成长',theme:'education',people:['当时还未成年的自己','十八岁前后做选择的自己','老师或指导过我的人','家人和当时的我','同学与一起成长的伙伴'],moments:['选择一所学校、专业或升学方向','转学、搬家或进入新班级','考试前的一段准备与取舍','一次行为或决定改变了后来的日常','想求助却没有开口的那段时间','一次比赛、作品或被肯定的高光时刻'],choices:['我按当时的想法选择了那所学校。','我没有表达自己的兴趣。','我答应参加那次活动。','我没有及时向别人求助。'],alternatives:['我先了解另一所学校的日常。','我把兴趣和担心说给可信任的人听。','我没有参加那次活动。','我更早寻求支持。']}
};
// Optional memory cues; only explicitly selected text enters the draft.
export const SCENE_CARDS={
 family:[
  ['放学回家，厨房里有人留了一碗热饭',['妈妈','爸爸','爷爷或奶奶','外公或外婆','养育我的人'],['我坐下来陪对方吃饭。','我匆匆吃完就回了房间。'],['我多坐一会儿，问问对方今天过得怎样。','我说出自己那天的烦恼。']],
  ['出门前，家人在门口喊我带件外套',['妈妈','爸爸','爷爷或奶奶','外公或外婆'],['我没回头就走了。','我回头应了一声。'],['我停下来，好好道个别。','我说清自己想独立安排的事。']]
 ],
 friend:[
  ['放学路上，我们在奶茶店门口等饮料',['小学同学','初中同学','高中同学','一起长大的伙伴'],['我买完奶茶就先走了。','我留下来，和对方聊了一路。'],['我问问对方，愿不愿意一起走回去。','我说出那句一直没解释的话。']],
  ['早晨上学，在路口等那个一起走的人',['小学同学','初中同学','高中同学'],['我没等到就先走了。','我等了一会儿，才一起走。'],['我先问清楚对方是否还会来。','我说清以后一起走的约定。']],
  ['午后，一起在小饭馆吃饭，桌上放着柠檬冰茶',['高中同学','大学同学','一起工作的朋友','老朋友'],['我一直听，没有说自己的事。','我说出了最近的烦恼。'],['我问问对方最近过得怎样。','我把那次误会解释清楚。']],
  ['咖啡店靠窗的位置，两个人坐了一个下午',['老朋友','曾经疏远的朋友','现在很重要的朋友'],['我把想说的话留到了最后，却没开口。','我认真听完了对方的话。'],['我先说出自己的感受。','我把这次见面的边界说清楚。']],
  ['美术教室里，一起画画到放学铃响',['小学同学','高中同学','画画时认识的朋友'],['我没有给对方看自己的画。','我邀请对方一起完成那幅画。'],['我把画递过去，听听对方的想法。','我试着独立完成自己的作品。']],
  ['排练室里，一起练舞，反复练同一个动作',['高中同学','社团伙伴','一起跳舞的朋友'],['我因为怕出错，没有上场。','我和对方把那段舞练完了。'],['我再试一次，也允许自己出错。','我说出自己对分工的不满。']]
 ],
 love:[
  ['操场边，第一次因为那个人经过而心跳加速',['高中同学','初中同学','青春期第一次心动的人'],['我假装没看见，低下头。','我朝对方打了个招呼。'],['我自然地打个招呼，不要求回应。','我把这份喜欢先留给自己。']],
  ['学校走廊里，下课后恰好和那个人并肩走',['初中同学','高中同学','初恋'],['我一直沉默，走到了楼梯口。','我主动聊起了今天的课。'],['我问一个轻松的问题，试着认识对方。','我尊重自己的节奏，先不表达喜欢。']],
  ['咖啡店里，一次相遇，后来没有走到一起',['曾经相遇但没有走到一起的人','曾经的恋人'],['我没有说出想再见面的心情。','我表达了想继续了解对方。'],['我坦诚表达，也接受对方的选择。','我早点说清自己需要什么。']],
  ['那次见面之后，我后悔遇见，也不想再见',['一个不想再见的人','曾经的恋人','不想说是谁'],['我当时答应了那次见面。','我没有说出自己的不舒服。'],['我拒绝那次邀约，保留距离。','我说清边界，不再继续联系。']]
 ],
 school:[
  ['放学后的教室，桌上放着两所学校的介绍',['十八岁前后的自己','高中同学','老师','家人'],['我没有认真了解另一所学校。','我按别人的建议填了选择。'],['我问问真实的学习日常，再做选择。','我把自己的兴趣和顾虑说出来。']],
  ['新班级的第一天，站在门口找空座位',['转学时的自己','小学同学','初中同学','高中同学'],['我找了角落的位置，一直没说话。','我主动向邻座介绍了自己。'],['我试着向邻座问一个小问题。','我先观察，按自己的节奏认识别人。']]
 ]
};
export function scenePrompts(a){return [...(SCENE_CARDS[a.category]??[]).map(x=>x[0]),...(REGRET_PATHS[a.category]?.moments??[])];}
export function peoplePrompts(a){const card=SCENE_CARDS[a.category]?.find(x=>x[0]===a.moment);return [...new Set([...(card?.[1]??REGRET_PATHS[a.category]?.people??[]),'不想说是谁／只用“那个人”'])];}
export const FEELINGS=['遗憾，仍想弄明白','矛盾或委屈','想念与不舍','甜蜜、庆幸或被爱','骄傲与被看见','好奇另一种可能','几种感受混在一起／暂时说不清'];
export function momentKind(moment=''){
 if(/后悔遇见|不想再见|不愿再联系/.test(moment))return 'boundary';
 if(/身世|兄弟姐妹|养育关系|相认/.test(moment))return 'discovery';
 if(/甜蜜|温暖|高光|被支持|被肯定|心跳|相遇|说出口|感谢/.test(moment))return 'highlight';
 return 'open';
}
export function choicePrompts(answers,alternative=false){
 const path=REGRET_PATHS[answers.category];if(!path)return [];
 const kind=momentKind(answers.moment);
 if(kind==='boundary')return alternative?['我拒绝那次邀约，保留距离。','我说清边界，不再继续联系。','我向可信任的人寻求支持。']:['我当时答应了那次见面。','我没有说出自己的不舒服。','我选择了结束联系。'];
 const card=SCENE_CARDS[answers.category]?.find(x=>x[0]===answers.moment);if(card)return card[alternative?3:2];
 if(kind==='discovery')return alternative?['我先核对自己能确认的信息。','我给自己时间，暂不接触。','我向可信任的人寻求支持。','我先说清想了解的事和边界。']:['我先把这条消息放在心里。','我没有立刻联系对方。','我向可信任的人询问了情况。','我选择暂时保留距离。'];
 if(kind==='highlight')return alternative?['我没有答应那次邀请。','我没有在那一天开口。','我把那个决定推迟了一些。','我选择用另一种方式表达。']:['我答应了那次邀请。','我主动说出了心里的话。','我认真陪伴了对方。','我鼓起勇气尝试了那件事。'];
 return alternative?path.alternatives:path.choices;
}
export function regretDraft(a){
 const path=REGRET_PATHS[a.category];if(!path)return {error:'先选一个想聊的方向。'};
 if(!a.person?.trim()||!a.moment?.trim()||!a.decision?.trim()||!a.alternative?.trim())return {error:'还差一点线索，可以选提示，也可以用自己的话说。'};
 if(a.decision.trim().length<4||a.alternative.trim().length<4)return {error:'请把当时和这次的行动各说成一句短句，至少四个字。'};
 if(a.decision.trim()===a.alternative.trim())return {error:'这次想尝试的行动，需要和当时不同。'};
 const background=`我想回看一个关于${path.label}的重要时刻。与${a.person}有关。我想到的是：${a.moment}。${a.feeling?`我现在的感受是：${a.feeling}。`:''}`;
 if(background.length>400)return {error:'这段回忆有些长，请回到前面，把人物、时刻或感受略微说短一些（合计400字以内）。'};
 return {background,decision:a.decision,alternative:a.alternative,known_then:'',learned_later:'',when:'',person:'',horizon_months:'24',theme:path.theme};
}
export function installRegretGuide(doc,win,onReady,onStep=()=>{}){
 if(!doc.querySelectorAll)return {reset(){},show(){}};
 const $=id=>doc.getElementById(id),root=$('regret-guide');let index=0,answers={};
 const questions=['现在，你最想回看哪一种人生时刻？','先选一个画面：哪一个让你想起自己的经历？','这个画面里，和你在一起的是谁？','现在再想起，你最靠近哪一种感受？','那一刻，你做了什么，或没能做什么？','如果只改变自己的一个行动，你想试着做什么？','这是你想回看的那个岔路口吗？'];
 const keys=['category','moment','person','feeling','decision','alternative'];
 function remember(){if(index>0&&index<6){const value=$('guide-answer').value.trim();if(index===1&&answers.moment&&answers.moment!==value){for(const key of ['person','feeling','decision','alternative'])delete answers[key];}answers[keys[index]]=value;}}
 function draw(){
  onStep();const path=REGRET_PATHS[answers.category],kind=momentKind(answers.moment);
  $('guide-progress').textContent=`${index+1} / 7 · 慢慢说，不必讲得完整`;
  const question=index===4&&kind==='highlight'?'那个美好瞬间里，你做了什么，让它发生？':index===5&&kind==='highlight'?'如果当时没有迈出那一步，或换一种行动呢？':index===2&&answers.category==='school'?'这次学业或成长的选择，与你记忆中的谁有关？':questions[index];
  $('guide-question').textContent=question;$('guide-question').focus();$('guide-error').textContent='';
  $('guide-answer-wrap').hidden=index===0||index===6;$('guide-answer').value=answers[keys[index]]??'';$('guide-review').hidden=index!==6;
  $('guide-back').hidden=index===0;$('guide-next').hidden=index===0;$('guide-next').textContent=index===6?'确认这个选择，继续聊聊自己 →':'继续 →';
  $('guide-hint').textContent=index===1?'这些只是帮你想起经历的可选画面。没有贴近的，可以改几个字；不会把提示当成已经发生的事实。':kind==='boundary'?'不需要说出姓名，也不必重新接触。这里可以探索拒绝、离开和保持距离；随时可以暂停。':kind==='discovery'&&index>=3?'以得知这条消息的时刻为分叉点，不把后来知道的事带回此前。这里不核实亲缘或身份；可以先了解、暂不接触，也可以暂停。':index===5?(answers.category==='school'?'只改变当时能做的一个行动，不假定学校、考试或别人一定给出理想结果。':'只改自己的行动，不假定对方一定回应、原谅或回来。'):index===3?'感受不必只有一种。甜蜜、庆幸和骄傲也值得回看；说不清也没关系。':'可以点一句贴近你的话再修改，或用语音慢慢说。不必写真实姓名。';
  const options=index===0?Object.entries(REGRET_PATHS).map(([value,p])=>[value,p.label]):(index===1?scenePrompts(answers):index===2?peoplePrompts(answers):index===3?FEELINGS:index===4?choicePrompts(answers):index===5?choicePrompts(answers,true):[])?.map(text=>[text,text])??[];
  $('guide-options').replaceChildren();
  for(const [value,text] of options){const b=doc.createElement('button');b.type='button';b.className=`guide-choice${index===0?' relation-choice relation-'+value:''}`;b.textContent=text;b.addEventListener('click',()=>{if(index===0){if(answers.category!==value)answers={category:value};index=1;draw();}else{$('guide-answer').value=value;}});$('guide-options').append(b);}
  if(index===6){const draft=regretDraft(answers);$('guide-review').textContent=draft.error??`${draft.background}\n\n当时：${draft.decision}\n\n这次只改：${draft.alternative}\n\n探索另一种可能，不证明原来的路更差，也不要求你现在改变关系或生活。`;}
 }
 $('guide-next').addEventListener('click',()=>{remember();if(index<6){if(!$('guide-answer').value.trim()){$('guide-error').textContent='选一句贴近你的话，或只说几个字也可以。';return;}if(index===5){const draft=regretDraft(answers);if(draft.error){$('guide-error').textContent=draft.error;return;}}index++;draw();}else{const draft=regretDraft(answers);if(!draft.error)onReady(draft);}});
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
