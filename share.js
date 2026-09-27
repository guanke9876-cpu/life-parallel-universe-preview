// Explicitly separate a safe public card from an opt-in full-story export.
export const PUBLIC_QUOTE='同一个起点，两条路都没有标准答案。';

export function cardContent(story,{syntheticDemo=false}={}) {
  return {
    title:'另一种人生',
    quote:syntheticDemo?story.meeting.first_words.replace(/^“|”$/g,''):PUBLIC_QUOTE,
    note:'假设情景，不是真实历史或未来预测',
  };
}

export function shareText(story,url,{includeFullStory=false,syntheticDemo=false,chat=[]}={}) {
  if (!includeFullStory) {
    const card=cardContent(story,{syntheticDemo});
    return `${card.title}\n“${card.quote}”\n${card.note}\n${url}`;
  }
  return `我明确选择分享完整的虚构故事与本页对话。\n${url}\n${JSON.stringify({story,chat},null,2)}`;
}
