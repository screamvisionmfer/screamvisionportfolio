import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import sharp from 'sharp';
const exec=promisify(execFile), root=process.cwd();
const ffmpeg=process.argv[2];if(!ffmpeg)throw Error('Pass ffmpeg executable');
const sourceRoot=path.join(root,'assets/originals/covers');
const sources=JSON.parse(await fs.readFile('scripts/cover-sources.json','utf8'));
const manifestPath='src/data/optimized-media.json',manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
for(const k of Object.keys(manifest))if(k.startsWith('/covers/'))delete manifest[k];
const catalog=[];let originalBytes=0,readyBytes=0;
sharp.concurrency(2);
for(const [index,project] of sources.entries()){
 const relative=`/covers/${project.artistId}/${project.id}`;await fs.mkdir(`public${relative}`,{recursive:true});
 const counters={cover:0,motion:0,canvas:0,tracklist:0};
 const assets=[];
 for(const asset of [{source:project.source,type:'cover',label:project.credit?`Final cover · ${project.credit}`:'Final cover'},...project.assets]){
  const n=++counters[asset.type],name=asset.type+(n>1?`-${n}`:'');
  const video=asset.type==='motion'||asset.type==='canvas',src=`${relative}/${name}.${video?'mp4':'webp'}`,input=path.join(sourceRoot,asset.source),output=path.join(root,'public'+src);
  originalBytes+=(await fs.stat(input)).size;
  if(video){
   if(!(await fs.stat(output).catch(()=>null))){
    await exec(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-y','-i',input,'-map','0:v:0','-map','0:a?','-vf','scale=960:960:force_original_aspect_ratio=decrease:force_divisible_by=2,fps=30','-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart','-threads','2',output],{maxBuffer:1024*1024});
   }
  }else{
   const thumb=`/optimized/cover-${project.id}-${name}-640.webp`;
   if(!(await fs.stat(output).catch(()=>null)))await sharp(input).rotate().resize(1600,1600,{fit:'inside',withoutEnlargement:true}).webp({quality:86,effort:4}).toFile(output);
   if(!(await fs.stat('public'+thumb).catch(()=>null)))await sharp(input).rotate().resize(640,640,{fit:'inside',withoutEnlargement:true}).webp({quality:80,effort:4}).toFile('public'+thumb);
   manifest[src]={'640':thumb,'1600':src};readyBytes+=(await fs.stat('public'+thumb)).size;
  }
  readyBytes+=(await fs.stat(output)).size;
  assets.push({type:asset.type,label:n>1&&asset.type==='tracklist'?`Tracklist ${n}`:asset.label,src,...(asset.type==='canvas'?{hasAudio:false}:{})});
 }
 catalog.push({id:project.id,artistId:project.artistId,artist:project.artist,title:project.title,year:project.year,image:assets[0].src,motion:assets.find(a=>a.type==='motion')?.src,assets});
 console.log(`${index+1}/${sources.length} ${project.artist} / ${project.title}`);
}
await fs.writeFile('src/data/cover-catalog.json',JSON.stringify(catalog,null,2)+'\n');
await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({originalMB:Math.round(originalBytes/1048576),readyMB:Math.round(readyBytes/1048576),savedPercent:Math.round(100*(1-readyBytes/originalBytes))}));
