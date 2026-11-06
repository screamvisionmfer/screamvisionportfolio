"use client";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { type NftCollection, type CollectionStat } from "@/data/nft-collections";
import { SiteNav } from "@/components/site-nav/SiteNav";
import Link from "next/link";
import { useModalFocus } from "@/components/viewer-controls/useModalFocus";
import { haptic } from "@/components/haptics/haptics";
import styles from "./collectionsArchive.module.css";

const number=(n:number)=>n.toLocaleString("en-US");
const date=(value:string)=>new Date(value).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"});
export function CollectionProject({collection}:{collection:NftCollection}){
 const [selected,setSelected]=useState(0),[zoom,setZoom]=useState<number|null>(null);
 const [stats,setStats]=useState<Record<string,CollectionStat>>({});
 const details=useRef<HTMLElement>(null),focus=useModalFocus<HTMLDivElement>(zoom!==null);
 const stat=stats[collection.id]??{minted:collection.minted,asOf:collection.asOf,snapshot:true};
 const selectedIndex=Math.min(selected,collection.artworks.length-1);
 useEffect(()=>{const controller=new AbortController();void fetch("/api/collections",{signal:controller.signal}).then(response=>response.ok?response.json():{}).then(setStats).catch(()=>{});return()=>controller.abort();},[]);
 useEffect(()=>{
  if(zoom===null)return;
  const keys=(event:KeyboardEvent)=>{if(event.key==="Escape")setZoom(null);if(event.key==="ArrowRight")setZoom(value=>value===null?null:(value+1)%collection.artworks.length);if(event.key==="ArrowLeft")setZoom(value=>value===null?null:(value-1+collection.artworks.length)%collection.artworks.length);};
  window.addEventListener("keydown",keys);return()=>window.removeEventListener("keydown",keys);
 },[zoom,collection.artworks.length]);
 const random=()=>{let next=Math.floor(Math.random()*(collection.artworks.length-1));if(next>=selectedIndex)next++;setSelected(next);haptic("select");};
 return <main className={`${styles.page} ${styles.projectPage}`} style={{"--collection-accent":collection.accent,"--collection-mood":collection.mood} as CSSProperties}>
  <SiteNav/><div className={styles.atmosphere} aria-hidden="true"/>
  <Link className={styles.backToArchive} href={`/collections?collection=${collection.id}`} aria-label="Back to collections"><span aria-hidden="true">←</span> COLLECTIONS</Link>
  <section ref={details} className={styles.details} aria-labelledby="collection-title" key={collection.id}>
   <div className={styles.introduction}><p className={styles.eyebrow}>{collection.chain} <span>ORIGINAL COLLECTION</span></p><h1 id="collection-title">{collection.name}</h1><p className={styles.tagline}>{collection.subtitle}</p><p className={styles.description}>{collection.description}</p><span className={styles.craft}>{collection.craft}</span><div className={styles.links}><a href={collection.website} target="_blank" rel="noopener noreferrer">VISIT WEBSITE <span aria-hidden="true">↗</span></a><a href={collection.marketplace} target="_blank" rel="noopener noreferrer">{collection.marketLabel} <span aria-hidden="true">↗</span></a></div></div>
   <aside className={styles.stats} aria-label="Collection information"><div className={styles.progressTitle}><span>{stat.minted===collection.supply?"SOLD OUT":"MINTED"}</span><strong>{number(stat.minted)} <small>/ {number(collection.supply)}</small></strong></div><div className={styles.progress} role="progressbar" aria-label="Collection mint progress" aria-valuemin={0} aria-valuemax={collection.supply} aria-valuenow={stat.minted}><span style={{transform:`scaleX(${stat.minted/collection.supply})`}}/></div><div className={styles.statGrid}><div><span>COLLECTION SIZE</span><strong>{number(collection.supply)}</strong></div>{collection.volume?<div><span>TRADING VOLUME</span><strong>{collection.volume}<small> {collection.currency}</small></strong></div>:<div><span>MINT PROGRESS</span><strong>{(stat.minted/collection.supply*100).toFixed(1)}<small>%</small></strong></div>}</div><p className={styles.source}>{collection.id==="floaties"?"Sold out confirmed by the artist. OpenSea volume snapshot":`LaunchMyNFT mint count${stat.snapshot?" · saved snapshot":""}`}<br/>{date(stat.asOf)}</p></aside>
   <div className={styles.showcase}><div className={styles.showcaseArt}><button onClick={()=>setZoom(selectedIndex)} aria-label={`Inspect ${collection.artworks[selectedIndex].label}`}><Image key={collection.artworks[selectedIndex].src} src={collection.artworks[selectedIndex].src} alt={collection.artworks[selectedIndex].label} fill sizes="(max-width:700px) 85vw, 480px" unoptimized/><span aria-hidden="true">↗</span></button></div><div className={styles.showcaseInfo}><p className={styles.eyebrow}>MEET THE CHARACTERS</p><h3>A different<br/> face. Same world.</h3><p>Original artwork from {collection.name}.</p><button className={styles.random} onClick={random}><span aria-hidden="true">⤨</span> MEET ANOTHER CHARACTER</button><span className={styles.sampleLabel}>{collection.artworks[selectedIndex].label}</span></div></div>
   <div className={styles.galleryHeader}><h3>Inside the collection</h3><span>{collection.artworks.length} SELECTED ARTWORKS</span></div>
   <div className={styles.gallery}>{collection.artworks.map((art,index)=><button key={art.src} onClick={()=>{setSelected(index);setZoom(index);}} aria-label={`Inspect ${art.label}`}><Image src={art.src} alt={art.label} fill sizes="(max-width:700px) 44vw, 280px" unoptimized/><span aria-hidden="true">↗</span></button>)}</div>
   <footer className={styles.footer}><span>SELECTED PREVIEWS / {number(collection.supply)} IN THE FULL COLLECTION</span><a href={collection.website} target="_blank" rel="noopener noreferrer">EXPLORE THE FULL WORLD ↗</a></footer>
  </section>
  {zoom!==null&&createPortal(<div ref={focus} className={styles.viewer} role="dialog" aria-modal="true" aria-label={collection.artworks[zoom%collection.artworks.length].label} onClick={event=>{if(event.target===event.currentTarget)setZoom(null);}}><button className={styles.close} onClick={()=>setZoom(null)} aria-label="Close artwork">×</button><div className={styles.viewerImage}><Image src={collection.artworks[zoom%collection.artworks.length].src} alt={collection.artworks[zoom%collection.artworks.length].label} fill sizes="90vw" unoptimized/></div><div className={styles.viewerFooter}><span>{collection.artworks[zoom%collection.artworks.length].label}</span><div><button aria-label="Previous artwork" onClick={()=>setZoom((zoom-1+collection.artworks.length)%collection.artworks.length)}>←</button><span>{zoom+1} / {collection.artworks.length}</span><button aria-label="Next artwork" onClick={()=>setZoom((zoom+1)%collection.artworks.length)}>→</button></div></div></div>,document.body)}
 </main>;
}
