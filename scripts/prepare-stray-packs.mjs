import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const packs = [
 {folder:'STRAY CLUB',id:'stray-club',count:32,cover:'cover.jpg'},
 {folder:'STRAY TILL GOAT (GOAT)',id:'stray-till-goat',count:11,cover:'cover.jpg'},
 {folder:'STRAY TILL NINE',id:'stray-till-nine',count:24,cover:'COVER.jpg'},
];
const manifestPath='src/data/optimized-media.json';
const manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
sharp.concurrency(2);
let original=0,thumbs=0,previews=0;
for(const pack of packs){
 const dest=`public/cards/${pack.id}`;await fs.mkdir(dest,{recursive:true});
 for(const name of [pack.cover,...Array.from({length:pack.count},(_,i)=>`${i+1}.jpg`)]){
  const source=path.join('public/cards',pack.folder,name);
  const stem=name===pack.cover?'cover':path.parse(name).name;
  const preview=`/cards/${pack.id}/${stem}.webp`,thumb=`/optimized/${pack.id}-${stem}-640.webp`;
  original+=(await fs.stat(source)).size;
  for(const [size,url] of [[640,thumb],[1600,preview]]){
   await sharp(source).rotate().resize(size,size,{fit:'inside',withoutEnlargement:true}).webp({quality:size===640?80:87,effort:5}).toFile(`public${url}`);
   const bytes=(await fs.stat(`public${url}`)).size;
   if(size===640)thumbs+=bytes;else previews+=bytes;
  }
  manifest[preview]={'640':thumb,'1600':preview};
 }
 console.log(`${pack.folder}: ${pack.count} cards + cover ready`);
}
await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({originalMB:(original/1048576).toFixed(1),thumbnailsMB:(thumbs/1048576).toFixed(1),previewsMB:(previews/1048576).toFixed(1),savedPercent:Math.round((1-(thumbs+previews)/original)*100)}));
