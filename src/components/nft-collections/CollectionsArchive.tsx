"use client";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { nftCollections, type CollectionStat } from "@/data/nft-collections";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { CardRail } from "@/components/card-archive/CardRail";
import { useModalFocus } from "@/components/viewer-controls/useModalFocus";
import { haptic } from "@/components/haptics/haptics";
import styles from "./collectionsArchive.module.css";
const number=(n:number)=>n.toLocaleString("en-US");
const date=(value:string)=>new Date(value).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"});
export function CollectionsArchive(){
 const [active,setActive]=useState(1),[selected,setSelected]=useState(0),[zoom,setZoom]=useState<number|null>(null);
 const [stats,setStats]=useState<Record<string,CollectionStat>>({});
 const rail=useRef<HTMLDivElement>(null),details=useRef<HTMLElement>(null),focus=useModalFocus<HTMLDivElement>(zoom!==null);
 const collection=nftCollections[active],stat=stats[collection.id]??{minted:collection.minted,asOf:collection.asOf,snapshot:true};
 const selectedIndex=Math.min(selected,collection.artworks.length-1);
 useEffect(()=>{const controller=new AbortController();void fetch("/api/collections",{signal:controller.signal}).then(response=>response.ok?response.json():{}).then(data=>setStats(data)).catch(()=>{});return()=>controller.abort();},[]);
 useEffect(()=>{setSelected(0);setZoom(null);},[active]);
 useEffect(()=>{
  if(zoom===null)return;
  const keys=(event:KeyboardEvent)=>{if(event.key==="Escape")setZoom(null);if(event.key==="ArrowRight")setZoom(value=>value===null?null:(value+1)%collection.artworks.length);if(event.key==="ArrowLeft")setZoom(value=>value===null?null:(value-1+collection.artworks.length)%collection.artworks.length);};
  window.addEventListener("keydown",keys);return()=>window.removeEventListener("keydown",keys);
 },[zoom,collection.artworks.length]);
 const explore=(index:number)=>{if(index!==active){setActive(index);return;}details.current?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"instant":"smooth",block:"start"});};
 const random=()=>{const count=collection.artworks.length;let next=Math.floor(Math.random()*(count-1));if(next>=selectedIndex)next++;setSelected(next);haptic("select");};
 return <main className={styles.page} style={{"--collection-accent":collection.accent,"--collection-mood":collection.mood} as CSSProperties}>
  <SiteNav/>
  <div className={styles.atmosphere} aria-hidden="true"/>
  <header className={styles.heading}><p>ORIGINAL WORLDS / SCREAM VISION</p><h1>Collections<span> / 03</span></h1><div><span>3 WORLDS</span><i/><span>5,221 CHARACTERS</span></div></header>
  <section className={styles.stage} aria-label="Choose a collection">
   <CardRail rootRef={rail} index={active} count={nftCollections.length} onActiveChange={setActive} wheelMode="steps" label="Collection carousel">
    {nftCollections.map((item,index)=><button key={item.id} className={styles.world} data-active={active===index} aria-pressed={active===index} aria-label={active===index?`Explore ${item.name}`:`Select ${item.name}`} onClick={()=>explore(index)}>
     <span className={styles.stack}>{[2,1,0].map((art,i)=><span key={art} className={styles.stackArt} style={{"--layer":i} as CSSProperties}><Image src={item.artworks[art].src} alt="" fill sizes="(max-width:700px) 65vw, 330px" priority={index===0&&art===0} unoptimized draggable={false}/></span>)}</span>
     <span className={styles.worldLabel}><small>{item.chain}</small><strong>{item.shortName}</strong><span>{number(item.supply)} ARTWORKS <i aria-hidden="true">↗</i></span></span>
    </button>)}
   </CardRail>
  </section>
  <nav className={styles.selector} aria-label="Collections">{nftCollections.map((item,index)=><button key={item.id} aria-current={index===active?"true":undefined} onClick={()=>setActive(index)}><small>0{index+1}</small>{item.shortName}</button>)}</nav>
  <section ref={details} className={styles.details} aria-labelledby="collection-title" key={collection.id}>
   <div className={styles.introduction}><p className={styles.eyebrow}>{collection.chain} <span>ORIGINAL COLLECTION</span></p><h2 id="collection-title">{collection.name}</h2><p className={styles.tagline}>{collection.subtitle}</p><p className={styles.description}>{collection.description}</p><span className={styles.craft}>{collection.craft}</span><div className={styles.links}><a href={collection.website} target="_blank" rel="noopener noreferrer">VISIT WEBSITE <span aria-hidden="true">↗</span></a><a href={collection.marketplace} target="_blank" rel="noopener noreferrer">{collection.marketLabel} <span aria-hidden="true">↗</span></a></div></div>
   <aside className={styles.stats} aria-label="Collection information"><div className={styles.progressTitle}><span>{stat.minted===collection.supply?"SOLD OUT":"MINTED"}</span><strong>{number(stat.minted)} <small>/ {number(collection.supply)}</small></strong></div><div className={styles.progress} role="progressbar" aria-label="Collection mint progress" aria-valuemin={0} aria-valuemax={collection.supply} aria-valuenow={stat.minted}><span style={{transform:`scaleX(${stat.minted/collection.supply})`}}/></div><div className={styles.statGrid}><div><span>COLLECTION SIZE</span><strong>{number(collection.supply)}</strong></div>{collection.volume?<div><span>TRADING VOLUME</span><strong>{collection.volume}<small> {collection.currency}</small></strong></div>:<div><span>MINT PROGRESS</span><strong>{(stat.minted/collection.supply*100).toFixed(1)}<small>%</small></strong></div>}</div><p className={styles.source}>{collection.id==="floaties"?"Sold out confirmed by the artist. OpenSea volume snapshot":`LaunchMyNFT mint count${stat.snapshot?" · saved snapshot":""}`}<br/>{date(stat.asOf)}</p></aside>
   <div className={styles.showcase}><div className={styles.showcaseArt}><button onClick={()=>setZoom(selectedIndex)} aria-label={`Inspect ${collection.artworks[selectedIndex].label}`}><Image key={collection.artworks[selectedIndex].src} src={collection.artworks[selectedIndex].src} alt={collection.artworks[selectedIndex].label} fill sizes="(max-width:700px) 85vw, 480px" unoptimized/><span aria-hidden="true">↗</span></button></div><div className={styles.showcaseInfo}><p className={styles.eyebrow}>MEET THE CHARACTERS</p><h3>A different<br/> face. Same world.</h3><p>Original artwork from {collection.name}.</p><button className={styles.random} onClick={random}><span aria-hidden="true">⤨</span> MEET ANOTHER CHARACTER</button><span className={styles.sampleLabel}>{collection.artworks[selectedIndex].label}</span></div></div>
   <div className={styles.galleryHeader}><h3>Inside the collection</h3><span>{collection.artworks.length} SELECTED ARTWORKS</span></div>
   <div className={styles.gallery}>{collection.artworks.map((art,index)=><button key={art.src} onClick={()=>{setSelected(index);setZoom(index);}} aria-label={`Inspect ${art.label}`}><Image src={art.src} alt={art.label} fill sizes="(max-width:700px) 44vw, 280px" unoptimized/><span aria-hidden="true">↗</span></button>)}</div>
   <footer className={styles.footer}><span>SELECTED PREVIEWS / {number(collection.supply)} IN THE FULL COLLECTION</span><a href={collection.website} target="_blank" rel="noopener noreferrer">EXPLORE THE FULL WORLD ↗</a></footer>
  </section>
  {zoom!==null&&createPortal(<div ref={focus} className={styles.viewer} role="dialog" aria-modal="true" aria-label={collection.artworks[zoom%collection.artworks.length].label} onClick={event=>{if(event.target===event.currentTarget)setZoom(null);}}><button className={styles.close} onClick={()=>setZoom(null)} aria-label="Close artwork">×</button><div className={styles.viewerImage}><Image src={collection.artworks[zoom%collection.artworks.length].src} alt={collection.artworks[zoom%collection.artworks.length].label} fill sizes="90vw" unoptimized/></div><div className={styles.viewerFooter}><span>{collection.artworks[zoom%collection.artworks.length].label}</span><div><button aria-label="Previous artwork" onClick={()=>setZoom((zoom-1+collection.artworks.length)%collection.artworks.length)}>←</button><span>{zoom+1} / {collection.artworks.length}</span><button aria-label="Next artwork" onClick={()=>setZoom((zoom+1)%collection.artworks.length)}>→</button></div></div></div>,document.body)}
 </main>;
}
