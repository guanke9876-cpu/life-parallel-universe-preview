// Explicitly separate a safe public card from an opt-in full-story export.
export const PUBLIC_QUOTE='同一个起点，两条路都没有标准答案。';

export function cardContent(story,{syntheticDemo=false}={}) {
  return {
    title:syntheticDemo?story.title:'另一种人生',
    fork:syntheticDemo?story.fork.counterfactual_choice:'一个选择，把时间分成两条路。',
    quote:syntheticDemo?story.meeting.first_words.replace(/^“|”$/g,''):PUBLIC_QUOTE,
    motif:syntheticDemo?story.worldlines[1].scenes[0].visual_motif:'两条时间线',
    note:'假设情景，不是真实历史或未来预测',
  };
}

export function shareText(story,url,{syntheticDemo=false}={}) {
  const card=cardContent(story,{syntheticDemo});
  return `${card.title}\n${card.fork}\n“${card.quote}”\n${card.note}\n${url}`;
}

// URL fragments stay out of ordinary HTTP requests. The explicit opt-in still
// warns that recipients, browser history and chat previews may retain the link.
export function fullStoryLink(values,baseUrl) {
  const allowed=['background','decision','alternative','known_then','learned_later','horizon_months','theme','demo_id'];
  const input=Object.fromEntries(allowed.map(key=>[key,String(values[key]??'')]));
  const bytes=new TextEncoder().encode(JSON.stringify({version:1,input}));
  const encoded=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  return `${baseUrl.split('#')[0]}#story=${encoded}`;
}

export function parseFullStoryLink(hash) {
  try {
    const encoded=String(hash).match(/^#story=([A-Za-z0-9_-]{1,12000})$/)?.[1];
    if(!encoded)return null;
    const raw=atob(encoded.replace(/-/g,'+').replace(/_/g,'/'));
    const payload=JSON.parse(new TextDecoder().decode(Uint8Array.from(raw,char=>char.charCodeAt(0))));
    if(payload?.version!==1||typeof payload.input!=='object'||!payload.input)return null;
    const {background,decision,alternative}=payload.input;
    if(typeof background!=='string'||typeof decision!=='string'||typeof alternative!=='string')return null;
    return payload.input;
  }catch{return null;}
}
