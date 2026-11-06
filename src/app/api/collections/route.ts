import { nftCollections, type CollectionStat } from "@/data/nft-collections";
export const revalidate=1800;
export async function GET(){
 const entries=await Promise.all(nftCollections.map(async collection=>{
  const fallback:CollectionStat={minted:collection.minted,asOf:collection.asOf,snapshot:true};
  if(collection.id==="floaties")return [collection.id,fallback] as const;
  try{
   const response=await fetch(collection.marketplace,{next:{revalidate:1800},signal:AbortSignal.timeout(7000)});
   if(!response.ok)throw new Error("Source unavailable");
   const html=await response.text(),match=html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
   if(!match)throw new Error("Source changed");
   const data=JSON.parse(match[1]).props?.pageProps?.collection;
   const minted=data?.totalMints;
   if(data?.collectionName!==collection.name||data?.maxSupply!==collection.supply||!Number.isInteger(minted)||minted<0||minted>collection.supply)throw new Error("Invalid source data");
   // Source timestamps remain accurate when upstream fetches are served from cache.
   const modified=response.headers.get("date"),date=modified?new Date(modified):new Date();
   return [collection.id,{minted,asOf:Number.isNaN(date.valueOf())?new Date().toISOString():date.toISOString(),snapshot:false} satisfies CollectionStat] as const;
  }catch{return [collection.id,fallback] as const;}
 }));
 return Response.json(Object.fromEntries(entries),{headers:{"Cache-Control":"public, s-maxage=1800, stale-while-revalidate=3600"}});
}
