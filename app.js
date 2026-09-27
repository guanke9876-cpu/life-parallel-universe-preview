import {MODES,simulate,reply,validateInput} from './engine.js?v=conversation-home-1';
import {createJourney,advance} from './journey.js';
import {environmentFor,environmentClasses} from './environment.js';
import {createTimeline,routeForWorld} from './timeline.js';
import {cardContent,shareText,fullStoryLink,parseFullStoryLink} from './share.js';
import {durationFor} from './motion.js';

const $=id=>document.getElementById(id);
const form=$('story-form');
const stages={fork:'fork-stage',formation:'transition-stage',divergence:'divergence-stage',chapter:'scene-stage',present:'present-stage',meeting:'meeting-stage',conversation:'conversation-stage',epilogue:'epilogue-stage',share:'share-stage'};
const prefersReduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fast=()=>journey.quick||prefersReduced();
const baseUrl=()=>`${location.origin}${location.pathname}`;
const newElement=(tag,className='',text)=>{const item=document.createElement(tag);if(className)item.className=className;if(text!==undefined)item.textContent=text;return item;};
let demos=[],activeDemo=null,inputValues=null,story=null,syntheticDemo=false;
let journey=createJourney(),chats=[[],[]],timers=new Set(),epoch=0;
let switchingWorld=false;
let mainTimeline=null,formationTimeline=null,epilogueTimeline=null,shareTimeline=null;

function schedule(fn,ms){const current=epoch;const id=setTimeout(()=>{timers.delete(id);if(current===epoch)fn();},durationFor(ms,{quick:journey.quick,reduced:prefersReduced()}));timers.add(id);return id;}
function clearScheduled(){for(const id of timers)clearTimeout(id);timers.clear();epoch++;}
function move(event,payload){clearScheduled();journey=advance(journey,event,payload);render();}
function scrollTop(){window.scrollTo({top:0,behavior:'auto'});}
function showError(message){$('form-error').textContent=message;$('form-error').hidden=!message;}
function worldLabel(world){return routeForWorld(world)==='A'?'WORLD A':'WORLD B';}

function renderDemos(){const grid=$('demo-grid');grid.replaceChildren();for(const demo of demos){const card=newElement('button','demo-card');card.type='button';card.dataset.demoId=demo.id;card.setAttribute('aria-pressed','false');card.append(newElement('small','',demo.eyebrow),newElement('strong','',demo.title),newElement('small','','走进这个虚构故事 ↗'));card.addEventListener('click',()=>fillDemo(demo));grid.append(card);}}
function fillDemo(demo){for(const key of ['background','decision','alternative','known_then','learned_later','horizon_months'])form.elements.namedItem(key).value=demo[key]??'';$('when').value='';$('person').value='';activeDemo=demo.id;for(const card of $('demo-grid').querySelectorAll('button'))card.setAttribute('aria-pressed',String(card.dataset.demoId===demo.id));progressInput();$('background').scrollIntoView({block:'center',behavior:'smooth'});showError('');}
function progressInput(){const background=$('background').value.trim(),choice=$('decision').value.trim(),alternative=$('alternative').value.trim();$('input-more').hidden=background.length<10;$('input-choices').hidden=background.length<10;[$('reality-node-0'),$('reality-node-1'),$('reality-node-2'),$('reality-node-3')].forEach((node,index)=>node.classList.toggle('is-lit',[background.length>=10,Boolean($('when').value.trim()||$('person').value.trim()),Boolean(choice),Boolean(alternative)][index]));}
function valuesFromForm(){const values=Object.fromEntries(new FormData(form).entries());values.theme=demos.find(demo=>demo.id===activeDemo)?.theme??'';values.demo_id=activeDemo??'';if(!activeDemo){const details=[values.when?`时间：${values.when}。`:'',values.person?`当时重要的人：${values.person}。`:''].filter(Boolean).join(' ');if(details)values.background=`${details} ${values.background}`;}
  return values;
}
function openInput(){if(journey.phase!=='landing')return;$('landing').classList.add('is-entering');schedule(()=>move('OPEN_INPUT'),fast()?20:1050);}
function setPace(quick){journey=advance(journey,'SET_PACE',quick?'quick':'immersive');document.body.classList.toggle('quick-mode',quick);$('pace-immersive').setAttribute('aria-pressed',String(!quick));$('pace-quick').setAttribute('aria-pressed',String(quick));}

