import {SCENE_VIDEO_MANIFEST} from './scene-video-manifest.js';
// Identity uses full narrative content, time and location; the manifest also checks the exact source.
export function sceneSource(scene,purpose="chapter"){return JSON.stringify([purpose,scene.time_label??'',scene.location??'',scene.scene_text??'']);}
export function sceneVideoKey(scene,purpose="chapter"){let a=2166136261,b=5381;for(const c of sceneSource(scene,purpose)){const n=c.codePointAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b,33)^n;}return `scene-${(a>>>0).toString(16)}-${(b>>>0).toString(16)}`;}
export function readyVideo(scene,manifest=SCENE_VIDEO_MANIFEST,purpose="chapter"){const key=sceneVideoKey(scene,purpose),source=sceneSource(scene,purpose);return manifest.find(item=>item.key===key&&item.source===source&&item.status==='READY'&&/^\.\/assets\/video\/[a-zA-Z0-9_-]+\.mp4$/.test(item.src))??null;}
export function attachSceneVideo(frame,scene,poster,{doc=document,manifest=SCENE_VIDEO_MANIFEST,purpose="chapter"}={}){
 const clip=readyVideo(scene,manifest,purpose),status=doc.createElement('p');status.className='scene-video-status';status.setAttribute('role','status');
 if(!clip){status.textContent='本幕视频尚未生成 · 当前为静态场景意象';frame.append(status);return {status:'NOT_RUN'};}
 const image=frame.children[0],video=doc.createElement('video');video.setAttribute('src',clip.src);video.setAttribute('poster',poster);video.setAttribute('controls','');video.setAttribute('playsinline','');video.setAttribute('preload','metadata');video.setAttribute('aria-label',`${scene.time_label??''} ${scene.location??''} · 本幕虚构视频`);video.muted=true;video.className='scene-video';image.hidden=true;frame.append(video);
 status.textContent='点击播放本幕视频 · AI创作的虚构情景';frame.append(status);
 video.addEventListener('error',()=>{video.hidden=true;image.hidden=false;status.textContent='本幕视频加载失败 · 已保留静态场景，请稍后重试。';});
 return {status:'READY',video};
}
export function pauseSceneVideos(doc=document){for(const video of doc.querySelectorAll?.('video.scene-video')??[])video.pause();}
