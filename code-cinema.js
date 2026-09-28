// Deterministic, local SVG theatre. No network, model, user likeness or raw SVG interpolation.
export function performanceFor(scene,options={}){
 const text=`${scene.location??''} ${scene.scene_text??''}`;
 const context=String(options.relationship??'');
 const source=text+' '+context;
 const boundary=/不想再见|不再联系|拒绝.*邀约|保持距离/.test(source);
 const action=options.meeting?'meet':boundary?'leave':/奶茶|冰茶|饮料/.test(source)?'cup':/练舞|跳舞|排练/.test(source)?'dance':/画画|美术|作品/.test(source)?'draw':/行李|搬家|打包/.test(text)?'pack':/手机|电话|消息|申请|邮件/.test(text)?'phone':/一起.*走|放学|走过|街道|操场/.test(source)?'walk':/饭|餐|咖啡/.test(source)?'sit':'read';
 const set=options.meeting?'street':/美术|画画|学校|教室|课桌|学业/.test(source)?'school':/咖啡|奶茶|冰茶|小饭馆/.test(source)?'cafe':/街|路|操场|放学|站台|公交/.test(source)?'street':/公司|工作|申请|作品/.test(source)?'studio':'room';
 let hash=0;for(const c of text)hash=(Math.imul(hash,31)+c.codePointAt(0))>>>0;
 return {action,set,boundary,rain:/雨/.test(`${scene.ambient??''} ${text}`),variant:hash%3,tension:Math.max(1,Math.min(5,Number(scene.tension)||2)),label:{meet:'走近，停下，看见另一个自己',leave:'转身离开，把距离留给自己',cup:'递出一杯饮料，等对方的回应',dance:'试着迈步，停顿，再一次找到节奏',draw:'低头落笔，再抬头看一眼',pack:'俯身整理，然后提起行李',phone:'抬起手机，犹豫片刻，放下',walk:'一起走过这一段路',sit:'坐下来，把时间留给一场谈话',read:'翻开一页，停在想说的话前'}[action]};
}
export function createCodeCinema(scene,options={},doc=document){
 const p=performanceFor(scene,options),root=doc.createElement('div');root.className=`code-cinema act-${p.action} set-${p.set} variant-${p.variant}`;
 root.setAttribute('data-performance',p.action);root.setAttribute('data-renderer','local-svg');
 const svg=(tag,attrs={},parent)=>{const n=doc.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));parent?.append(n);return n;};
 const stage=svg('svg',{viewBox:'0 0 960 540',role:'img','aria-label':`${scene.time_label??''} · ${p.label}。代码绘制的虚构动画，人物不代表真实本人。`,preserveAspectRatio:'xMidYMid meet'});root.append(stage);
 const camera=svg('g',{class:'code-camera'},stage);
 svg('rect',{width:960,height:540,fill:'#07152e'},camera);
 const far=svg('g',{class:'code-depth'},camera);
 if(p.set==='street'){
  svg('rect',{x:0,y:300,width:960,height:240,fill:'#122c4b'},camera);
  for(let i=0;i<9;i++){const x=i*124-50,h=150+(i%3)*36;svg('rect',{x,y:310-h,width:95,height:h,fill:i%2?'#183757':'#102c48'},far);for(let j=0;j<3;j++)svg('rect',{x:x+14+j*25,y:330-h,width:9,height:18,fill:'#ddb589',opacity:.4},far);}
  svg('path',{d:'M0 405 L960 405 M0 486 L960 442',stroke:'#6e8b9e','stroke-width':2,opacity:.35},camera);
  svg('path',{d:'M760 375 V105 H698',stroke:'#607887','stroke-width':7,fill:'none'},camera);
  svg('ellipse',{cx:700,cy:150,rx:110,ry:125,fill:'#efc38e',opacity:.055},camera);
  svg('path',{d:'M680 112 Q701 88 722 112Z',fill:'#f4cb99'},camera);
 }else{
  svg('path',{d:'M0 0H960V366H0Z',fill:p.set==='cafe'?'#17344b':'#122844'},camera);
  svg('path',{d:'M0 366H960V540H0Z',fill:'#0c2039'},camera);
  for(let i=0;i<3;i++){svg('rect',{x:90+i*225,y:55,width:180,height:242,rx:3,fill:'#284965'},far);svg('path',{d:`M${180+i*225} 55V297 M${90+i*225} 174H${270+i*225}`,stroke:'#0a1c32','stroke-width':9},far);svg('path',{d:`M${90+i*225} 298L${210+i*225} 450H${365+i*225}L${270+i*225} 298Z`,fill:'#9aaab9',opacity:.07},camera);}
  if(p.set==='school'){svg('rect',{x:766,y:76,width:140,height:172,fill:'#153c41',stroke:'#6b7869','stroke-width':9},camera);svg('path',{d:'M788 112h94 M788 135h67 M788 158h82',stroke:'#b7c6b2',opacity:.45,'stroke-width':2},camera);}
  if(p.set==='room'){svg('path',{d:'M820 363V194',stroke:'#b99779','stroke-width':5},camera);svg('path',{d:'M779 204L793 151H845L860 204Z',fill:'#d1a77d'},camera);}
  if(p.set==='cafe'){for(let i=0;i<3;i++){svg('path',{d:`M${180+i*285} 0V75`,stroke:'#9e8e77','stroke-width':2},camera);svg('path',{d:`M${152+i*285} 93Q${180+i*285} 49 ${208+i*285} 93Z`,fill:'#e0b88b'},camera);}}
 }
 svg('ellipse',{cx:480,cy:451,rx:245,ry:28,fill:'#010c1c',opacity:.5},camera);
 const actor=(x,other=false)=>{
  const slot=svg('g',{transform:`translate(${x} 244)`},camera),travel=svg('g',{class:other?'code-travel code-companion':'code-travel code-lead'},slot),facing=svg('g',{transform:other&&['meet','cup','sit','read','draw','phone'].includes(p.action)?'scale(-1 1)':'scale(1 1)'},travel),body=svg('g',{class:'code-body'},facing);
  const coat=other?'#af9a8c':'#648bac',skin=other?'#d8b18d':'#dfb494';
  for(const [side,dx] of [['rear',-17],['front',17]]){const leg=svg('g',{class:`code-leg ${side}`,style:`--leg-x:${dx}px` },body);svg('path',{d:'M0 0L-2 58L0 96',stroke:other?'#333c51':'#202c46','stroke-width':20,'stroke-linecap':'round',fill:'none'},leg);svg('path',{d:'M-7 98H16',stroke:'#111d31','stroke-width':12,'stroke-linecap':'round'},leg);}
  svg('path',{d:'M-33 22Q0 5 33 22L30 111Q0 122 -30 111Z',fill:coat},body);
  svg('path',{d:'M-10 20L0 33L11 20',stroke:'#e0d9c9','stroke-width':6,fill:'none'},body);
  const head=svg('g',{class:'code-head'},body);svg('rect',{x:-7,y:0,width:14,height:23,fill:skin},head);svg('ellipse',{cx:0,cy:-15,rx:23,ry:29,fill:skin},head);svg('path',{d:'M-23-13Q-29-53 4-47Q30-44 23-12L15-28Q-2-20-19-26Z',fill:other?'#322a2e':'#172032'},head);svg('path',{d:'M6-16h4 M4-1q6 3 11-1',stroke:'#55404a','stroke-width':2,fill:'none'},head);
  for(const [side,dx] of [['rear',-29],['front',29]]){const arm=svg('g',{class:`code-arm ${side}`},body);svg('path',{d:`M${dx} 28L${dx+(other?-5:5)} 63L${dx+9} 94`,stroke:coat,'stroke-width':15,'stroke-linecap':'round',fill:'none'},arm);svg('circle',{cx:dx+9,cy:96,r:7,fill:skin},arm);
   if(side==='front'&&!other){const prop=svg('g',{class:'code-hand-prop'},arm);if(p.action==='cup'){svg('path',{d:'M29 77H49L46 101H32Z',fill:'#daa773'},prop);svg('path',{d:'M40 79V64',stroke:'#d7e8dd','stroke-width':3},prop);}if(p.action==='phone')svg('rect',{x:29,y:70,width:18,height:29,rx:3,fill:'#acc5dc',stroke:'#15243e','stroke-width':3},prop);if(p.action==='draw')svg('path',{d:'M35 82l20 27',stroke:'#e1c180','stroke-width':3},prop);}
  }
  return travel;
 };
 actor(p.action==='meet'?340:385);actor(p.action==='meet'?650:580,true);
 if(['read','sit','draw','cup'].includes(p.action)&&p.set!=='street'){
  svg('path',{d:'M275 381H709L739 398H248Z',fill:'#8d827a'},camera);svg('path',{d:'M288 398V477 M689 398V477',stroke:'#243b50','stroke-width':12},camera);
  svg('path',{d:'M449 376l59-6 37 14-70 3Z',fill:'#d1d7cd'},camera);
 }
 if(p.action==='pack')svg('path',{class:'code-case',d:'M433 391H493V443H433Z M449 391V381H477V391',fill:'#a68e73',stroke:'#cfb293','stroke-width':3},camera);
 if(p.rain){const rain=svg('g',{class:'code-rain',stroke:'#b5d0e7',opacity:.22},camera);for(let i=0;i<23;i++)svg('path',{d:`M${i*47} ${i%5*80}l-17 48`},rain);}
 svg('rect',{width:960,height:24,fill:'#040d20'},stage);svg('rect',{y:516,width:960,height:24,fill:'#040d20'},stage);
 const controls=doc.createElement('div');controls.className='code-controls';
 const status=doc.createElement('span');status.textContent=`${p.label} · 代码绘制的虚构动画`;
 const pause=doc.createElement('button');pause.type='button';pause.textContent='暂停动作';pause.setAttribute('aria-pressed','false');
 let paused=false;pause.addEventListener('click',()=>{paused=!paused;root.classList.toggle('code-paused',paused);pause.textContent=paused?'继续动作':'暂停动作';pause.setAttribute('aria-pressed',String(paused));});
 const replay=doc.createElement('button');replay.type='button';replay.textContent='重播本幕';replay.addEventListener('click',()=>{for(const animation of root.getAnimations?.({subtree:true})??[]){animation.currentTime=0;}root.classList.remove('code-paused');paused=false;pause.textContent='暂停动作';pause.setAttribute('aria-pressed','false');});
 controls.append(status,pause,replay);root.append(controls);return root;
}