function ensureTimelines(){if(!mainTimeline)mainTimeline=createTimeline($('timeline-shell'),{compact:true});if(!formationTimeline)formationTimeline=createTimeline($('formation-timeline'));if(!epilogueTimeline)epilogueTimeline=createTimeline($('epilogue-timeline'),{interactive:true,onNode:epilogueNode});if(!shareTimeline)shareTimeline=createTimeline($('share-card-timeline'),{compact:true});}
function updateTimelines(){if(!mainTimeline)return;mainTimeline.update(journey,{animate:!fast()});mainTimeline.svg.classList.toggle('is-at-present',journey.phase==='present');if(journey.phase==='epilogue')epilogueTimeline.update(journey,{animate:!fast()});if(journey.phase==='share')shareTimeline.update(journey,{animate:false});}
function addEnvironment(id,scene,{lowMotion=false}={}){const target=$(id),style=environmentFor(scene);target.className=`scene-environment ${environmentClasses(scene)}${lowMotion?' is-low-motion':''}`;target.style.setProperty('--ambient-duration',`${style.tempoSeconds}s`);target.style.setProperty('--ambient-shift',`${style.tension*5}px`);target.style.setProperty('--scene-brightness',String(style.brightness));target.style.setProperty('--scene-blur',style.density==='sparse'?'1px':'0px');target.replaceChildren(newElement('span','env-layer'));}
function splitNarrative(text){const sentences=String(text).match(/[^。！？]+[。！？]?/g)?.map(s=>s.trim()).filter(Boolean)??[];if(sentences.length<=3)return sentences;const size=Math.ceil(sentences.length/3),chunks=[];for(let i=0;i<sentences.length;i+=size)chunks.push(sentences.slice(i,i+size).join(''));return chunks;}
function revealParagraphs(container,text,{start=200,step=420}={}){container.replaceChildren();const paragraphs=splitNarrative(text);paragraphs.forEach((part,index)=>{const p=newElement('p','narrative-paragraph',part);container.append(p);schedule(()=>p.classList.add('is-visible'),start+step*index);});return start+step*paragraphs.length;}
function currentScene(){return story.worldlines[journey.world].scenes[journey.chapter];}

