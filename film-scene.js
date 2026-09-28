// Product-authored 2D sets and actors. Text selects bounded visual motifs, never generated markup.
export function shotFor(scene,{meeting=false}={}){
 const text=`${scene.location??''} ${scene.scene_text??''}`;
 const set=meeting?'street':/列车|火车|地铁|公交|车厢|站台/.test(scene.location)?'train':/街|桥|门口|路上|便利店|屋檐/.test(scene.location)?'street':/书店|工作室|印刷|书桌|公司|咖啡/.test(scene.location)?'studio':'room';
 const action=meeting?'meet':/行李|搬家|纸箱|打包/.test(text)?'pack':/发出去|发出|发送|申请页面|邮件/.test(text)?'send':/手机|电话|打给|消息|回复/.test(text)?'phone':set==='train'?'travel':/书|校对|便签|作品|纸/.test(text)?'read':set==='street'?'walk':'pause';
 return {set,action,rain:/雨/.test(`${scene.ambient} ${text}`),warm:/温暖|warmth|relief|家|厨房/.test(`${scene.emotion} ${scene.location}`),tension:Math.max(1,Math.min(5,Number(scene.tension)||2)),caption:({meet:'两条路，终于在这里相遇',pack:'把熟悉的日常，放进一只箱子',send:'手指停顿，然后把愿望送出去',phone:'屏幕亮起，远处的人仿佛近了一点',travel:'城市向后退，你还在想那个选择',read:'一页纸，也能改变一个下午',walk:'走过陌生街道，试着找到自己的步伐',pause:'房间安静下来，选择还留在你心里'})[action]};
}
const NS='http://www.w3.org/2000/svg';
export function createFilmScene(scene,options={},doc=document){
 const shot=shotFor(scene,options),figure=doc.createElement('figure');figure.className=`film-scene film-${shot.set} action-${shot.action}${shot.warm?' film-warm':''}${shot.rain?' film-rain':''}`;
 const svg=doc.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 960 540');svg.setAttribute('role','img');svg.setAttribute('aria-label',`${scene.location??'故事场景'}：${shot.caption}。风格化虚构插画。`);
 const node=(parent,tag,attrs={})=>{const el=doc.createElementNS(NS,tag);for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));parent.append(el);return el;};
 const rect=(p,x,y,width,height,fill,extra={})=>node(p,'rect',{x,y,width,height,fill,...extra});
 const path=(p,d,fill,extra={})=>node(p,'path',{d,fill,...extra});
 const circle=(p,cx,cy,r,fill,extra={})=>node(p,'circle',{cx,cy,r,fill,...extra});
 const line=(p,x1,y1,x2,y2,stroke,width=3)=>node(p,'line',{x1,y1,x2,y2,stroke,'stroke-width':width,'stroke-linecap':'round'});
 const camera=node(svg,'g',{class:'film-camera'});
 rect(camera,0,0,960,540,shot.warm?'#303e43':'#162d3d');circle(camera,760,93,39,'#c8d4cc',{opacity:.7});
 function skyline(parent,offset=0){const far=node(parent,'g',{class:'film-far',transform:`translate(${offset} 0)`});for(let i=0;i<12;i++){const h=90+(i*47)%135;rect(far,i*92-30,320-h,73,h,'#29444f');for(let r=0;r<3;r++)for(let c=0;c<3;c++)if((i+r+c)%3)rect(far,i*92-15+c*17,334-h+r*38,7,15,(i+r)%2?'#bda181':'#688a91');}return far;}
 if(shot.set==='street'){
  skyline(camera);rect(camera,0,320,960,220,'#1d303a');path(camera,'M0 455 L960 370 L960 540 L0 540','#30474d');
  const shop=node(camera,'g',{});rect(shop,40,180,286,236,'#577078');rect(shop,63,232,142,180,'#b89c7d');rect(shop,76,250,116,134,'#e0ba89');rect(shop,217,230,80,182,'#233d45');rect(shop,225,244,63,110,'#6e9696');rect(shop,39,185,290,43,'#304b51');
  const sign=node(shop,'text',{x:184,y:213,'text-anchor':'middle',fill:'#e9dbc3','font-size':17,'letter-spacing':8});sign.textContent='慢一点';
  for(let i=0;i<3;i++)line(shop,85,278+i*31,180,278+i*31,'#755f51',5);
  line(camera,742,155,742,401,'#93a8a2',7);path(camera,'M741 160 Q742 117 799 123','none',{stroke:'#93a8a2','stroke-width':7});path(camera,'M781 126 L821 126 L831 146 L771 146','#d8c7a4');path(camera,'M782 146 L684 403 L905 403 L819 146','#efcf93',{opacity:.07});
  if(shot.rain)path(camera,'M61 428 L324 428 L382 457 L18 464 Z','#c5a77c',{opacity:.16});
 }else if(shot.set==='train'){
  rect(camera,0,0,960,365,'#658084');rect(camera,32,49,896,250,'#142d3b',{rx:22});skyline(camera);
  rect(camera,0,300,960,230,'#344e57');for(let i=0;i<3;i++){rect(camera,25+i*319,321,295,118,'#a57665',{rx:23});rect(camera,18+i*319,423,311,32,'#c3977c',{rx:8});}
  for(const x of [19,329,643,942])rect(camera,x,32,10,289,'#9badab');line(camera,852,5,852,494,'#b6c9c4',7);line(camera,0,22,960,22,'#bfd0c7',6);
  for(const x of [163,477,785]){line(camera,x,24,x,65,'#99aca8',3);node(camera,'path',{d:`M${x-13} 65 L${x+13} 65 L${x+17} 91 L${x-17} 91 Z`,fill:'none',stroke:'#d4d9cb','stroke-width':5});}
 }else{
  rect(camera,0,0,960,379,shot.warm?'#69685b':'#435963');path(camera,'M0 379 H960 V540 H0Z',shot.warm?'#655343':'#354750');
  const view=node(camera,'g',{});rect(view,562,49,303,256,'#112b3a');skyline(view);rect(view,0,0,551,375,shot.warm?'#69685b':'#435963');rect(view,875,0,85,375,shot.warm?'#69685b':'#435963');rect(view,550,311,330,64,shot.warm?'#69685b':'#435963');
  rect(camera,554,41,319,9,'#aba998');rect(camera,554,304,319,11,'#b2ae98');rect(camera,552,41,10,273,'#b2ae98');rect(camera,863,41,10,273,'#b2ae98');rect(camera,704,46,7,263,'#a7b4a9');line(camera,562,176,863,176,'#a7b4a9',6);
  path(camera,'M548 30 L588 30 Q563 160 590 325 L533 325Z','#bcc1ae',{class:'film-curtain',opacity:.8});
  rect(camera,47,109,231,266,'#293f43');for(let r=0;r<3;r++){rect(camera,53,176+r*63,220,7,'#9a8975');for(let b=0;b<8;b++)rect(camera,64+b*24,126+r*64,15,50-(b%3)*7,['#b89576','#6e9994','#d3c6a4'][b%3]);}
  rect(camera,318,344,346,17,'#b09271',{rx:3});rect(camera,337,360,13,147,'#655449');rect(camera,625,360,13,147,'#655449');
  rect(camera,384,285,106,59,'#263841',{rx:5});rect(camera,393,293,88,43,'#7ea09f',{class:'film-screen'});path(camera,'M374 345 H501 L491 351 H385Z','#acbab0');
  line(camera,574,342,574,260,'#d4b58c',5);path(camera,'M540 270 L556 238 H592 L611 270Z','#e7c28d');path(camera,'M542 271 L487 345 H654 L609 271Z','#f8cb86',{opacity:.15});
  if(shot.set==='studio'){for(let i=0;i<4;i++)rect(camera,302+i*32,190+(i%2)*14,25,37,['#d5b485','#aac5b6'][i%2],{transform:`rotate(${i%2?4:-4} ${314+i*32} 208)`});for(let i=0;i<5;i++)rect(camera,605-i*2,336-i*4,42,4,'#d7cdb9');}
  rect(camera,521,326,20,18,'#e1c8a8',{rx:3});node(camera,'path',{d:'M540 328 Q558 330 540 340',fill:'none',stroke:'#e1c8a8','stroke-width':3});
 }
 function actor(x,y,{other=false,small=false}={}){
  const placement=node(camera,'g',{transform:`translate(${x} ${y}) scale(${small?0.8:1})`});const person=node(placement,'g',{class:other?'film-person film-other':'film-person film-protagonist'});
  const coat=other?'#c49d7c':'#648d91';
  path(person,'M-24 -6 L-33 86 L-13 89 L1 30 L17 91 L37 88 L25 -8','#223640',{class:'film-legs'});
  path(person,'M-30 -110 Q0 -125 28 -108 L39 -6 Q0 10 -38 -7Z',coat);circle(person,0,-143,23,'#d6b495');path(person,'M-25 -145 Q-25 -183 11 -168 Q30 -163 24 -137 L11 -155 Q-8 -153 -25 -145Z','#27353a');
  path(person,'M-28 -97 Q-52 -51 -31 -32','none',{stroke:coat,'stroke-width':17,'stroke-linecap':'round'});
  const arm=node(person,'g',{class:other?'':'film-arm'});path(arm,'M24 -98 Q43 -61 7 -59','none',{stroke:coat,'stroke-width':17,'stroke-linecap':'round'});circle(arm,7,-59,7,'#d6b495');
  if(['phone','send'].includes(shot.action)){rect(arm,0,-91,17,29,'#152d37',{rx:3});rect(arm,3,-87,11,20,'#b4d1c5',{class:'film-phone'});}
  if(shot.action==='read'){path(arm,'M-18 -77 L7 -69 L34 -78 L31 -43 L7 -39 L-19 -46Z','#e6d7b8');line(arm,7,-68,7,-40,'#b2a387',1);}
  if(shot.action==='pack'){rect(placement,48,-14,62,95,'#b28e70',{rx:10});rect(placement,67,-43,23,29,'none',{stroke:'#b6b9a6','stroke-width':4});circle(placement,59,85,6,'#152730');circle(placement,99,85,6,'#152730');}
  return placement;
 }
 if(shot.action==='meet'){actor(410,394);actor(620,393,{other:true});}
 else actor(shot.set==='street'?531:shot.set==='train'?575:440,shot.set==='train'?408:414);
 if(shot.action==='send'){const mail=node(camera,'g',{class:'film-letter'});rect(mail,462,285,36,24,'#eddfc4',{rx:2});path(mail,'M462 285 L480 299 L498 285','none',{stroke:'#a7927a','stroke-width':2});}
 if(shot.rain){const rain=node(camera,'g',{class:'film-raindrops',opacity:.24});for(let i=0;i<34;i++)line(rain,(i*83)%960,(i*71)%430,(i*83)%960-8,(i*71)%430+26,'#b9d8d9',1);}
 // Foreground creates depth without obscuring the actors.
 path(camera,'M0 512 Q310 480 960 514 V540 H0Z','#0b2029',{opacity:.65});
 rect(svg,0,0,960,20,'#07161e');rect(svg,0,520,960,20,'#07161e');
 const caption=doc.createElement('figcaption');caption.textContent=`${scene.location??'故事场景'} · ${shot.caption}`;
 figure.append(svg,caption);return figure;
}
