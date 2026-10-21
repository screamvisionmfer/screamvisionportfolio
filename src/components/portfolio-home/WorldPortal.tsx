"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { PortfolioImage } from "@/components/portfolio-image/PortfolioImage";
import styles from "./portfolioHome.module.css";

export type PortalDeparture={src:string;title:string;position:string;x:number;y:number;width:number;height:number};

export function WorldPortal({ title, href, images, note, index, position, motion, railActive, onEnter }: {
 title:string; href:string; images:string[]; note:string; index:number; position:string; motion:boolean; railActive:boolean; onEnter:(href:string,departure:PortalDeparture)=>void;
}) {
 const [active,setActive]=useState(0),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false);
 const element=useRef<HTMLAnchorElement>(null),[entering,setEntering]=useState(false);
 useEffect(()=>{
  if(!motion||entering)return;
  const timer=setInterval(()=>{if(!document.hidden&&element.current?.closest("main")?.getAttribute("data-active")!=="false"&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&(!window.matchMedia("(max-width:600px)").matches||railActive))setActive(value=>(value+1)%images.length);},hovered||focused?1100:3600+index*450);
  return()=>clearInterval(timer);
 },[hovered,focused,images.length,motion,index,railActive,entering]);
 const reset=()=>{const el=element.current;if(!el)return;for(const [key,value] of [["--tilt-x","0deg"],["--tilt-y","0deg"],["--art-x","0px"],["--art-y","0px"],["--glare-x","50%"],["--glare-y","0%"]])el.style.setProperty(key,value);};
 const pointer=(event:PointerEvent<HTMLAnchorElement>)=>{
  if(!motion||event.pointerType==="touch"||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const rect=event.currentTarget.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;
  event.currentTarget.style.setProperty("--tilt-x",`${-y*12}deg`);
  event.currentTarget.style.setProperty("--tilt-y",`${x*16}deg`);
  event.currentTarget.style.setProperty("--glare-x",`${(x+.5)*100}%`);
  event.currentTarget.style.setProperty("--glare-y",`${(y+.5)*100}%`);
  event.currentTarget.style.setProperty("--art-x",`${-x*14}px`);
  event.currentTarget.style.setProperty("--art-y",`${-y*12}px`);
 };
 return <Link ref={element} href={href} className={styles.world} data-position={position} data-entering={entering} data-rail-active={railActive} aria-label={`Explore ${title}`}
  onPointerEnter={()=>setHovered(true)} onPointerMove={pointer} onPointerLeave={()=>{setHovered(false);reset();}} onFocus={()=>setFocused(true)} onBlur={()=>{setFocused(false);reset();}}
  onClick={event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();const rect=event.currentTarget.querySelector("[data-portal-art]")!.getBoundingClientRect();setEntering(true);onEnter(href,{src:images[active],title,position,x:rect.x,y:rect.y,width:rect.width,height:rect.height});}}>
  <span className={styles.portalBody}>
   <span className={styles.portalArt} data-portal-art>
    {images.map((src,i)=><span key={src} data-active={i===active}><PortfolioImage src={src} alt="" fill sizes="(max-width:600px) 68vw, 295px" /></span>)}
    <span className={styles.portalGlare}/>
   </span>
   <span className={styles.portalLabel}><span>0{index+1} / {note}</span><strong>{title}<i>↗</i></strong></span>

  </span>
 </Link>;
}
