"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { nftCollections } from "@/data/nft-collections";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { CardRail } from "@/components/card-archive/CardRail";
import { CollectionWorldCard } from "./CollectionWorldCard";
import { haptic } from "@/components/haptics/haptics";
import styles from "./collectionsArchive.module.css";
export function CollectionsArchive(){
 const [active,setActive]=useState(1),[entering,setEntering]=useState<number|null>(null);
 const rail=useRef<HTMLDivElement>(null),busy=useRef(false),router=useRouter();
 const collection=nftCollections[active];
 useLayoutEffect(()=>{try{const id=new URLSearchParams(location.search).get("collection")??sessionStorage.getItem("collections:selected");const index=nftCollections.findIndex(item=>item.id===id);if(index>=0)setActive(index);}catch{}},[]);
 useEffect(()=>{router.prefetch(`/collections/${collection.id}`);try{sessionStorage.setItem("collections:selected",collection.id);}catch{}},[collection.id,router]);
 const explore=(index:number)=>{
  if(busy.current)return;
  if(index!==active){setActive(index);return;}
  busy.current=true;haptic("select");setEntering(index);
  window.dispatchEvent(new CustomEvent("portfolio:navigate",{detail:`/collections/${nftCollections[index].id}`}));
 };
 return <main className={`${styles.page} ${styles.archivePage}`} data-entering={entering!==null} style={{"--collection-accent":collection.accent,"--collection-mood":collection.mood} as CSSProperties}>
  <SiteNav/><div className={styles.atmosphere} aria-hidden="true"/>
  <header className={styles.archiveHeading}><p>SCREAM VISION / ORIGINAL WORLDS</p><h1>Collections<span>03</span></h1></header>
  <section className={styles.stage} aria-label="Choose a collection"><CardRail rootRef={rail} index={active} count={nftCollections.length} onActiveChange={index=>{if(!busy.current)setActive(index);}} wheelMode="steps" label="Collection carousel">
   {nftCollections.map((item,index)=><CollectionWorldCard key={item.id} collection={item} index={index} active={active===index} entering={entering===index} onExplore={()=>explore(index)}/>)}
  </CardRail></section>
  <footer className={styles.archiveFooter}><span>DRAG TO DISCOVER</span><nav className={styles.selector} aria-label="Collections">{nftCollections.map((item,index)=><button key={item.id} disabled={entering!==null} aria-current={index===active?"true":undefined} onClick={()=>setActive(index)}><small>0{index+1}</small>{item.shortName}</button>)}</nav><span>CLICK TO ENTER ↗</span></footer>
 </main>;
}
