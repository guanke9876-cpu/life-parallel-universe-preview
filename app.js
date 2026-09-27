import {MODES, simulate, reply} from './engine.js';

const $ = id => document.getElementById(id);
const form = $('story-form');
const demoGrid = $('demo-grid');
const errorBox = $('form-error');
const results = $('results');
const chatMessages = $('chat-messages');
const devPanel = $('dev-panel');
const modeSelect = $('backend-mode');
let demos = [];
let activeDemo = null;
let activeStory = null;

function node(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
}

function setError(message) {
  errorBox.textContent = message;
  errorBox.hidden = !message;
}

function fillDemo(demo) {
  for (const name of ['background','decision','alternative','known_then','learned_later','horizon_months']) {
    form.elements.namedItem(name).value = demo[name] ?? '';
  }
  activeDemo = demo.id;
  for (const card of demoGrid.querySelectorAll('button')) card.setAttribute('aria-pressed', String(card.dataset.demoId === activeDemo));
  setError('');
  form.scrollIntoView({behavior:'smooth', block:'center'});
}

function renderDemos() {
  demoGrid.replaceChildren();
  for (const demo of demos) {
    const card = node('button','demo-card');
    card.type = 'button'; card.dataset.demoId = demo.id; card.setAttribute('aria-pressed','false');
    const top = node('span','demo-top'); top.append(node('span','',demo.eyebrow), node('span','demo-arrow','↗'));
    card.append(top,node('strong','',demo.title),node('small','','点击载入这个故事'));
    card.addEventListener('click',()=>fillDemo(demo));
    demoGrid.append(card);
  }
}

function renderWorld(world) {
  const card = node('article',`world-card ${world.id === 'alternate' ? 'alternate' : ''}`);
  const head = node('div','world-head');
  head.append(node('span','world-index',world.label),node('h3','',world.title),node('p','',world.lead));
  const body = node('div','world-body');
  body.append(node('p','world-subhead','时间线'));
  const timeline = node('ol','timeline');
  for (const step of world.timeline) {
    const item = node('li'); item.append(node('time','',step.time),node('p','',step.text)); timeline.append(item);
  }
  body.append(timeline,node('p','world-subhead','关键影响'));
  const impacts = node('div','impact-grid');
  const gain = node('div','impact-box'); gain.append(node('span','','可能的收获'),node('p','',world.gain));
  const cost = node('div','impact-box'); cost.append(node('span','','可能的代价'),node('p','',world.cost));
  impacts.append(gain,cost); body.append(impacts); card.append(head,body);
  return card;
}

function appendMessage(kind, text) {
  const bubble = node('div',`message ${kind}`,text);
  chatMessages.append(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderStory(story) {
  $('worlds').replaceChildren(...story.worlds.map(renderWorld));
  $('uncertainty-text').textContent = story.uncertainty;
  chatMessages.replaceChildren();
  appendMessage('self',story.alternateSelf.opening);
  results.hidden = false;
  results.scrollIntoView({behavior:'smooth',block:'start'});
}

form.addEventListener('input',event=>{
  if (event.target.name !== 'horizon_months') {
    activeDemo = null;
    for (const card of demoGrid.querySelectorAll('button')) card.setAttribute('aria-pressed','false');
  }
  setError('');
});

form.addEventListener('submit',event=>{
  event.preventDefault();
  const values = Object.fromEntries(new FormData(form).entries());
  values.theme = demos.find(demo=>demo.id === activeDemo)?.theme ?? '';
  const mode = devPanel.hidden ? 'mock' : modeSelect.value;
  try {
    activeStory = simulate(values,mode);
    setError(''); renderStory(activeStory);
  } catch (error) {
    setError(error instanceof Error ? error.message : '暂时无法生成故事。');
    errorBox.scrollIntoView({behavior:'smooth',block:'center'});
  }
});

$('chat-form').addEventListener('submit',event=>{
  event.preventDefault();
  if (!activeStory) return;
  const input = $('chat-input');
  const text = input.value.trim();
  if (!text) return;
  try {
    const answer = reply(text,activeStory.alternateSelf);
    appendMessage('you',text); appendMessage('self',answer); input.value=''; input.focus();
  } catch (error) {input.setCustomValidity(error.message); input.reportValidity(); input.setCustomValidity('');}
});

$('restart-button').addEventListener('click',()=>{
  results.hidden = true; activeStory = null; chatMessages.replaceChildren();
  form.scrollIntoView({behavior:'smooth',block:'start'});
  $('background').focus({preventScroll:true});
});

const params = new URLSearchParams(location.search);
if (params.get('dev') === '1') {
  devPanel.hidden = false;
  const requested = params.get('mode');
  if (MODES.includes(requested)) modeSelect.value = requested;
}

fetch('./demo-data.json', {cache:'no-store'})
  .then(response=>{if (!response.ok) throw new Error('演示案例暂时不可用'); return response.json();})
  .then(data=>{
    if (!data.synthetic_only || !Array.isArray(data.demos) || data.demos.length < 3) throw new Error('演示案例校验失败');
    demos = data.demos; renderDemos();
  })
  .catch(error=>{
    demoGrid.append(node('p','demo-error',`${error.message}。仍可填写自己的故事。`));
  });
