// Pure navigation contract for the cinematic UI. The story JSON stays separate.
export const PHASES=Object.freeze(['landing','input','mirror','fork','formation','divergence','chapter','present','meeting','conversation','epilogue','share']);

export function createJourney() {
  return {phase:'landing',world:null,chapter:0,completed:[false,false],quick:false,chatTurns:0,revisiting:false};
}

export function advance(state,event,payload) {
  const next={...state,completed:[...state.completed]};
  switch(event) {
    case 'OPEN_INPUT':
      if (state.phase!=='landing') break;
      next.phase='input'; return next;
    case 'SET_PACE':
      next.quick=payload==='quick'; return next;
    case 'READY':
      if (state.phase!=='input') break;
      next.phase='mirror'; return next;
    case 'MIRRORS_DONE':
      if (state.phase!=='mirror') break;
      next.phase='fork'; return next;
    case 'SELECT_WORLD':
      if (state.phase!=='fork' || ![0,1].includes(payload)) break;
      next.world=payload; next.chapter=0; next.phase='formation'; return next;
    case 'FORMED':
      if (state.phase!=='formation') break;
      next.phase='divergence'; return next;
    case 'ENTER_CHAPTERS':
      if (state.phase!=='divergence') break;
      next.chapter=1; next.phase='chapter'; return next;
    case 'NEXT_CHAPTER':
      if (state.phase!=='chapter') break;
      if (state.chapter<5) next.chapter++;
      else next.phase=state.revisiting?'epilogue':'present';
      return next;
    case 'PREVIOUS_CHAPTER':
      if (state.phase!=='chapter') break;
      if (state.chapter>1) next.chapter--;
      else next.phase='divergence';
      return next;
    case 'PRESENT_DONE':
      if (state.phase!=='present') break;
      next.phase='meeting'; return next;
    case 'MEETING_DONE':
      if (state.phase!=='meeting') break;
      next.phase='conversation'; next.chatTurns=0; return next;
    case 'CHAT_TURN':
      if (state.phase!=='conversation') break;
      next.chatTurns++; return next;
    case 'CONVERSATION_DONE':
      if (state.phase!=='conversation') break;
      next.completed[state.world]=true; next.phase='epilogue'; return next;
    case 'REENTER_CONVERSATION':
      if (state.phase!=='epilogue' || !state.completed[state.world]) break;
      next.phase='conversation'; return next;
    case 'REVISIT_SCENE':
      if (state.phase!=='epilogue' || !Array.isArray(payload) || ![0,1].includes(payload[0]) || !Number.isInteger(payload[1]) || payload[1]<0 || payload[1]>5 || !state.completed[payload[0]]) break;
      next.world=payload[0]; next.chapter=payload[1]; next.revisiting=true; next.phase='chapter'; return next;
    case 'RETURN_EPILOGUE':
      if (state.phase!=='chapter' || !state.revisiting) break;
      next.phase='epilogue'; next.revisiting=false; return next;
    case 'VIEW_OTHER': {
      if (state.phase!=='epilogue' || !state.completed[state.world]) break;
      const other=state.world===0?1:0;
      if (state.completed[other]) break;
      next.world=other; next.chapter=0; next.revisiting=false; next.phase='formation'; return next;
    }
    case 'SHARE':
      if (state.phase!=='epilogue') break;
      next.phase='share'; return next;
    case 'BACK_TO_EPILOGUE':
      if (state.phase!=='share') break;
      next.phase='epilogue'; return next;
    case 'RESTART':
      return createJourney();
  }
  throw new Error(`Invalid journey transition: ${state.phase} / ${event}`);
}
