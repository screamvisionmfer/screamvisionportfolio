"use client";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { type NftCollection, type CollectionStat } from "@/data/nft-collections";
import traitCatalog from "@/data/collection-traits.json";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { useModalFocus } from "@/components/viewer-controls/useModalFocus";
import { haptic } from "@/components/haptics/haptics";
import { CollectionMetric } from "./CollectionMetric";
import { useCollectionMotion } from "./useCollectionMotion";
import styles from "./collectionsArchive.module.css";
import page from "./collectionProject.module.css";
const number=(n:number)=>n.toLocaleString("en-US");
const date=(value:string)=>new Date(value).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"});
export function CollectionProject({collection}:{collection:NftCollection}){
 const [statsRun,setStatsRun]=useState(0);
 const [selected,setSelected]=useState(0),[zoom,setZoom]=useState<number|null>(null),[stats,setStats]=useState<Record<string,CollectionStat>>({});
 const root=useRef<HTMLElement>(null),about=useRef<HTMLElement>(null),gallery=useRef<HTMLDivElement>(null),focus=useModalFocus<HTMLDivElement>(zoom!==null),gesture=useRef<{x:number;y:number}|null>(null),dragged=useRef(false);
 const revealed=useCollectionMotion(root,about);
 const traits=traitCatalog[collection.id as keyof typeof traitCatalog];
 const artworks=useMemo(()=>[...collection.artworks,...traits.rarest.map(art=>({src:art.src,label:`${art.name} · Rank #${art.rank}`,source:collection.website}))],[collection.artworks,collection.website,traits.rarest]);
 const count=artworks.length,selectedIndex=Math.min(selected,count-1);
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
  <div className={page.backdrop} aria-hidden="true"><Image key={artworks[selectedIndex].src} src={artworks[selectedIndex].src} alt="" fill sizes="60vw" unoptimized/><div/></div>
  <Link className={page.back} href={`/collections?collection=${collection.id}`} aria-label="Back to collections"><span>←</span> COLLECTIONS</Link>
  <section className={page.hero} aria-labelledby="collection-title">
   <header className={page.identity}><p>{collection.chain}</p><h1 id="collection-title">{collection.name}</h1><span>{collection.subtitle}</span><div className={page.links}><a href={collection.website} target="_blank" rel="noopener noreferrer">VISIT WEBSITE <i>↗</i></a><a href={collection.marketplace} target="_blank" rel="noopener noreferrer">{collection.marketLabel.toUpperCase()} <i>↗</i></a></div></header>
   <div className={page.stage}>
    <div ref={gallery} className={page.gallery} tabIndex={0} role="region" aria-label="Collection artwork carousel" onKeyDown={event=>{if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();move(event.key==="ArrowRight"?1:-1);}}} onPointerDown={event=>{gesture.current={x:event.clientX,y:event.clientY};dragged.current=false;}} onPointerUp={event=>{if(!gesture.current)return;const dx=event.clientX-gesture.current.x,dy=event.clientY-gesture.current.y;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)){dragged.current=true;move(dx<0?1:-1);}gesture.current=null;event.currentTarget.style.setProperty("--drag-x","0px");}} onPointerMove={event=>{if(gesture.current){event.currentTarget.style.setProperty("--drag-x",`${Math.max(-45,Math.min(45,(event.clientX-gesture.current.x)*.22))}px`);}}} onPointerLeave={event=>{gesture.current=null;event.currentTarget.style.setProperty("--drag-x","0px");}} onPointerCancel={event=>{gesture.current=null;event.currentTarget.style.setProperty("--drag-x","0px");}}>
     {artworks.map((art,index)=>{let offset=(index-selectedIndex+count)%count;if(offset>count/2)offset-=count;const visible=Math.abs(offset)<=1;return <button key={art.src} data-offset={Math.max(-2,Math.min(2,offset))} data-visible={visible} inert={!visible} onPointerMove={event=>{if(offset!==0||event.pointerType==="touch"||matchMedia("(prefers-reduced-motion:reduce)").matches)return;const bounds=event.currentTarget.getBoundingClientRect(),x=(event.clientX-bounds.left)/bounds.width-.5,y=(event.clientY-bounds.top)/bounds.height-.5;event.currentTarget.style.setProperty("--art-rx",`${-y*8}deg`);event.currentTarget.style.setProperty("--art-ry",`${x*10}deg`);event.currentTarget.style.setProperty("--art-glare",`${(x+.5)*100}%`);}} onPointerLeave={event=>{event.currentTarget.style.setProperty("--art-rx","0deg");event.currentTarget.style.setProperty("--art-ry","0deg");}} aria-label={offset===0?`Inspect ${art.label}`:`Select ${art.label}`} onClick={()=>{if(dragged.current){dragged.current=false;return;}if(offset===0)setZoom(index);else{setSelected(index);haptic("select");}}}><span className={page.artFace}><Image src={art.src} alt={art.label} fill sizes="(max-width:700px) 75vw, 480px" priority={visible} unoptimized draggable={false}/><span className={page.artGlare}/><span className={page.lightSweep}/></span></button>;})}
    </div>
    <nav className={page.controls} aria-label="Artwork navigation"><button aria-label="Previous artwork" onClick={()=>move(-1)}>←</button><span key={selectedIndex} className={page.selectionCount} aria-live="polite">{String(selectedIndex+1).padStart(2,"0")} / {String(count).padStart(2,"0")}</span><button aria-label="Next artwork" onClick={()=>move(1)}>→</button><button aria-label="Random artwork" onClick={random}>⤨</button></nav>
    <span className={page.artCaption} key={artworks[selectedIndex].src}>{artworks[selectedIndex].label}</span>
   </div>
   <footer className={page.heroFooter}><div><span>{number(collection.supply)} ARTWORKS</span><span>{stat.minted===collection.supply?"SOLD OUT":`${number(stat.minted)} MINTED`}</span>{volume&&<span>{volume} {stat.currency??collection.currency} VOLUME</span>}</div><button onClick={scrollAbout}>ABOUT THE COLLECTION <span>↓</span></button></footer>
  </section>
  <section ref={about} className={page.about} data-revealed={revealed} aria-labelledby="collection-about-title">
   <div className={page.intelIntro}>
    <div><p className={page.sectionCode}>COLLECTION INTEL / {collection.chain.toUpperCase()}</p><h2 id="collection-about-title">{collection.shortName}<span>Beyond the artwork.</span></h2><p className={page.intelCopy}>{collection.description}</p><a className={page.intelSource} href={collection.descriptionSource??collection.website} target="_blank" rel="noopener noreferrer">FROM THE OFFICIAL COLLECTION SITE ↗</a></div>
    <div className={page.intelArt} aria-hidden="true">{traits.rarest.slice(0,2).map((art,index)=><span key={art.src} data-layer={index}><Image src={art.src} alt="" fill sizes="(max-width:700px) 60vw, 350px" unoptimized/></span>)}</div>
   </div>
   <div className={page.statsHeading}><span>COLLECTION / STATUS</span><button onClick={()=>setStatsRun(value=>value+1)}>REPLAY SCAN ↻</button></div>
   <div className={page.intelMetrics} data-extended={stat.holders!==undefined||!!volume} aria-label="Collection metrics" key={statsRun}>
    <CollectionMetric root={root} index={0} art={traits.rarest[0].src} label={stat.minted===collection.supply?"FULLY MINTED / SOLD OUT":"MINTED"} value={stat.minted} ratio={stat.minted/collection.supply} note={`${number(collection.supply)} edition · ${(stat.minted/collection.supply*100).toFixed(1)}% · ${date(stat.asOf)}${stat.snapshot?" snapshot":""}`}/>
    <CollectionMetric root={root} index={1} art={traits.rarest[1].src} label="TRAIT CATEGORIES" value={traits.categories} note="Distinct visual layers"/>
    <CollectionMetric root={root} index={2} art={traits.rarest[2].src} label="TRAIT VARIANTS" value={traits.variants} note="Original category / value combinations"/>
    {stat.holders!==undefined&&<CollectionMetric root={root} index={3} label="UNIQUE HOLDERS" value={stat.holders} ratio={stat.holders/collection.supply} note={`OpenSea · ${date(stat.marketAsOf??collection.asOf)}`}/>}
    {volume&&<CollectionMetric root={root} index={4} label="TRADING VOLUME" value={stat.volume??parseFloat(volume)*1000} compact unit={stat.currency??collection.currency} note={`OpenSea · ${date(stat.marketAsOf??collection.asOf)}${stat.marketSnapshot?" snapshot":""}`}/>}
   </div>
   <div className={page.mvpHeading}><p className={page.sectionCode}>RAREST IN THE COLLECTION</p><h3>The MVP lineup.</h3><span>Top ranks from the original collection metadata.</span></div>
   <div className={page.mvpGrid}>{traits.rarest.map((art,index)=><button key={art.src} onClick={()=>setZoom(collection.artworks.length+index)} aria-label={`Inspect ${art.name}, rarity rank ${art.rank}`}><span className={page.mvpArt}><Image src={art.src} alt={art.name} fill sizes="(max-width:700px) 75vw, 380px" unoptimized/><i>↗</i></span><span className={page.mvpRank}>RANK <strong>#{art.rank}</strong></span><span className={page.mvpName}>{art.name}</span></button>)}</div>
   <footer className={page.sources}><p>Rarity ranks and trait counts from the artist-provided metadata. Minted count is not secondary-market sales.</p><a href={collection.marketplace} target="_blank" rel="noopener noreferrer">MARKET DATA ↗</a><button onClick={()=>root.current?.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"instant":"smooth"})}>BACK TO ARTWORKS ↑</button></footer>
  </section>
  {zoom!==null&&createPortal(<div ref={focus} className={styles.viewer} role="dialog" aria-modal="true" aria-label={artworks[zoom%count].label} onClick={event=>{if(event.target===event.currentTarget)setZoom(null);}}><button className={styles.close} onClick={()=>setZoom(null)} aria-label="Close artwork">×</button><div className={styles.viewerImage}><Image src={artworks[zoom%count].src} alt={artworks[zoom%count].label} fill sizes="90vw" unoptimized/></div><div className={styles.viewerFooter}><span>{artworks[zoom%count].label}</span><div><button aria-label="Previous artwork" onClick={()=>setZoom((zoom-1+count)%count)}>←</button><span>{zoom+1} / {count}</span><button aria-label="Next artwork" onClick={()=>setZoom((zoom+1)%count)}>→</button></div></div></div>,document.body)}
 </main>;
}
