import {MODES,simulate,reply} from './engine.js?v=cinematic-v2';

const $=id=>document.getElementById(id);
const form=$('story-form'), demoGrid=$('demo-grid'), experience=$('experience');
const stages=['transition-stage','fork-stage','scene-stage','meeting-stage','self-stage'];
let demos=[],activeDemo=null,story=null,worldIndex=0,sceneIndex=0,transitionTimer=null,captionTimer=null,chatHistory=[];

function el(tag,className,text) {
  const item=document.createElement(tag);
  if (className) item.className=className;
  if (text!==undefined) item.textContent=text;
  return item;
}
function showError(text) { $('form-error').textContent=text; $('form-error').hidden=!text; }
function showStage(id) {
  for (const name of stages) $(name).hidden=name!==id;
  window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function clearTransition() { clearTimeout(transitionTimer); clearTimeout(captionTimer); transitionTimer=null; captionTimer=null; }

function renderDemos() {
  demoGrid.replaceChildren();
  for (const demo of demos) {
    const card=el('button','demo-card'); card.type='button'; card.dataset.demoId=demo.id; card.setAttribute('aria-pressed','false');
    const top=el('span','demo-top'); top.append(el('span','',demo.eyebrow),el('span','demo-arrow','↗'));
    card.append(top,el('strong','',demo.title),el('small','','点击走进这个故事'));
    card.addEventListener('click',()=>fillDemo(demo)); demoGrid.append(card);
  }
}
function fillDemo(demo) {
  for (const name of ['background','decision','alternative','known_then','learned_later','horizon_months']) form.elements.namedItem(name).value=demo[name]??'';
  activeDemo=demo.id;
  for (const card of demoGrid.querySelectorAll('button')) card.setAttribute('aria-pressed',String(card.dataset.demoId===activeDemo));
  showError(''); form.scrollIntoView({behavior:'smooth',block:'center'});
}

function startTransition() {
  document.body.classList.add('is-experiencing'); experience.hidden=false;
  $('transition-caption').textContent='从那个选择开始，两条可能的路缓缓展开。';
  showStage('transition-stage');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { transitionTimer=setTimeout(finishTransition,180); return; }
  captionTimer=setTimeout(()=>$('transition-caption').textContent='同一个起点，将有两种不同的日常。',900);
  transitionTimer=setTimeout(finishTransition,2300);
}
function finishTransition() { clearTransition(); renderFork(); showStage('fork-stage'); }

function renderFork() {
  $('fork-copy').textContent=story.fork.moment;
  const choices=$('fork-choices'); choices.replaceChildren();
  story.worldlines.forEach((world,index)=>{
    const button=el('button',`fork-choice ${index?'fork-alternate':'fork-original'}`);
    button.type='button';
    const choice=index?story.fork.counterfactual_choice:story.fork.original_choice;
    button.append(el('span','fork-number',`0${index+1} / ${world.name}`),el('strong','',choice),el('span','fork-enter','走进这条路 ↗'));
    button.addEventListener('click',()=>{worldIndex=index;sceneIndex=0;renderScene();showStage('scene-stage');});
    choices.append(button);
  });
}

function renderScene() {
  const world=story.worldlines[worldIndex],scene=world.scenes[sceneIndex];
  $('scene-chapter').textContent=`CHAPTER ${String(sceneIndex+1).padStart(2,'0')} · ${world.name}`;
  $('scene-count').textContent=`${sceneIndex+1} / ${world.scenes.length}`;
  const progress=$('scene-progress'); progress.replaceChildren();
  for (let i=0;i<world.scenes.length;i++) progress.append(el('span',i<=sceneIndex?'is-past':''));
  for (let i=0;i<2;i++) {
    const button=$(i?'switch-alternate':'switch-original');
    button.textContent=story.worldlines[i].name; button.setAttribute('aria-pressed',String(worldIndex===i));
  }
  const article=$('scene-content'); article.className=`scene-content ${worldIndex?'scene-alternate':'scene-original'}`;
  article.replaceChildren();
  const main=el('div','scene-main');
  main.append(el('p','scene-time',scene.time_label),el('p','scene-place',`◎ ${scene.location}`),el('h2','',scene.scene_title),el('p','scene-prose',scene.scene_text),el('p','scene-shift',scene.causal_link));
  const details=el('div','scene-details');
  const gain=el('div','scene-detail'); gain.append(el('span','','你得到了'),el('p','',scene.gain));
  const loss=el('div','scene-detail'); loss.append(el('span','','你失去了'),el('p','',scene.cost));
  details.append(gain,loss);
  const foot=el('div','scene-foot'); foot.append(el('p','scene-feeling',`此刻的心情 · ${scene.emotion}`),el('p','',`环境声 · ${scene.ambient}`),el('p','scene-uncertain',`不确定性 · ${scene.uncertainty}`));
  article.append(main,details,foot);
  $('scene-back').textContent=sceneIndex?'← 上一幕':'← 返回岔路';
  $('scene-next').textContent=sceneIndex===world.scenes.length-1?'走向相遇 ↗':'继续这一生 →';
  $('scene-boundary').textContent=story.epistemic_note;
  // Replaying a short entrance animation makes each chapter and world switch feel distinct.
  void article.offsetWidth; article.classList.add('scene-enter');
}

function renderMeeting() {
  $('meeting-setting').textContent=`◎ ${story.meeting.setting}`;
  $('meeting-scene').textContent=story.meeting.scene;
  $('meeting-words').textContent=story.meeting.first_words;
  showStage('meeting-stage');
}

function appendMessage(who,text) {
  const bubble=el('div',`message ${who}`,text);
  $('chat-messages').append(bubble); $('chat-messages').scrollTop=$('chat-messages').scrollHeight;
}
function renderSelf() {
  const self=story.alternate_self;
  $('self-city').textContent=self.current_scene;
  const facts=$('self-facts'); facts.replaceChildren();
  const labels=[['日常节奏',self.daily_life],['工作或学习',self.work_or_study],['身边的人',self.relationships],['多年的习惯',self.habit],['性格的变化',self.personality_change],['最大的遗憾',self.biggest_regret],['最大的收获',self.biggest_gain],['眼前的问题',self.unresolved_problem]];
  for (const [label,value] of labels) {const row=el('div','self-fact');row.append(el('span','',label),el('p','',value));facts.append(row);}
  $('self-view').textContent=`“${self.thought_about_real_world}”`;
  chatHistory=[]; $('chat-messages').replaceChildren(); appendMessage('self',story.meeting.first_words);
  const prompts=$('chat-prompts'); prompts.replaceChildren();
  for (const prompt of story.conversation_starters) {
    const button=el('button','',prompt); button.type='button';
    button.addEventListener('click',()=>sendChat(prompt)); prompts.append(button);
  }
  showStage('self-stage');
}
function sendChat(text) {
  if (!story || !text.trim()) return;
  try {
    const answer=reply(text,story.alternate_self,chatHistory);
    chatHistory.push({speaker:'you',text},{speaker:'self',text:answer});
    appendMessage('you',text); appendMessage('self',answer);
    $('chat-input').value='';
  } catch (error) { $('chat-input').setCustomValidity(error.message); $('chat-input').reportValidity(); $('chat-input').setCustomValidity(''); }
}

form.addEventListener('input',()=>{
  activeDemo=null;
  for (const card of demoGrid.querySelectorAll('button')) card.setAttribute('aria-pressed','false');
  showError('');
});
form.addEventListener('submit',event=>{
  event.preventDefault();
  const values=Object.fromEntries(new FormData(form).entries());
  values.theme=demos.find(demo=>demo.id===activeDemo)?.theme??'';
  values.demo_id=activeDemo??'';
  const mode=$('dev-panel').hidden?'mock':$('backend-mode').value;
  try {story=simulate(values,mode);showError('');startTransition();}
  catch (error) {showError(error instanceof Error?error.message:'暂时无法生成故事。');$('form-error').scrollIntoView({behavior:'smooth',block:'center'});}
});
$('skip-transition').addEventListener('click',finishTransition);
$('switch-original').addEventListener('click',()=>{worldIndex=0;renderScene();});
$('switch-alternate').addEventListener('click',()=>{worldIndex=1;renderScene();});
$('scene-back').addEventListener('click',()=>{if (sceneIndex===0){renderFork();showStage('fork-stage');}else{sceneIndex--;renderScene();}});
$('scene-next').addEventListener('click',()=>{if (sceneIndex<story.worldlines[worldIndex].scenes.length-1){sceneIndex++;renderScene();}else renderMeeting();});
$('enter-self').addEventListener('click',renderSelf);
$('revisit-scenes').addEventListener('click',()=>{renderScene();showStage('scene-stage');});
$('restart-button').addEventListener('click',()=>{
  clearTransition(); story=null; experience.hidden=true; document.body.classList.remove('is-experiencing');
  window.scrollTo({top:0,behavior:'auto'}); $('background').focus({preventScroll:true});
});
$('chat-form').addEventListener('submit',event=>{event.preventDefault();sendChat($('chat-input').value.trim());});
$('share-preview').addEventListener('click',async()=>{
  const url=`${location.origin}${location.pathname}`;
  const quote=story.meeting.first_words.replace(/^“|”$/g,'');
  const text=`在另一条人生里，他说：“${quote}”\n假设情景，不是真实历史或未来预测。`;
  try {
    if (navigator.share) await navigator.share({title:'另一种人生',text,url});
    else if (navigator.clipboard?.writeText) {await navigator.clipboard.writeText(`${text}\n${url}`);$('share-status').textContent='虚构台词和入口已复制；你的输入和对话没有包含在分享中。';}
    else $('share-status').textContent=`分享入口：${url}`;
  } catch (error) {if (error?.name!=='AbortError') $('share-status').textContent=`可手动复制入口：${url}`;}
});

const params=new URLSearchParams(location.search);
if (params.get('dev')==='1') {
  $('dev-panel').hidden=false;
  if (MODES.includes(params.get('mode'))) $('backend-mode').value=params.get('mode');
}
fetch('./demo-data.json',{cache:'no-store'})
  .then(response=>{if (!response.ok) throw new Error('演示案例暂时不可用');return response.json();})
  .then(data=>{if (!data.synthetic_only || !Array.isArray(data.demos) || data.demos.length<3) throw new Error('演示案例校验失败');demos=data.demos;renderDemos();})
  .catch(error=>demoGrid.append(el('p','demo-error',`${error.message}。仍可填写自己的故事。`)));
