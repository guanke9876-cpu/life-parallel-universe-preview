import {attachSceneVideo} from './scene-video.js';
// Product-authored 2D sets and actors. Text selects bounded visual motifs, never generated markup.
export function shotFor(scene,{meeting=false}={}){
 const text=`${scene.location??''} ${scene.scene_text??''}`;
 const set=meeting?'street':/列车|火车|地铁|公交|车厢|站台/.test(scene.location)?'train':/街|桥|门口|路上|便利店|屋檐/.test(scene.location)?'street':/书店|工作室|印刷|书桌|公司|咖啡/.test(scene.location)?'studio':'room';
 const action=meeting?'meet':/行李|搬家|纸箱|打包/.test(text)?'pack':/发出去|发出|发送|申请页面|邮件/.test(text)?'send':/手机|电话|打给|消息|回复/.test(text)?'phone':set==='train'?'travel':/书|校对|便签|作品|纸/.test(text)?'read':set==='street'?'walk':'pause';
 return {set,action,rain:/雨/.test(`${scene.ambient} ${text}`),warm:/温暖|warmth|relief|家|厨房/.test(`${scene.emotion} ${scene.location}`),tension:Math.max(1,Math.min(5,Number(scene.tension)||2)),caption:({meet:'两条路，终于在这里相遇',pack:'把熟悉的日常，放进一只箱子',send:'手指停顿，然后把愿望送出去',phone:'屏幕亮起，远处的人仿佛近了一点',travel:'城市向后退，你还在想那个选择',read:'一页纸，也能改变一个下午',walk:'走过陌生街道，试着找到自己的步伐',pause:'房间安静下来，选择还留在你心里'})[action]};
}
export function visualFor(scene,options={}){
 const source=String(options.relationship??'');
 const kind=/学业与成长|升学|转学|选校|中考|高考/.test(source)?'school':/亲情|父母|家人|祖辈/.test(source)?'family':/友情|朋友|伙伴/.test(source)?'friend':/爱情|恋人|喜欢|伴侣/.test(source)?'love':options.meeting?'friend':/家|房|厨房/.test(scene.location)?'family':/街|桥|车|站/.test(scene.location)?'love':'friend';
 return {kind,src:`./assets/${kind}-memory.png`};
}
export function createFilmScene(scene,options={},doc=document){
 const shot=shotFor(scene,options),visual=visualFor(scene,options),figure=doc.createElement('figure');
 figure.className=`film-scene cinematic-still still-${visual.kind}${options.meeting?' still-meeting':''}`;
 const frame=doc.createElement('div');frame.className='still-frame';
 const image=doc.createElement('img');image.setAttribute('src',visual.src);image.setAttribute('width','1672');image.setAttribute('height','941');image.setAttribute('decoding','async');
 image.setAttribute('alt',({school:'夕阳照进空教室，课桌上的笔记与打开的门。',family:'灯下的餐桌与空椅子，一个人停在门口。',friend:'雨后的咖啡馆里，两个人隔着桌子认真倾听。',love:'候车亭里，两个人之间留着一个空座位。'})[visual.kind]+'AI创作的虚构场景意象，并非本人或真实记忆。');
 const caption=doc.createElement('figcaption');caption.textContent=`${shot.caption} · 虚构场景意象`;
 frame.append(image);attachSceneVideo(frame,scene,visual.src,{doc,purpose:options.meeting?"meeting":"chapter"});figure.append(frame,caption);return figure;
}