function renderFork(){$('fork-original').textContent=inputValues.decision;$('fork-alternative').textContent=inputValues.alternative;$('fork-context').textContent=inputValues.known_then?`那时，你只知道：${inputValues.known_then}`:'那一天以后的事，当时还无人知道。';$('fork-stage').classList.remove('is-branching');$('fork-direction').hidden=true;$('choose-change').disabled=false;}
function chooseChange(){if(journey.phase!=='fork')return;$('choose-change').disabled=true;$('fork-direction').hidden=false;$('fork-stage').classList.add('is-branching');schedule(()=>move('SELECT_WORLD',1),fast()?20:1100);}
function verifyStoryContract(candidate){if(!candidate?.fork||candidate.worldlines?.length!==2||candidate.worldlines.some(line=>line.scenes?.length!==6||line.scenes.some(scene=>!scene.scene_text||!scene.causal_link||!scene.uncertainty)))throw new Error('生成的叙事结构不完整。');}
function formWorld(){try{story=simulate(inputValues,$('dev-panel').hidden?'mock':$('backend-mode').value);return true;}catch(error){showError(error.message||'故事暂时无法形成。');$('transition-caption').textContent='故事暂时无法形成，请重新选择。';$('skip-transition').textContent='返回输入';return false;}}
function renderFormation(){
  ensureTimelines();$('skip-transition').textContent='跳过过场 →';
  if(switchingWorld){
    $('transition-caption').textContent='回到那一天，另一条路仍在。';
    formationTimeline.update({world:journey.world===1?0:1,chapter:5,completed:[true,true],phase:'formation'},{animate:false});
    schedule(()=>formationTimeline.update({world:journey.world,chapter:0,completed:[false,false],phase:'formation'},{animate:!fast()}),180);
    schedule(()=>{$('transition-caption').textContent='沿另一条世界线继续向前';formationTimeline.update({world:journey.world,chapter:5,completed:[true,true],phase:'formation'},{animate:!fast()});},850);
    schedule(()=>{switchingWorld=false;move('FORMED');},2150);
    return;
  }
  $('transition-caption').textContent='固定那一天之前已经发生的事';
  const checked=validateInput(inputValues);
  if(!checked.ok){$('transition-caption').textContent=checked.error;$('skip-transition').textContent='返回输入';return;}
  formationTimeline.update({world:journey.world,chapter:0,completed:[false,false],phase:'formation'},{animate:false});
  schedule(()=>{if(!formWorld())return;$('transition-caption').textContent='让一个选择产生第一圈涟漪';formationTimeline.update({world:journey.world,chapter:5,completed:[true,true],phase:'formation'},{animate:!fast()});},160);
  schedule(()=>{if(!story)return;try{verifyStoryContract(story);$('transition-caption').textContent='检查六幕的因果与不确定性';}catch(error){story=null;$('transition-caption').textContent=error.message;$('skip-transition').textContent='返回输入';}},780);
  schedule(()=>{if(!story)return;for(const line of story.worldlines)for(const scene of line.scenes)environmentFor(scene);$('transition-caption').textContent='正在寻找很多年后的你';},1550);
  schedule(()=>{if(story)move('FORMED');},2700);
}
function skipFormation(){if(!story&&!formWorld()){move('RESTART');move('OPEN_INPUT');return;}try{verifyStoryContract(story);}catch{move('RESTART');move('OPEN_INPUT');return;}switchingWorld=false;move('FORMED');}

function renderDivergence(){const scene=currentScene();addEnvironment('divergence-environment',scene);$('divergence-time').textContent=scene.time_label;$('divergence-place').textContent=scene.location;$('divergence-title').textContent=scene.scene_title;$('enter-chapters').hidden=true;for(const id of ['divergence-time','divergence-place','divergence-title'])$(id).classList.remove('is-visible');[['divergence-time',100],['divergence-place',440],['divergence-title',760]].forEach(([id,delay])=>schedule(()=>$(id).classList.add('is-visible'),delay));const finish=revealParagraphs($('divergence-copy'),scene.scene_text,{start:1050,step:470});schedule(()=>$('enter-chapters').hidden=false,finish+500);}
function renderChapter(){const scene=currentScene(),line=story.worldlines[journey.world];addEnvironment('scene-environment',scene);$('scene-chapter').textContent=`${worldLabel(journey.world)} · CHAPTER ${String(journey.chapter+1).padStart(2,'0')}`;$('scene-count').textContent=`${journey.chapter+1} / 6`;$('scene-back').textContent=journey.chapter?'← 上一幕':'← 分岔瞬间';$('scene-next').textContent=journey.chapter===5?(journey.revisiting?'回到尾声 ↗':'走向现在 ↗'):'下一幕 →';$('return-epilogue').hidden=!journey.revisiting;$('causal-transition').hidden=true;const article=$('scene-content');article.replaceChildren();const main=newElement('div','scene-main');main.append(newElement('p','scene-time',scene.time_label),newElement('p','scene-place',`◎ ${scene.location}`),newElement('h2','',scene.scene_title));const prose=newElement('div','narrative-paragraphs');main.append(prose);const quote=scene.scene_text.match(/“[^”]{2,48}”/)?.[0];if(quote)main.append(newElement('blockquote','scene-quote',quote));const detail=newElement('div','scene-details');const gain=newElement('section');gain.append(newElement('span','','这条路给了你'),newElement('p','',scene.gain));const cost=newElement('section');cost.append(newElement('span','','同时也带走了'),newElement('p','',scene.cost));detail.append(gain,cost,newElement('p','scene-atmosphere-note',`${scene.emotion} · ${scene.ambient}`),newElement('p','scene-uncertainty',`${scene.uncertainty} 不确定性 · ${story.epistemic_note}`));article.append(main,detail);const finish=revealParagraphs(prose,scene.scene_text,{start:150,step:Math.max(310,510-Number(scene.tension)*32)});schedule(()=>detail.classList.add('is-visible'),finish+380);updateTimelines();}
function nextChapter(){const cause=currentScene().causal_link;move('NEXT_CHAPTER');if(journey.phase==='chapter'&&!fast()){const bridge=$('causal-transition');bridge.textContent=cause;bridge.hidden=false;schedule(()=>bridge.hidden=true,1250);}}
function previousChapter(){move('PREVIOUS_CHAPTER');}

