"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { nftCollections } from "@/data/nft-collections";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { useModalFocus } from "@/components/viewer-controls/useModalFocus";
import { haptic } from "@/components/haptics/haptics";
import styles from "./collectionsArchive.module.css";
const worlds=[...nftCollections.map(item=>({id:item.id,name:item.name,chain:item.chain,supply:item.supply,glow:item.id==="floaties"?"#137ad9":item.id==="bobros"?"#b32e23":"#7e9635",banner:`/collections/${item.id}/banner.webp`})),{id:"soon",name:"Coming soon",chain:"NEXT CHAPTER",supply:0,glow:"#9b8b62",banner:""}];
export function CollectionsArchive(){
 const [active,setActive]=useState(0),[opening,setOpening]=useState<number|null>(null);
 const overlay=useModalFocus<HTMLDivElement>(opening!==null&&worlds[opening].id==="soon"),origin=useRef<DOMRect|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),gesture=useRef<{x:number;y:number}|null>(null),swiped=useRef(false);
 const artwork=useRef<HTMLDivElement>(null);
 const progress=useRef<HTMLSpanElement>(null),fill=useRef<HTMLDivElement>(null),title=useRef<HTMLDivElement>(null);
 const router=useRouter();
 useLayoutEffect(()=>{try{const id=new URLSearchParams(location.search).get("collection")??sessionStorage.getItem("collections:selected");const index=worlds.findIndex(item=>item.id===id);if(index>=0)setActive(index);}catch{}},[]);
 useEffect(()=>{const item=worlds[active];if(item.id!=="soon"){router.prefetch(`/collections/${item.id}`);try{sessionStorage.setItem("collections:selected",item.id);}catch{}}},[active,router]);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 useLayoutEffect(()=>{if(opening===null||!overlay.current||!origin.current)return;const rect=origin.current;const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
 const isSoon=worlds[opening].id==="soon",desktop=matchMedia("(min-width:701px)").matches,meter={value:0};
 const timeline=gsap.timeline();
 if(desktop&&!isSoon&&artwork.current){
  const target=artwork.current.getBoundingClientRect();
  timeline.fromTo(overlay.current,{opacity:0},{opacity:1,duration:reduced?0:.4},0);
  timeline.fromTo(artwork.current,{x:rect.left+rect.width/2-target.left-target.width/2,y:rect.top+rect.height/2-target.top-target.height/2,scale:Math.min(rect.width/target.width,rect.height/target.height),opacity:.7},{x:0,y:0,scale:1,opacity:1,duration:reduced?0:1.35,ease:"power3.inOut"},0);
 }else timeline.fromTo(overlay.current,{clipPath:`inset(${rect.top}px ${Math.max(0,innerWidth-rect.right)}px ${Math.max(0,innerHeight-rect.bottom)}px ${rect.left}px round 14px)`,opacity:1},{clipPath:"inset(0px 0px 0px 0px round 0px)",duration:reduced?0:1.55,ease:"power3.inOut"},0);
 if(title.current)timeline.fromTo(title.current,{opacity:0,y:12},{opacity:1,y:0,duration:reduced?0:.55},reduced?0:.55);
 if(!isSoon){
  if(fill.current)timeline.fromTo(fill.current,{clipPath:"inset(100% 0 0 0)"},{clipPath:"inset(0% 0 0 0)",duration:reduced?0:2.35,ease:"power1.inOut"},0);
  timeline.to(meter,{value:100,duration:reduced?0:2.35,ease:"power1.inOut",onUpdate:()=>{if(progress.current)progress.current.textContent=String(Math.round(meter.value)).padStart(2,"0");overlay.current?.style.setProperty("--opening-progress",String(meter.value/100));}},0);
  if(title.current)timeline.to(title.current,{opacity:0,y:-8,duration:reduced?0:.45},reduced?0:2.2);
  timeline.call(()=>window.dispatchEvent(new CustomEvent("portfolio:navigate",{detail:`/collections/${worlds[opening].id}`})),[],reduced?0:2.7);
 }
 return()=>{timeline.kill();};},[opening,overlay]);
 useEffect(()=>{if(opening===null||worlds[opening].id!=="soon")return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpening(null);};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[opening]);
 const select=(index:number)=>{if(opening!==null||active===index)return;setActive(index);haptic("select");};
 const enter=(index:number,element:HTMLElement)=>{if(opening!==null||swiped.current)return;origin.current=element.getBoundingClientRect();setOpening(index);haptic("select");};
 return <main className={`${styles.page} ${styles.expandedPage}`}>
 <SiteNav/>
 <header className={styles.expandedHeading}><p>SCREAM VISION / ORIGINAL WORLDS</p><h1>Collections<span>04</span></h1></header>
 <section className={styles.expandedRail} aria-label="Collection banners" onPointerDown={event=>{gesture.current={x:event.clientX,y:event.clientY};swiped.current=false;}} onPointerUp={event=>{if(!gesture.current)return;const dx=event.clientX-gesture.current.x,dy=event.clientY-gesture.current.y;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){swiped.current=true;select(Math.max(0,Math.min(worlds.length-1,active+(dx<0?1:-1))));}gesture.current=null;}} onPointerCancel={()=>{gesture.current=null;}}>
 {worlds.map((item,index)=><button key={item.id} className={styles.expandedCard} data-active={active===index} data-soon={item.id==="soon"} style={{"--banner-glow":item.glow} as CSSProperties} aria-label={`Open ${item.name}`} aria-expanded={active===index} onPointerEnter={event=>{if(event.pointerType==="mouse")select(index);}} onFocus={()=>select(index)} onClick={event=>{if(swiped.current){swiped.current=false;return;}if(active!==index){select(index);return;}enter(index,event.currentTarget);}} onKeyDown={event=>{if(event.key==="ArrowRight"||event.key==="ArrowLeft"){event.preventDefault();select(Math.max(0,Math.min(worlds.length-1,active+(event.key==="ArrowRight"?1:-1))));}}}>
 {item.banner?<Image src={item.banner} alt="" fill sizes="(max-width:700px) 85vw, 55vw" priority={index===0} draggable={false}/>:<span className={styles.soonArt} aria-hidden="true"><span>?</span></span>}
 <span className={styles.bannerShade}/><span className={styles.bannerIndex}>0{index+1}</span>
 <span className={styles.collapsedName}>{item.id==="soon"?"NEXT":item.name.split(" ")[0]}</span>
 <span className={styles.bannerCaption}><strong>{item.name}</strong><span><span>{item.chain}</span><span>{item.supply?`${item.supply.toLocaleString("en-US")} ARTWORKS`: "FOLLOW THE NEXT DROP"}</span><i aria-hidden="true">↗</i></span></span>
 </button>)}
 </section>
 <footer className={styles.expandedFooter}><span>SELECT A WORLD</span><nav aria-label="Choose collection">{worlds.map((item,index)=><button key={item.id} aria-label={`Select ${item.name}`} aria-current={active===index?"true":undefined} onClick={()=>select(index)}><span/></button>)}</nav><span>{String(active+1).padStart(2,"0")} / 04</span></footer>
 {opening!==null&&<div ref={overlay} className={styles.bannerExpansion} data-collection={worlds[opening].id!=="soon"} role={worlds[opening].id==="soon"?"dialog":undefined} aria-modal={worlds[opening].id==="soon"?true:undefined} aria-label={worlds[opening].name}>
 {worlds[opening].banner?<><div ref={artwork} className={styles.expansionArtwork}><Image className={styles.expansionBase} src={worlds[opening].banner} alt="" fill sizes="(max-width:700px) 100vw, 550px" priority/><div ref={fill} className={styles.expansionFill}><Image src={worlds[opening].banner} alt="" fill sizes="(max-width:700px) 100vw, 550px" priority/></div></div><div className={styles.expansionProgress} aria-label="Opening collection"><span ref={progress}>00</span><small>%</small></div></>:<div className={styles.soonArt}><span>?</span></div>}
 <div className={styles.expansionShade}/><div ref={title} className={styles.expansionTitle}><p>{worlds[opening].chain}</p><h2>{worlds[opening].name}</h2>{worlds[opening].id==="soon"&&<a href="https://x.com/scream_vision" target="_blank" rel="noopener noreferrer">FOLLOW ON X <span>↗</span></a>}</div>
 {worlds[opening].id==="soon"&&<button autoFocus className={styles.closeExpansion} aria-label="Close coming soon" onClick={()=>setOpening(null)}>✕</button>}
 </div>}
 </main>;
}
