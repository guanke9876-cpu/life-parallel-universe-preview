const clean=text=>String(text).trim().replace(/[，。！？、,.!?\s]/g,'').toUpperCase();
const digit={'零':0,'〇':0,'一':1,'二':2,'两':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};
function number(text){if(/^\d+$/.test(text))return Number(text);if(text.includes('十')){const [a,b]=text.split('十');return (a?digit[a]:1)*10+(b?digit[b]:0);}return Number([...text].map(c=>digit[c]??'?').join(''));}
export function voiceValue(field,text){
  const raw=String(text).trim(),n=clean(raw);
  if(field.tagName==='SELECT'){
    const options=Array.from(field.options).filter(o=>!o.disabled);
    const year=n.match(/^([一二两三四五六七八九十\d]+)年$/);
    if(year){const matched=options.find(o=>clean(o.textContent)===`${number(year[1])}年`);if(matched)return {value:matched.value};}
    const exact=options.find(o=>clean(o.textContent)===n||o.value&&clean(o.value)===n);
    if(exact)return {value:exact.value};
    const numeric=number(n.replace(/[分题]/g,''));
    const score=options.find(o=>o.value===String(numeric));
    if(/^[零〇一二两三四五六七八九十\d]+[分题]?$/.test(n)&&score)return {value:score.value};
    return {error:'没有匹配到选项。请说出完整选项文字，或手动选择。'};
  }
  if(field.type==='date'){
    const m=n.match(/^([\d零〇一二三四五六七八九]{4})[年/-]([\d一二两三四五六七八九十]{1,3})[月/-]([\d一二两三四五六七八九十]{1,3})[日号]?$/);
    if(!m)return {error:'请说完整公历日期，例如“2000年8月16日”。未修改原值。'};
    const [y,mo,d]=m.slice(1).map(number),date=new Date(Date.UTC(y,mo-1,d));
    const value=`${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if(date.getUTCFullYear()!==y||date.getUTCMonth()!==mo-1||date.getUTCDate()!==d||field.min&&value<field.min||field.max&&value>field.max)return {error:'日期无效或超出当前支持范围。未修改原值。'};
    return {value};
  }
  if(field.type==='time'){
    const m=n.match(/^([\d零〇一二两三四五六七八九十]{1,3})[点时:：]([\d零〇一二两三四五六七八九十]{1,3})分?$/);
    if(!m)return {error:'请用24小时制说清小时和分钟，例如“15点30分”。未知时辰请留空。'};
    const [h,min]=m.slice(1).map(number);if(h>23||min>59||!Number.isFinite(h+min))return {error:'时间无效。未修改原值。'};
    return {value:`${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`};
  }
  const start=Number.isInteger(field.selectionStart)?field.selectionStart:field.value.length;
  const end=Number.isInteger(field.selectionEnd)?field.selectionEnd:start;
  const value=field.value.slice(0,start)+raw+field.value.slice(end);
  if(field.maxLength>=0&&value.length>field.maxLength)return {error:'这段话超过输入框字数限制，请缩短后重试；原文已保留。'};
  return {value};
}

// One recognition session at a time; no recording, upload API, persistence or auto-submit.
export function createSpeechController({Recognition,notify,apply}){
  let current=null;
  function cancel(){const old=current;current=null;if(old){old.rec.abort();notify(old.field,'已停止语音输入。',false);}}
  function start(field){
    if(current?.field===field){cancel();return;}
    cancel();
    const rec=new Recognition(),session={rec,field,received:false};current=session;
    rec.lang='zh-CN';rec.continuous=false;rec.interimResults=true;
    rec.onstart=()=>{if(current===session)notify(field,'正在听，请说话；再次点击可停止。',true);};
    rec.onresult=event=>{
      if(current!==session)return;
      if(field.isConnected===false||field.closest?.('[hidden]')){cancel();return;}
      let interim='';
      for(let i=event.resultIndex;i<event.results.length;i++){
        const result=event.results[i];
        if(result.isFinal&&!session.received){session.received=true;current=null;rec.abort();apply(field,result[0].transcript);return;}
        interim+=result[0].transcript;
      }
      notify(field,`听到：${interim}`,true);
    };
    rec.onerror=event=>{if(current!==session)return;current=null;const messages={'not-allowed':'麦克风权限未获允许。可在浏览器站点权限中开启，或使用键盘自带听写。','service-not-allowed':'浏览器不允许使用语音服务，请使用键盘自带听写。','network':'语音服务连接失败，请重试或使用键盘自带听写。','audio-capture':'未检测到可用麦克风。','no-speech':'没有听清，请点击后再说一次。'};notify(field,messages[event.error]??'语音输入未完成，请重试或手动输入。',false);};
    rec.onend=()=>{if(current!==session)return;current=null;notify(field,session.received?'已填入，请核对后继续。':'未收到完整语句，请再试一次。',false);};
    try{notify(field,'正在请求麦克风…',true);rec.start();}catch{current=null;notify(field,'语音暂时不可用，请使用键盘自带听写或手动输入。',false);}
  }
  return {start,cancel};
}

export function installVoiceInputs(doc=document,win=window){
  if(!doc.querySelectorAll)return {cancel(){}};
  const Recognition=win.SpeechRecognition||win.webkitSpeechRecognition;
  const controls=new Map();let consent=false;
  const notify=(field,message,active)=>{const ui=controls.get(field);if(!ui)return;ui.status.textContent=message;ui.button.textContent=active?'■ 停止':'🎙 语音';ui.button.setAttribute('aria-pressed',String(active));};
  const controller=Recognition?createSpeechController({Recognition,notify,apply(field,text){
    const result=voiceValue(field,text);
    if(result.error){notify(field,result.error,false);return;}
    field.value=result.value;
    field.dispatchEvent(new win.Event('input',{bubbles:true}));field.dispatchEvent(new win.Event('change',{bubbles:true}));
    notify(field,'已填入，请核对。不会自动提交或发送。',false);
  }}):{cancel(){}};
  for(const field of doc.querySelectorAll('textarea, input[type="text"], input[type="date"], input[type="time"], select')){
    if(field.disabled||field.readOnly)continue;
    const wrap=doc.createElement('span'),button=doc.createElement('button'),status=doc.createElement('span');
    wrap.className='voice-control';button.type='button';button.className='voice-button';button.textContent='🎙 语音';
    const name=field.getAttribute('aria-label')||field.labels?.[0]?.textContent?.trim()||field.placeholder||'此项';
    button.setAttribute('aria-label',`语音填写：${name.slice(0,70)}`);button.setAttribute('aria-pressed','false');
    status.className='voice-status';status.setAttribute('role','status');
    wrap.append(button,status);field.insertAdjacentElement('afterend',wrap);controls.set(field,{button,status});
    button.addEventListener('click',event=>{
      event.preventDefault();event.stopPropagation();
      if(!Recognition){notify(field,'此浏览器未提供网页语音识别。可点输入框，再用手机键盘麦克风或系统听写。',false);return;}
      if(!consent){consent=win.confirm('语音识别由浏览器提供，声音可能发送到浏览器厂商的服务。本站不保存录音。识别文字只填入当前栏，不自动提交。是否启用本次页面的语音输入？');if(!consent)return;}
      controller.start(field);
    });
  }
  doc.addEventListener('visibilitychange',()=>{if(doc.hidden)controller.cancel();});
  win.addEventListener('pagehide',()=>controller.cancel());
  doc.addEventListener('submit',()=>controller.cancel(),true);
  return controller;
}
