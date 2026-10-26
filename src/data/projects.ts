import catalog from "./cover-catalog.json";
export type ProjectAsset={type:"cover"|"motion"|"tracklist"|"canvas";label:string;src:string;hasAudio?:boolean};
export type CoverProject={slug:string;artistId:string;title:string;artist:string;year:string;cover:string;accent:string;tools:string[];services:string[];assets:ProjectAsset[]};
export const projects:CoverProject[]=catalog.map(item=>{
 const animated=item.assets.some(asset=>asset.type==="motion"||asset.type==="canvas");
 return {slug:item.id,artistId:item.artistId,title:item.title,artist:item.artist,year:item.year,cover:item.image,accent:"#baa77b",tools:["Adobe Photoshop",...(animated?["After Effects"]:[])],services:["Cover artwork",...(animated?["Motion design"]:[])],assets:item.assets as ProjectAsset[]};
});
export const projectBySlug=(slug:string)=>projects.find(project=>project.slug===slug);
