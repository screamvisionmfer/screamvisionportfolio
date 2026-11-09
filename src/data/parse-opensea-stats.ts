/** Parse only a complete stats object adjacent to the verified collection name. */
export function parseOpenSeaStats(html:string,name:string,supply:number){
 const marker=`"stats":{"uniqueItemCount":${supply},`;let search=0;
 while(search<html.length){const start=html.indexOf(marker,search);if(start<0)return null;const begin=start+8;let depth=0,quoted=false,escaped=false,end=-1;
  for(let i=begin;i<Math.min(html.length,begin+25000);i++){const c=html[i];if(quoted){if(escaped)escaped=false;else if(c==="\\")escaped=true;else if(c==='"')quoted=false;}else if(c==='"')quoted=true;else if(c==="{")depth++;else if(c==="}"&&--depth===0){end=i+1;break;}}
  search=start+marker.length;if(end<0||!html.slice(end,end+name.length+16).startsWith(`,"name":${JSON.stringify(name)}`))continue;
  const data=JSON.parse(html.slice(begin,end)),holders=data.ownerCount,volume=data.volume?.native?.unit,currency=data.volume?.native?.symbol;
  if(data.totalSupply!==supply||!Number.isInteger(holders)||holders<0||holders>supply||typeof volume!=="number"||!Number.isFinite(volume)||volume<0||currency!=="USDG")return null;
  return {holders:holders as number,volume:volume as number,currency:currency as string};
 }return null;
}
