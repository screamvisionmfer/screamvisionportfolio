"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { nftCollections } from "@/data/nft-collections";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { CardRail } from "@/components/card-archive/CardRail";
import Image from "next/image";
import { CollectionWorldCard, collectionCover } from "./CollectionWorldCard";
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
  <SiteNav/>
  <div className={styles.consoleBackdrop} aria-hidden="true">{nftCollections.map((item,index)=><div key={item.id} data-active={active===index}><Image src={collectionCover(item)} alt="" fill sizes="100vw" priority={index===active} unoptimized/></div>)}</div>
  <header className={styles.consoleHeading}><h1>Collections</h1></header>
  <section key={collection.id} className={styles.featuredCollection} aria-label="Selected collection"><h2>{collection.shortName}</h2><p>{collection.subtitle}</p><button onClick={()=>explore(active)} disabled={entering!==null}>EXPLORE COLLECTION <span aria-hidden="true">↗</span></button></section>
  <section className={styles.stage} aria-label="Choose a collection"><CardRail rootRef={rail} index={active} count={nftCollections.length} onActiveChange={index=>{if(!busy.current)setActive(index);}} wheelMode="steps" touchDrag presentation="flat" label="Collection carousel">
   {nftCollections.map((item,index)=><CollectionWorldCard key={item.id} collection={item} active={active===index} entering={entering===index} onExplore={()=>explore(index)}/>)}
  </CardRail></section>
  <footer className={styles.consoleFooter}><span>SWIPE OR DRAG TO BROWSE</span><nav aria-label="Choose collection">{nftCollections.map((item,index)=><button key={item.id} aria-label={`Select ${item.name}`} aria-current={index===active?"true":undefined} disabled={entering!==null} onClick={()=>setActive(index)}><span/></button>)}</nav><span>{String(active+1).padStart(2,"0")} / 03</span></footer>
 </main>;
}