function renderPresent(){const last=story.worldlines[journey.world].scenes[5],self=story.alternate_self;addEnvironment('present-environment',last,{lowMotion:true});$('leave-present').hidden=true;const finish=revealParagraphs($('present-prose'),last.scene_text,{start:1900,step:430});const life=$('present-life');life.replaceChildren();const lines=[self.current_scene,self.daily_life,self.work_or_study,self.relationships,self.habit,self.personality_change,self.unresolved_problem];lines.forEach((text,index)=>{const p=newElement('p','narrative-paragraph',text);life.append(p);schedule(()=>p.classList.add('is-visible'),finish+260+index*200);});$('present-uncertainty').textContent=story.epistemic_note;schedule(()=>$('leave-present').hidden=false,finish+lines.length*200+500);}
function renderMeeting(){const stage=$('meeting-stage');stage.classList.remove('is-arriving');$('meet-button').hidden=false;$('meeting-setting').hidden=true;$('meeting-scene').hidden=true;$('meeting-words').hidden=true;$('enter-self').hidden=true;addEnvironment('meeting-environment',story.worldlines[1].scenes[5],{lowMotion:true});}
function startMeeting(){if(journey.phase!=='meeting')return;$('meet-button').hidden=true;$('meeting-stage').classList.add('is-arriving');$('meeting-setting').textContent=`◎ ${story.meeting.setting}`;schedule(()=>$('meeting-setting').hidden=false,fast()?20:800);schedule(()=>{$('meeting-scene').hidden=false;const finish=revealParagraphs($('meeting-scene'),story.meeting.scene,{start:100,step:fast()?30:440});schedule(()=>{$('meeting-words').textContent=story.meeting.first_words;$('meeting-words').hidden=false;schedule(()=>$('enter-self').hidden=false,fast()?80:1100);},finish+200);},fast()?25:1400);}

function addMessage(speaker,text){const bubble=newElement('div',`message ${speaker}`,text);$('chat-messages').append(bubble);$('chat-messages').scrollTop=$('chat-messages').scrollHeight;}
function renderConversation(){const self=story.alternate_self;$('self-city').textContent=self.current_scene;$('self-context').textContent=`${self.daily_life} ${self.work_or_study}`;$('self-understory').textContent=`${self.relationships} ${self.personality_change} ${self.unresolved_problem}`;$('chat-world').textContent=`来自 WORLD A · ${story.worldlines[1].scenes[5].time_label}`;$('chat-messages').replaceChildren();addMessage('self',story.meeting.first_words);for(const item of chats[journey.world])addMessage(item.speaker,item.text);const prompts=$('chat-prompts');prompts.replaceChildren();for(const question of story.conversation_starters){const button=newElement('button','',question);button.type='button';button.addEventListener('click',()=>sendChat(question));prompts.append(button);}}
function sendChat(text){if(!story||!text.trim())return;try{const answer=reply(text,story.alternate_self,chats[journey.world]);chats[journey.world].push({speaker:'you',text},{speaker:'self',text:answer});journey=advance(journey,'CHAT_TURN');addMessage('you',text);addMessage('self',answer);$('chat-input').value='';}catch(error){$('chat-input').setCustomValidity(error.message);$('chat-input').reportValidity();$('chat-input').setCustomValidity('');}}

