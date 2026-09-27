export function validateBirth(input){
  const date=String(input?.date??''),time=String(input?.time??''),place=String(input?.place??'').trim();
  if(!date&&!time&&!place)return {ok:false,status:'NOT_PROVIDED',message:'未提供出生资料；不生成命盘。'};
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return {ok:false,status:'MISSING_DATE',message:'请填写公历出生日期。'};
  const [y,m,d]=date.split('-').map(Number),day=new Date(Date.UTC(y,m-1,d));
  if(day.getUTCFullYear()!==y||day.getUTCMonth()!==m-1||day.getUTCDate()!==d||y<1992||day>Date.now())return {ok:false,status:'UNSUPPORTED_DATE',message:'本版仅支持 1992 年起的有效公历出生日期，避免历史夏令时误差。'};
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))return {ok:false,status:'UNKNOWN_TIME',message:'时辰未知；不生成精确四柱或紫微盘。'};
  const hour=Number(time.slice(0,2));
  if(hour===23||hour===0)return {ok:false,status:'DAY_BOUNDARY',message:'23:00–00:59 有换日流派差异，本版不生成精确盘。'};
  if(place.length<2||place.length>80)return {ok:false,status:'MISSING_PLACE',message:'请填写出生城市，用于确认时间地区。'};
  if(input?.utc8!==true)return {ok:false,status:'TIMEZONE_UNCONFIRMED',message:'请确认出生时当地使用 UTC+8 标准时间；本版不做经度或真太阳时修正。'};
  return {ok:true,input:{date,time,place,traditionalSex:input?.traditionalSex??''}};
}
export async function calculateSymbolicBirth(raw){
  const checked=validateBirth(raw);
  if(!checked.ok)return checked;
  const {computeTraditionalCharts}=await import('./chart-vendor.js?v=self-model-1');
  return {ok:true,status:'CALCULATED',chart:computeTraditionalCharts(checked.input)};
}
