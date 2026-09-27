export const MOTION=Object.freeze({text:420,scene:800,fork:1100,meeting:1700,hover:160,ambientMin:8,ambientMax:30});

export function durationFor(milliseconds,{quick=false,reduced=false}={}) {
  return quick||reduced?Math.min(100,Math.max(1,Math.round(milliseconds/25))):milliseconds;
}
