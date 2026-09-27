// Thin public adapter. No registry, experiment topology, credentials or model transport enters the browser.
export const MODES = Object.freeze(['mock', 'baseline', 'iu-enhanced']);
export const DISCLAIMER = '假设情景，不是真实历史或未来预测。';
export const MODEL_STATUS = 'NOT_IMPLEMENTED_CONFIG_LOCK_REQUIRED';

const thematic = {
  career: {
    kept: ['熟悉的节奏让你有余力继续积累作品和关系。', '你逐渐发现，稳定也可以成为主动探索的起点。'],
    changed: ['你为申请投入时间，等待回复本身就成为一次练习。', '无论是否得到机会，你对想做的事说得比从前更清楚。'],
    gainA: '熟悉的支持与可预期的节奏', costA: '可能继续惦记未尝试的方向',
    gainB: '试探新方向的行动感', costB: '时间投入、失望可能与节奏变化',
  },
  city: {
    kept: ['已有的关系和生活动线继续支持你的日常。', '你开始主动寻找留在这里也能成长的空间。'],
    changed: ['你先安排试住，亲身观察通勤、工作和生活。', '你会更清楚自己想要怎样的城市节奏，再做下一步决定。'],
    gainA: '陪伴与生活的连续性', costA: '对另一座城市仍留有好奇',
    gainB: '更具体的城市体验与选择信息', costB: '试住成本、适应压力与关系距离',
  },
  relationship: {
    kept: ['你给彼此保留了空间，也继续过好自己的日常。', '想说的话可能仍在心里，等待一个合适的表达方式。'],
    changed: ['你发出邀请，把是否回应的自由留给对方。', '无论谈话是否发生，你练习了清楚而温和地表达。'],
    gainA: '暂时避免一次脆弱的开口', costA: '未表达的感受可能继续占据心里',
    gainB: '表达心意与澄清边界的机会', costB: '可能被拒绝，也需尊重对方的选择',
  },
  general: {
    kept: ['既有生活沿着熟悉的节奏向前，你保留了原本的资源。', '新的机会和限制依然出现，你继续根据眼前的信息调整。'],
    changed: ['你尝试新的选择，先处理最直接的变化。', '经历逐渐带来更多信息，也可能改变你对成功的定义。'],
    gainA: '连续性与熟悉的资源', costA: '对另一种可能的好奇',
    gainB: '探索和重新认识自己的机会', costB: '适应成本与结果的不确定',
  },
};

const trimmed = value => String(value ?? '').trim();
const short = (value, limit = 92) => value.length > limit ? `${value.slice(0, limit - 1)}…` : value;
const privateCrisis = /自杀|轻生|结束生命|伤害自己|自残|不想活|想死/;

export function validateInput(raw) {
  const data = {
    background: trimmed(raw?.background), decision: trimmed(raw?.decision),
    alternative: trimmed(raw?.alternative), known_then: trimmed(raw?.known_then),
    // Intentionally never consumed by the story adapter.
    learned_later: trimmed(raw?.learned_later),
    horizon_months: Number(raw?.horizon_months), theme: trimmed(raw?.theme),
  };
  if (data.background.length < 10 || data.background.length > 400) return {ok:false, error:'请用 10–400 字写下当时的生活背景。'};
  if (data.decision.length < 4 || data.decision.length > 220) return {ok:false, error:'请写下现实中的选择（4–220 字）。'};
  if (data.alternative.length < 4 || data.alternative.length > 220) return {ok:false, error:'请写下想改变的一个选择（4–220 字）。'};
  if (data.decision === data.alternative) return {ok:false, error:'两条路需要不同的选择。请修改其中一项。'};
  if (data.known_then.length > 300 || data.learned_later.length > 300) return {ok:false, error:'补充信息每项最多 300 字。'};
  if (![12,24,36,60].includes(data.horizon_months)) return {ok:false, error:'请选择有效的时间范围。'};
  if (privateCrisis.test([data.background,data.decision,data.alternative].join(' '))) {
    return {ok:false, error:'听起来你可能正经历非常难熬的时刻。这个故事工具无法提供危机支持；请尽快联系身边可信任的人或当地紧急求助服务。'};
  }
  return {ok:true, data};
}