function epilogueNode(route,index){if(route==='reality'){$('epilogue-hint').textContent=`现实起点：${story.fork.original_choice}。这只是故事中固定的选择，并不能证明另一条路。`;return;}const world=route==='A'?1:0;if(!journey.completed[world])return;move('REVISIT_SCENE',[world,index]);}
function renderEpilogue(){$('epilogue-line').textContent=journey.completed.every(Boolean)?'你走过了两条假设的路。它们都没有替现实给出判决。':'同一个决定，还有另一种人生。';$('view-other').hidden=journey.completed.every(Boolean);$('epilogue-hint').textContent=journey.completed.every(Boolean)?'点亮的节点可以回看任一幕。':'点亮的节点可以回看。另一条路仍在远处。';epilogueTimeline.update(journey,{animate:!fast()});}
function renderShare(){const card=cardContent(story,{syntheticDemo});$('share-title').textContent=card.title;$('share-fork').textContent=card.fork;$('share-quote').textContent=`“${card.quote}”`;$('share-url').textContent=baseUrl().replace(/^https?:\/\//,'');$('share-card-motif').className=`share-card-motif ${environmentClasses(story.worldlines[journey.world].scenes[5])}`;$('share-full-story').checked=false;$('share-preview').textContent='分享安全卡片 ↗';$('share-status').textContent='';shareTimeline.update(journey,{animate:false});}

function render(){const phase=journey.phase;document.body.classList.toggle('is-landing',phase==='landing');document.body.classList.toggle('is-input',phase==='input');document.body.classList.toggle('is-experiencing',Boolean(stages[phase]));document.body.classList.toggle('quick-mode',journey.quick);$('landing').hidden=phase!=='landing';$('create').hidden=phase!=='input';$('experience').hidden=!stages[phase];$('restart-button').hidden=phase==='landing'||phase==='input';for(const id of Object.values(stages))$(id).hidden=id!==stages[phase];scrollTop();if(stages[phase]){ensureTimelines();updateTimelines();}
  if(phase==='input'){progressInput();$('background').focus({preventScroll:true});}
  if(phase==='fork')renderFork();
  if(phase==='formation')renderFormation();
  if(phase==='divergence')renderDivergence();
  if(phase==='chapter')renderChapter();
  if(phase==='present')renderPresent();
  if(phase==='meeting')renderMeeting();
  if(phase==='conversation')renderConversation();
  if(phase==='epilogue')renderEpilogue();
  if(phase==='share')renderShare();
}

$('open-input').addEventListener('click',openInput);
$('pace-immersive').addEventListener('click',()=>setPace(false));
$('pace-quick').addEventListener('click',()=>setPace(true));
$('restart-button').addEventListener('click',()=>{clearScheduled();story=null;inputValues=null;chats=[[],[]];activeDemo=null;switchingWorld=false;$('landing').classList.remove('is-entering');move('RESTART');});
form.addEventListener('input',event=>{if(event.isTrusted){activeDemo=null;for(const card of $('demo-grid').querySelectorAll('button'))card.setAttribute('aria-pressed','false');}progressInput();showError('');});
form.addEventListener('submit',event=>{event.preventDefault();const values=valuesFromForm();if(values.background.length>400){showError('请把时间和人物信息略微写短一些，总计不超过 400 字。');return;}const checked=validateInput(values);if(!checked.ok){showError(checked.error);return;}inputValues=values;syntheticDemo=Boolean(activeDemo);story=null;chats=[[],[]];showError('');move('READY');});
$('choose-change').addEventListener('click',chooseChange);
$('skip-transition').addEventListener('click',skipFormation);
$('enter-chapters').addEventListener('click',()=>move('ENTER_CHAPTERS'));
$('scene-back').addEventListener('click',previousChapter);
$('scene-next').addEventListener('click',nextChapter);
$('return-epilogue').addEventListener('click',()=>move('RETURN_EPILOGUE'));
$('leave-present').addEventListener('click',()=>move('PRESENT_DONE'));
$('meet-button').addEventListener('click',startMeeting);
$('enter-self').addEventListener('click',()=>move('MEETING_DONE'));
$('chat-form').addEventListener('submit',event=>{event.preventDefault();sendChat($('chat-input').value.trim());});
$('end-conversation').addEventListener('click',()=>move('CONVERSATION_DONE'));
$('view-other').addEventListener('click',()=>{switchingWorld=true;move('VIEW_OTHER');});
$('reenter-conversation').addEventListener('click',()=>move('REENTER_CONVERSATION'));
$('go-share').addEventListener('click',()=>move('SHARE'));
$('back-epilogue').addEventListener('click',()=>move('BACK_TO_EPILOGUE'));
$('share-full-story').addEventListener('change',()=>{$('share-preview').textContent=$('share-full-story').checked?'分享完整故事链接 ↗':'分享安全卡片 ↗';});
$('share-preview').addEventListener('click',async()=>{const full=$('share-full-story').checked;const payload=full?fullStoryLink(inputValues,baseUrl()):shareText(story,baseUrl(),{syntheticDemo});try{if(navigator.share)await navigator.share({title:full?'完整平行人生':'另一种人生',text:full?'这是一条包含私人输入的完整故事链接。':payload,url:full?payload:baseUrl()});else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(payload);$('share-status').textContent=full?'完整故事链接已复制；请确认接收者。':'安全分享文案已复制。';}else $('share-status').textContent=`可手动复制：${payload}`;}catch(error){if(error?.name!=='AbortError')$('share-status').textContent=`可手动复制：${payload}`;}});
$('save-card').addEventListener('click',()=>{const card=cardContent(story,{syntheticDemo}),canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1080;const ctx=canvas.getContext('2d');if(!ctx){$('share-status').textContent='此浏览器暂不支持保存图片。';return;}const gradient=ctx.createLinearGradient(0,0,1080,1080);gradient.addColorStop(0,'#10242d');gradient.addColorStop(1,'#325457');ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,1080);ctx.strokeStyle='#e0ad88';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(95,810);ctx.bezierCurveTo(330,810,450,690,970,640);ctx.stroke();ctx.strokeStyle='#96c8c0';ctx.beginPath();ctx.moveTo(95,810);ctx.bezierCurveTo(330,810,470,900,970,920);ctx.stroke();ctx.fillStyle='#e4b792';ctx.font='28px sans-serif';ctx.fillText('PARALLEL YOU',88,117);ctx.fillStyle='#f4ece0';ctx.font='bold 43px sans-serif';ctx.fillText(card.title.slice(0,16),88,220);ctx.fillStyle='#bdd5ca';ctx.font='27px sans-serif';ctx.fillText(card.fork.slice(0,25),88,285);ctx.fillStyle='#f4ece0';ctx.font='bold 48px serif';const quote=`“${card.quote}”`;for(let i=0;i<quote.length;i+=17)ctx.fillText(quote.slice(i,i+17),88,410+Math.floor(i/17)*68);ctx.fillStyle='#bed1c7';ctx.font='22px sans-serif';ctx.fillText(card.note,88,990);const link=document.createElement('a');link.download='parallel-you-safe-card.png';link.href=canvas.toDataURL('image/png');link.click();$('share-status').textContent='安全卡片已保存，不包含私人输入或对话。';});

const params=new URLSearchParams(location.search);if(params.get('dev')==='1'){$('dev-panel').hidden=false;if(MODES.includes(params.get('mode')))$('backend-mode').value=params.get('mode');}
fetch('./demo-data.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw new Error('演示案例暂时不可用');return response.json();}).then(data=>{if(!data.synthetic_only||!Array.isArray(data.demos)||data.demos.length<3)throw new Error('演示案例校验失败');demos=data.demos;renderDemos();}).catch(error=>$('demo-grid').append(newElement('p','form-error',`${error.message}。仍可填写自己的故事。`)));
render();
const shared=parseFullStoryLink(location.hash);
if(shared){const checked=validateInput(shared);if(checked.ok){for(const key of ['background','decision','alternative','known_then','learned_later','horizon_months','when','person'])if(form.elements.namedItem(key))form.elements.namedItem(key).value=shared[key]??'';inputValues=shared;syntheticDemo=false;move('OPEN_INPUT');move('READY');history.replaceState(null,'',`${location.pathname}${location.search}`);}}
