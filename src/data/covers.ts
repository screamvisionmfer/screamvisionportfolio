import catalog from "./cover-catalog.json";
export type CoverItem = {
  id:string;artistId:string;number:string;title:string;artist:string;year:string;image:string;motion?:string;
  backgroundFrom:string;backgroundTo:string;blobColor:string;accentColor:string;textColor:string;
  placeholder:{label:string;motif:"orbit"|"split"|"echo"|"signal"|"fold"|"pulse"};
};
const colors=["#b9aa84","#a88c78","#8a9d94","#9a90ab","#b49674","#829fa0"];
export const covers:CoverItem[]=catalog.map((item,index)=>({
  id:item.id,artistId:item.artistId,number:String(index+1).padStart(2,"0"),title:item.title,artist:item.artist,year:item.year,image:item.image,motion:item.motion,
  backgroundFrom:"#10120f",backgroundTo:"#080909",blobColor:colors[index%colors.length],accentColor:colors[index%colors.length],textColor:"#c5b48d",
  placeholder:{label:item.title,motif:"orbit"},
}));
