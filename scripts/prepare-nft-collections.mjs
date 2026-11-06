import { readFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const collections=JSON.parse(await readFile(new URL("../src/data/nft-collections.json",import.meta.url),"utf8"));
for(const collection of collections){
 for(const art of collection.artworks){
  const response=await fetch(art.source,{signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error(`Cannot download ${art.source}: ${response.status}`);
  const destination=resolve("public",art.src.replace(/^\//,""));
  await mkdir(dirname(destination),{recursive:true});
  await sharp(Buffer.from(await response.arrayBuffer())).resize({width:900,height:900,fit:"inside",withoutEnlargement:true}).webp({quality:85}).toFile(destination);
 }
 console.log(`${collection.name}: ${collection.artworks.length} previews prepared`);
}
