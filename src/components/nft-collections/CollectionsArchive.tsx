"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { nftCollections } from "@/data/nft-collections";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { useModalFocus } from "@/components/viewer-controls/useModalFocus";
import { haptic } from "@/components/haptics/haptics";
import styles from "./collectionsArchive.module.css";
const worlds=[...nftCollections.map(item=>({id:item.id,name:item.name,chain:item.chain,supply:item.supply,banner:`/collections/${item.id}/banner.webp`})),{id:"soon",name:"Coming soon",chain:"NEXT CHAPTER",supply:0,banner:""}];
export function CollectionsArchive(){
 const [active,setActive]=useState(0),[opening,setOpening]=useState<number|null>(null);
 const overlay=useModalFocus<HTMLDivElement>(opening!==null&&worlds[opening].id==="soon"),origin=useRef<DOMRect|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),gesture=useRef<{x:number;y:number}|null>(null),swiped=useRef(false);
 const router=useRouter();
 useLayoutEffect(()=>{try{const id=new URLSearchParams(location.search).get("collection")??sessionStorage.getItem("collections:selected");const index=worlds.findIndex(item=>item.id===id);if(index>=0)setActive(index);}catch{}},[]);
 useEffect(()=>{const item=worlds[active];if(item.id!=="soon"){router.prefetch(`/collections/${item.id}`);try{sessionStorage.setItem("collections:selected",item.id);}catch{}}},[active,router]);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 useLayoutEffect(()=>{if(opening===null||!overlay.current||!origin.current)return;const rect=origin.current;const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
 const tween=gsap.fromTo(overlay.current,{clipPath:`inset(${rect.top}px ${Math.max(0,innerWidth-rect.right)}px ${Math.max(0,innerHeight-rect.bottom)}px ${rect.left}px round 14px)`,opacity:1},{clipPath:"inset(0px 0px 0px 0px round 0px)",duration:reduced?0:.8,ease:"power3.inOut",onComplete:()=>{if(worlds[opening].id!=="soon")timer.current=setTimeout(()=>window.dispatchEvent(new CustomEvent("portfolio:navigate",{detail:`/collections/${worlds[opening].id}`})),100);}});
 return()=>{tween.kill();};},[opening,overlay]);
 useEffect(()=>{if(opening===null||worlds[opening].id!=="soon")return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpening(null);};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[opening]);
 const select=(index:number)=>{if(opening!==null||active===index)return;setActive(index);haptic("select");};
 const enter=(index:number,element:HTMLElement)=>{if(opening!==null||swiped.current)return;origin.current=element.getBoundingClientRect();setOpening(index);haptic("select");};
 return <main className={`${styles.page} ${styles.expandedPage}`}>
 <SiteNav/>
 <header className={styles.expandedHeading}><p>SCREAM VISION / ORIGINAL WORLDS</p><h1>Collections<span>04</span></h1></header>
 <section className={styles.expandedRail} aria-label="Collection banners" onPointerDown={event=>{gesture.current={x:event.clientX,y:event.clientY};swiped.current=false;}} onPointerUp={event=>{if(!gesture.current)return;const dx=event.clientX-gesture.current.x,dy=event.clientY-gesture.current.y;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){swiped.current=true;select(Math.max(0,Math.min(worlds.length-1,active+(dx<0?1:-1))));}gesture.current=null;}} onPointerCancel={()=>{gesture.current=null;}}>
 {worlds.map((item,index)=><button key={item.id} className={styles.expandedCard} data-active={active===index} data-soon={item.id==="soon"} aria-label={`Open ${item.name}`} aria-expanded={active===index} onPointerEnter={event=>{if(event.pointerType==="mouse")select(index);}} onFocus={()=>select(index)} onClick={event=>{if(swiped.current){swiped.current=false;return;}if(active!==index){select(index);return;}enter(index,event.currentTarget);}} onKeyDown={event=>{if(event.key==="ArrowRight"||event.key==="ArrowLeft"){event.preventDefault();select(Math.max(0,Math.min(worlds.length-1,active+(event.key==="ArrowRight"?1:-1))));}}}>
 {item.banner?<Image src={item.banner} alt="" fill sizes="(max-width:700px) 85vw, 55vw" priority={index===0} draggable={false}/>:<span className={styles.soonArt} aria-hidden="true"><span>?</span></span>}
 <span className={styles.bannerShade}/><span className={styles.bannerIndex}>0{index+1}</span>
 <span className={styles.collapsedName}>{item.id==="soon"?"NEXT":item.name.split(" ")[0]}</span>
 <span className={styles.bannerCaption}><strong>{item.name}</strong><span><span>{item.chain}</span><span>{item.supply?`${item.supply.toLocaleString("en-US")} ARTWORKS`: "FOLLOW THE NEXT DROP"}</span><i aria-hidden="true">↗</i></span></span>
 </button>)}
 </section>
 <footer className={styles.expandedFooter}><span>SELECT A WORLD</span><nav aria-label="Choose collection">{worlds.map((item,index)=><button key={item.id} aria-label={`Select ${item.name}`} aria-current={active===index?"true":undefined} onClick={()=>select(index)}><span/></button>)}</nav><span>{String(active+1).padStart(2,"0")} / 04</span></footer>
 {opening!==null&&<div ref={overlay} className={styles.bannerExpansion} role={worlds[opening].id==="soon"?"dialog":undefined} aria-modal={worlds[opening].id==="soon"?true:undefined} aria-label={worlds[opening].name}>
 {worlds[opening].banner?<Image src={worlds[opening].banner} alt="" fill sizes="100vw" priority/>:<div className={styles.soonArt}><span>?</span></div>}
 <div className={styles.expansionShade}/><div className={styles.expansionTitle}><p>{worlds[opening].chain}</p><h2>{worlds[opening].name}</h2>{worlds[opening].id==="soon"&&<a href="https://x.com/scream_vision" target="_blank" rel="noopener noreferrer">FOLLOW ON X <span>↗</span></a>}</div>
 {worlds[opening].id==="soon"&&<button autoFocus className={styles.closeExpansion} aria-label="Close coming soon" onClick={()=>setOpening(null)}>✕</button>}
 </div>}
 </main>;
}
