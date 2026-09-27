// Narrative JSON selects a reusable visual environment; no generated code is executed.
export const ENVIRONMENTS=Object.freeze(['rainy-window','city-night','quiet-room','moving-window','warm-home','abstract-memory']);

export function environmentFor(scene) {
  const source=`${scene.ambient} ${scene.visual_motif} ${scene.location}`;
  let kind='abstract-memory';
  if (/雨|水痕|雨滴|积水/.test(source)) kind='rainy-window';
  else if (/列车|火车|地铁|公交|车窗|车厢|轨道|车站|夜车/.test(source)) kind='moving-window';
  else if (/街|城市|路灯|夜景|车流|桥上|站台/.test(source)) kind='city-night';
  else if (/家|厨房|餐桌|碗筷|茶|杯|书店|暖/.test(source)) kind='warm-home';
  else if (/房|书桌|纸|翻书|键盘|工作室|咖啡馆|窗边/.test(source)) kind='quiet-room';

  const emotion=String(scene.emotion);
  const density=/孤独|难过|失去|遗憾|疲惫|酸楚/.test(emotion)?'sparse':/紧张|不安|害怕|迟疑|摩擦/.test(emotion)?'dense':'open';
  const tension=Math.max(1,Math.min(5,Number(scene.tension)||2));
  return {kind,density,tension,tempoSeconds:Math.max(8,30-tension*4),brightness:density==='sparse'?.7:density==='dense'?.82:1};
}

export function environmentClasses(scene) {
  const {kind,density}=environmentFor(scene);
  return `env-${kind} density-${density}`;
}
