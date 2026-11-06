"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { NftCollection } from "@/data/nft-collections";
import { isPageActive, observePageActivity } from "@/components/site-nav/pageActivity";
import styles from "./collectionsArchive.module.css";

export function CollectionWorldCard({collection,index,active,onExplore}:{collection:NftCollection;index:number;active:boolean;onExplore:()=>void}){
 const root=useRef<HTMLButtonElement>(null),[art,setArt]=useState(0);
 useEffect(()=>{
  const el=root.current;if(!el)return;
  const reduced=matchMedia("(prefers-reduced-motion:reduce)");let timer:ReturnType<typeof setInterval>|undefined,visible=false;
  const sync=()=>{clearInterval(timer);if(active&&visible&&!reduced.matches&&isPageActive())timer=setInterval(()=>setArt(value=>(value+1)%collection.artworks.length),4200);};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(el);const stop=observePageActivity(sync);reduced.addEventListener("change",sync);
  return()=>{clearInterval(timer);observer.disconnect();stop();reduced.removeEventListener("change",sync);};
 },[active,collection.artworks.length]);
 const move=(event:PointerEvent<HTMLButtonElement>)=>{
  if(event.pointerType==="touch"||matchMedia("(prefers-reduced-motion:reduce)").matches)return;
  const rect=event.currentTarget.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;
  event.currentTarget.style.setProperty("--case-rx",`${-y*7}deg`);event.currentTarget.style.setProperty("--case-ry",`${x*10}deg`);event.currentTarget.style.setProperty("--light-x",`${(x+.5)*100}%`);event.currentTarget.style.setProperty("--light-y",`${(y+.5)*100}%`);
 };
 const reset=()=>{root.current?.style.setProperty("--case-rx","0deg");root.current?.style.setProperty("--case-ry","0deg");};
 return <button ref={root} className={styles.world} style={{"--world-tint":collection.accent,"--world-mood":collection.mood} as CSSProperties} data-active={active} aria-pressed={active} aria-label={active?`Explore ${collection.name}`:`Select ${collection.name}`} onClick={onExplore} onPointerMove={move} onPointerLeave={reset} onBlur={reset}>
  <span className={styles.worldHalo}/><span className={styles.worldShadow}/>
  <span className={styles.worldObject}><span className={styles.worldSpine} aria-hidden="true">{collection.shortName} / ORIGINAL WORLD</span><span className={styles.worldFace}>
   <span className={styles.worldArtwork}>{collection.artworks.map((image,i)=>(i===art||i===(art+collection.artworks.length-1)%collection.artworks.length||i===(art+1)%collection.artworks.length)&&<span key={image.src} data-visible={i===art}><Image src={image.src} alt="" fill sizes="(max-width:700px) 72vw, 430px" unoptimized priority={active&&i===0} draggable={false}/></span>)}</span>
   <span className={styles.worldShade}/><span className={styles.worldLight}/>
   <span className={styles.worldTop}><small>WORLD / 0{index+1}</small><span>{collection.chain}</span></span>
   <span className={styles.worldIdentity}><small>{collection.id==="floaties"?"ENDLESS SUMMER":collection.id==="groypers"?"ALPHA SQUADRON":"MIXED-MEDIA UNIVERSE"}</small><strong>{collection.shortName}</strong><span>{collection.supply.toLocaleString("en-US")} ORIGINAL ARTWORKS</span><span className={styles.worldEnter}>{active?"ENTER WORLD":"SELECT WORLD"} <i aria-hidden="true">↗</i></span></span>
   <span className={styles.worldEtching} aria-hidden="true"/>
  </span></span>
 </button>;
}
