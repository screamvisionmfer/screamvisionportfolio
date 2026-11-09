"use client";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { type NftCollection, type CollectionStat } from "@/data/nft-collections";
import traitCatalog from "@/data/collection-traits.json";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { useModalFocus } from "@/components/viewer-controls/useModalFocus";
import { haptic } from "@/components/haptics/haptics";
import { useCollectionMotion } from "./useCollectionMotion";
import styles from "./collectionsArchive.module.css";
import page from "./collectionProject.module.css";
const number=(n:number)=>n.toLocaleString("en-US");
const date=(value:string)=>new Date(value).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"});
function Count({value,active}:{value:number;active:boolean}){
 const ref=useRef<HTMLSpanElement>(null);
 useEffect(()=>{if(!active||!ref.current)return;let frame=0;const start=performance.now(),reduced=matchMedia("(prefers-reduced-motion:reduce)").matches;
 const tick=(now:number)=>{const t=reduced?1:Math.min(1,(now-start)/1000);if(ref.current)ref.current.textContent=number(Math.round(value*(1-Math.pow(1-t,3))));if(t<1)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[active,value]);
 return <span ref={ref}>{active?number(value):"0"}</span>;
}
export function CollectionProject({collection}:{collection:NftCollection}){
 const [selected,setSelected]=useState(0),[zoom,setZoom]=useState<number|null>(null),[stats,setStats]=useState<Record<string,CollectionStat>>({});
 const root=useRef<HTMLElement>(null),about=useRef<HTMLElement>(null),gallery=useRef<HTMLDivElement>(null),focus=useModalFocus<HTMLDivElement>(zoom!==null),gesture=useRef<{x:number;y:number}|null>(null),dragged=useRef(false);
 const revealed=useCollectionMotion(root,about);
 const traits=traitCatalog[collection.id as keyof typeof traitCatalog],count=collection.artworks.length,selectedIndex=Math.min(selected,count-1);
 const stat:CollectionStat=stats[collection.id]??{minted:collection.minted,asOf:collection.asOf,snapshot:true,...(collection.marketData?{holders:collection.marketData.holders,volume:collection.marketData.volume,currency:collection.marketData.currency,marketAsOf:collection.marketData.asOf,marketSnapshot:true}:{})};
 const volume=stat.volume!==undefined?new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}).format(stat.volume):collection.volume;
 const theme=collection.id==="bobros"?"#47151d":collection.id==="floaties"?"#153647":"#203a22";
 const move=(delta:number)=>{setSelected(value=>(value+delta+count)%count);haptic("tick");};
 const scrollAbout=()=>about.current?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"instant":"smooth",block:"start"});
 useEffect(()=>{const controller=new AbortController();void fetch("/api/collections",{signal:controller.signal}).then(response=>response.ok?response.json():{}).then(setStats).catch(()=>{});return()=>controller.abort();},[]);
 useEffect(()=>{if(zoom===null)return;const keys=(event:KeyboardEvent)=>{if(event.key==="Escape")setZoom(null);if(event.key==="ArrowRight")setZoom(value=>value===null?null:(value+1)%count);if(event.key==="ArrowLeft")setZoom(value=>value===null?null:(value-1+count)%count);};window.addEventListener("keydown",keys);return()=>window.removeEventListener("keydown",keys);},[zoom,count]);
 useEffect(()=>{const element=gallery.current;if(!element)return;let last=0,sum=0;const wheel=(event:WheelEvent)=>{if(event.ctrlKey||Math.abs(event.deltaX)<Math.abs(event.deltaY)&&Math.abs(event.deltaY)<2)return;event.preventDefault();const now=performance.now();if(now-last<550)return;sum+=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;if(Math.abs(sum)<16)return;const delta=sum>0?1:-1;sum=0;last=now;setSelected(value=>(value+delta+count)%count);haptic("tick");};element.addEventListener("wheel",wheel,{passive:false});return()=>element.removeEventListener("wheel",wheel);},[count]);
 const random=()=>{let next=Math.floor(Math.random()*(count-1));if(next>=selectedIndex)next++;setSelected(next);haptic("select");};
 return <main ref={root} className={page.page} style={{"--world-mood":theme,"--world-accent":collection.accent} as CSSProperties}>
  <SiteNav/>
  <div className={page.backdrop} aria-hidden="true"><Image key={collection.artworks[selectedIndex].src} src={collection.artworks[selectedIndex].src} alt="" fill sizes="60vw" unoptimized/><div/></div>
  <Link className={page.back} href={`/collections?collection=${collection.id}`} aria-label="Back to collections"><span>←</span> COLLECTIONS</Link>
  <section className={page.hero} aria-labelledby="collection-title">
   <header className={page.identity}><p>{collection.chain}</p><h1 id="collection-title">{collection.name}</h1><span>{collection.subtitle}</span><div className={page.links}><a href={collection.website} target="_blank" rel="noopener noreferrer">VISIT WEBSITE <i>↗</i></a><a href={collection.marketplace} target="_blank" rel="noopener noreferrer">{collection.marketLabel.toUpperCase()} <i>↗</i></a></div></header>
   <div className={page.stage}>
    <div ref={gallery} className={page.gallery} tabIndex={0} role="region" aria-label="Collection artwork carousel" onKeyDown={event=>{if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();move(event.key==="ArrowRight"?1:-1);}}} onPointerDown={event=>{gesture.current={x:event.clientX,y:event.clientY};dragged.current=false;}} onPointerUp={event=>{if(!gesture.current)return;const dx=event.clientX-gesture.current.x,dy=event.clientY-gesture.current.y;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)){dragged.current=true;move(dx<0?1:-1);}gesture.current=null;}} onPointerCancel={()=>{gesture.current=null;}}>
     {collection.artworks.map((art,index)=>{let offset=(index-selectedIndex+count)%count;if(offset>count/2)offset-=count;const visible=Math.abs(offset)<=1;return <button key={art.src} data-offset={Math.max(-2,Math.min(2,offset))} data-visible={visible} inert={!visible} aria-label={offset===0?`Inspect ${art.label}`:`Select ${art.label}`} onClick={()=>{if(dragged.current){dragged.current=false;return;}if(offset===0)setZoom(index);else{setSelected(index);haptic("select");}}}><Image src={art.src} alt={art.label} fill sizes="(max-width:700px) 75vw, 480px" priority={visible} unoptimized draggable={false}/></button>;})}
    </div>
    <nav className={page.controls} aria-label="Artwork navigation"><button aria-label="Previous artwork" onClick={()=>move(-1)}>←</button><span aria-live="polite">{String(selectedIndex+1).padStart(2,"0")} / {String(count).padStart(2,"0")}</span><button aria-label="Next artwork" onClick={()=>move(1)}>→</button><button aria-label="Random artwork" onClick={random}>⤨</button></nav>
   </div>
   <footer className={page.heroFooter}><div><span>{number(collection.supply)} ARTWORKS</span><span>{stat.minted===collection.supply?"SOLD OUT":`${number(stat.minted)} MINTED`}</span>{volume&&<span>{volume} {stat.currency??collection.currency} VOLUME</span>}</div><button onClick={scrollAbout}>ABOUT THE COLLECTION <span>↓</span></button></footer>
  </section>
  <section ref={about} className={page.about} data-revealed={revealed} aria-labelledby="collection-about-title">
   <div className={page.aboutHeading}><p>BEHIND THE COLLECTION</p><h2 id="collection-about-title">A world of<br/><em>its own.</em></h2><div><p>{collection.description}</p><span>{collection.craft}</span></div></div>
   <div className={page.metrics} aria-label="Collection metrics">
    <article><span>COLLECTION SIZE</span><strong><Count value={collection.supply} active={revealed}/></strong><div className={page.bar}><i style={{"--fill":1} as CSSProperties}/></div><small>{number(traits.tokens)} metadata records verified</small></article>
    <article><span>{stat.minted===collection.supply?"SOLD OUT / MINTED":"MINTED"}</span><strong><Count value={stat.minted} active={revealed}/><small> / {number(collection.supply)}</small></strong><div className={page.bar} role="progressbar" aria-label="Minted share of collection" aria-valuenow={stat.minted} aria-valuemin={0} aria-valuemax={collection.supply}><i style={{"--fill":stat.minted/collection.supply} as CSSProperties}/></div><small>{(stat.minted/collection.supply*100).toFixed(1)}% minted · {date(stat.asOf)}{stat.snapshot?" snapshot":""}</small></article>
    <article><span>TRAIT CATEGORIES</span><strong><Count value={traits.categories} active={revealed}/></strong><div className={page.metricLine}/><small><Count value={traits.variants} active={revealed}/> distinct trait variants</small></article>
    {stat.holders!==undefined&&<article><span>UNIQUE HOLDERS</span><strong><Count value={stat.holders} active={revealed}/></strong><div className={page.bar} role="progressbar" aria-label="Holders relative to collection size" aria-valuenow={stat.holders} aria-valuemin={0} aria-valuemax={collection.supply}><i style={{"--fill":stat.holders/collection.supply} as CSSProperties}/></div><small>{(stat.holders/collection.supply*100).toFixed(1)}% holders / supply · {date(stat.marketAsOf??collection.asOf)}</small></article>}
    {volume&&<article><span>TRADING VOLUME</span><strong>{volume}<small> {stat.currency??collection.currency}</small></strong><div className={page.metricLine}/><small>OpenSea {stat.marketSnapshot?"snapshot":"updated"} · {date(stat.marketAsOf??collection.asOf)}</small></article>}
   </div>
   <div className={page.traitHeading}><h3>Built from the details.</h3><p>Distinct variants per category. Open a category to see its most common traits.</p></div>
   <div className={page.traits}>{traits.traits.map(trait=><details key={trait.name} style={{"--fill":trait.variants/traits.traits[0].variants} as CSSProperties}><summary><span>{trait.name}</span><strong>{trait.variants}</strong><i>+</i><div className={page.bar}><i/></div></summary><div className={page.traitBreakdown}>{trait.top.map(item=><div key={item.value}><span>{item.value}</span><span>{number(item.count)} <small> / {(item.count/traits.tokens*100).toFixed(1)}%</small></span></div>)}</div></details>)}</div>
   <footer className={page.sources}><p>Traits calculated from {number(traits.tokens)} artist-provided metadata records. Rarity Rank excluded. Minted count is not secondary-market sales. {collection.id!=="floaties"&&"Mint data from LaunchMyNFT."}</p><a href={collection.marketplace} target="_blank" rel="noopener noreferrer">VIEW SOURCE ↗</a><button onClick={()=>root.current?.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"instant":"smooth"})}>BACK TO ARTWORKS ↑</button></footer>
  </section>
  {zoom!==null&&createPortal(<div ref={focus} className={styles.viewer} role="dialog" aria-modal="true" aria-label={collection.artworks[zoom%collection.artworks.length].label} onClick={event=>{if(event.target===event.currentTarget)setZoom(null);}}><button className={styles.close} onClick={()=>setZoom(null)} aria-label="Close artwork">×</button><div className={styles.viewerImage}><Image src={collection.artworks[zoom%collection.artworks.length].src} alt={collection.artworks[zoom%collection.artworks.length].label} fill sizes="90vw" unoptimized/></div><div className={styles.viewerFooter}><span>{collection.artworks[zoom%collection.artworks.length].label}</span><div><button aria-label="Previous artwork" onClick={()=>setZoom((zoom-1+collection.artworks.length)%collection.artworks.length)}>←</button><span>{zoom+1} / {collection.artworks.length}</span><button aria-label="Next artwork" onClick={()=>setZoom((zoom+1)%collection.artworks.length)}>→</button></div></div></div>,document.body)}
 </main>;
}
