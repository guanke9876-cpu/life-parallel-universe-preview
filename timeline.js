const NS='http://www.w3.org/2000/svg';
const PATHS={
  reality:'M 35 110 C 115 110, 190 110, 270 110',
  A:'M 270 110 C 435 110, 515 38, 930 38',
  B:'M 270 110 C 435 110, 515 182, 930 182',
};
const LABELS={reality:'REALITY',A:'WORLD A',B:'WORLD B'};
const fractions=[.12,.29,.46,.63,.80,.97];
export const routeForWorld=world=>world===0?'B':'A';

export function timelineState({world=1,chapter=0,completed=[false,false],phase='chapter'}={}) {
  const current=routeForWorld(world);
  const epilogue=phase==='epilogue'||phase==='share';
  const active=Math.max(.08,Math.min(1,(chapter+1)/6));
  return {
    reality:1,
    A:epilogue?(completed[1]?1:.08):current==='A'?active:completed[1]?1:.08,
    B:epilogue?(completed[0]?1:.08):current==='B'?active:completed[0]?1:.08,
  };
}

const svgEl=(name,attrs={})=>{
  const element=document.createElementNS(NS,name);
  for(const [key,value] of Object.entries(attrs))element.setAttribute(key,String(value));
  return element;
};

export function createTimeline(container,{interactive=false,onNode=()=>{},compact=false}={}) {
  const svg=svgEl('svg',{viewBox:'0 0 970 225',role:'img','aria-label':'现实主线与两条平行世界线'});
  svg.classList.add('timeline-svg');
  if(compact)svg.classList.add('is-compact');
  const paths={},nodes={};
  let latest={completed:[false,false]};
  for(const route of ['reality','A','B']){
    const group=svgEl('g',{'data-route':route});
    group.classList.add('timeline-route',`route-${route.toLowerCase()}`);
    const ghost=svgEl('path',{d:PATHS[route]});ghost.classList.add('timeline-ghost');group.append(ghost);
    const path=svgEl('path',{d:PATHS[route]});path.classList.add('timeline-drawn');group.append(path);paths[route]=path;
    const steps=route==='reality'?[.18,.50,.94]:fractions;
    nodes[route]=steps.map((fraction,index)=>{
      const marker=svgEl('circle',{r:interactive?8:6});
      marker.classList.add('timeline-node');
      marker.dataset.route=route;marker.dataset.index=String(index);
      let hit=null;
      if(interactive){hit=svgEl('circle',{r:48,tabindex:0,role:'button','aria-label':`${LABELS[route]} 第 ${index+1} 个节点`});hit.classList.add('timeline-hit');const activate=()=>{if(route==='reality'||latest.completed[route==='A'?1:0])onNode(route,index);};hit.addEventListener('click',activate);hit.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate();}});}
      group.append(marker);if(hit)group.append(hit);return {marker,hit,fraction};
    });
    const label=svgEl('text',{x:route==='reality'?42:800,y:route==='reality'?91:route==='A'?25:211});
    label.classList.add('timeline-label');label.textContent=LABELS[route];group.append(label);
    svg.append(group);
  }
  container.replaceChildren(svg);
  for(const route of Object.keys(paths)){
    const path=paths[route],length=path.getTotalLength();
    path.style.strokeDasharray=`${length}`;
    path.style.strokeDashoffset=`${length}`;
    for(const {marker,hit,fraction} of nodes[route]){
      const point=path.getPointAtLength(length*fraction);
      marker.setAttribute('cx',point.x);marker.setAttribute('cy',point.y);
      if(hit){hit.setAttribute('cx',point.x);hit.setAttribute('cy',point.y);}
    }
  }
  function update(state,{animate=true}={}){
    latest=state;
    const progress=timelineState(state),current=routeForWorld(state.world);
    svg.classList.toggle('is-static',!animate);
    for(const route of Object.keys(paths)){
      const path=paths[route],length=path.getTotalLength();
      path.style.strokeDashoffset=String(length*(1-progress[route]));
      path.parentElement.classList.toggle('is-current',route===current);
      path.parentElement.classList.toggle('is-complete',route==='reality'||route==='A'&&state.completed[1]||route==='B'&&state.completed[0]);
      for(const {marker,hit,fraction} of nodes[route]){
        const reached=fraction<=progress[route]+.01;
        marker.classList.toggle('is-reached',reached);
        marker.classList.toggle('is-current',reached&&route===current&&Math.abs(fraction-progress[route])<.2);
        if(hit)hit.setAttribute('aria-disabled',String(route!=='reality'&&!((route==='A'?state.completed[1]:state.completed[0])&&reached)));
      }
    }
  }
  return {svg,update};
}