function themeFor(data) {
  if (thematic[data.theme]) return data.theme;
  const text = `${data.background} ${data.decision} ${data.alternative}`;
  if (/朋友|恋人|关系|告白|聊天|谈话|联系/.test(text)) return 'relationship';
  if (/搬|城市|异地|迁居|住/.test(text)) return 'city';
  if (/工作|申请|职业|公司|学校|专业|创业/.test(text)) return 'career';
  return 'general';
}

function localStory(data, mode) {
  const tone = thematic[themeFor(data)];
  const year = data.horizon_months >= 24 ? `${data.horizon_months / 12} 年后` : '1 年后';
  const context = short(data.background, 85);
  const known = data.known_then ? `在起点，你能依据的只有：${short(data.known_then, 85)}` : '在起点，你只能依据当时已经知道的事情。';
  return {
    meta: {mode, execution:'LOCAL_DETERMINISTIC_DEMO', model_status:MODEL_STATUS, disclaimer:DISCLAIMER},
    title:'两条可能的后来',
    worlds: [
      {id:'original', label:'你走过的路', title:'沿着原来的选择', lead:short(data.decision, 110),
       timeline:[{time:'起点', text:`${context} 你选择：${short(data.decision, 100)}`},{time:'几个月后', text:tone.kept[0]},{time:year, text:tone.kept[1]}],
       gain:tone.gainA, cost:tone.costA},
      {id:'alternate', label:'另一个可能', title:'改变一个选择', lead:short(data.alternative, 110),
       timeline:[{time:'起点', text:`在同样的背景下，你尝试：${short(data.alternative, 100)}`},{time:'几个月后', text:tone.changed[0]},{time:year, text:tone.changed[1]}],
       gain:tone.gainB, cost:tone.costB},
    ],
    uncertainty:`${known} 两条时间线只是可讨论的情景，不给事件分配概率，也不推断他人的真实想法。后来才知道的信息未被用于生成。`,
    alternateSelf:{opening:`嗨，我是那个尝试了「${short(data.alternative, 48)}」的你。这里没有标准答案。你最想问我的是什么？`, choice:data.alternative, cost:tone.costB, gain:tone.gainB},
  };
}

// All three modes share a stable response contract and the same UI. Real transports remain closed.
const adapters = Object.freeze({mock:localStory, baseline:localStory, 'iu-enhanced':localStory});
export function simulate(raw, mode = 'mock') {
  if (!MODES.includes(mode)) throw new Error('Unsupported backend mode');
  const checked = validateInput(raw);
  if (!checked.ok) throw new Error(checked.error);
  return adapters[mode](checked.data, mode);
}

export function reply(message, self) {
  const content = trimmed(message);
  if (!content || content.length > 300) throw new Error('请输入 1–300 字。');
  if (privateCrisis.test(content)) return '听起来你现在很难受。请先联系身边可信任的人，或当地紧急求助服务；这个虚构对话不能提供危机支持。';
  if (/他.*想|她.*想|对方.*想|会不会喜欢|会不会答应|能不能预测|一定会/.test(content)) return '我不知道真实的对方会怎么想，也不能替任何人做决定。在这条假设世界线里，我只能说：表达自己以后，仍要给对方回应或不回应的空间。';
  if (/后悔|代价|失去|害怕|值得吗/.test(content)) return `我也会犹豫。走这条路可能要付出${self.cost}；我得到的，是${self.gain}。这只是一个可能的故事，我们都不需要用它给现实中的自己打分。`;
  if (/建议|应该|怎么选|怎么办/.test(content)) return '如果回到那个时刻，我会先问：当时能知道什么？自己愿意承担哪些代价？答案可以随着生活变化，不必让一段假设故事替你做决定。';
  return `我记得自己尝试了「${short(self.choice, 48)}」。那并没有让一切自动变好，却让我看见新的问题和可能。你现在最想保留现实生活里的哪一部分？`;
}
