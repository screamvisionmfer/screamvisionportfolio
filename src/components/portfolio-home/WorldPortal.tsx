"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { PortfolioImage } from "@/components/portfolio-image/PortfolioImage";
import styles from "./portfolioHome.module.css";

export function WorldPortal({ title, href, images, note, index, position, motion, onEnter }: {
 title:string; href:string; images:string[]; note:string; index:number; position:string; motion:boolean; onEnter:(href:string)=>void;
}) {
 const [active,setActive]=useState(0),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false);
 const element=useRef<HTMLAnchorElement>(null);
 useEffect(()=>{
  if(!motion||(!hovered&&!focused))return;
  const timer=setInterval(()=>{if(!document.hidden&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches)setActive(value=>(value+1)%images.length);},1350);
  return()=>clearInterval(timer);
 },[hovered,focused,images.length,motion]);
 const reset=()=>{element.current?.style.setProperty("--tilt-x","0deg");element.current?.style.setProperty("--tilt-y","0deg");};
 const pointer=(event:PointerEvent<HTMLAnchorElement>)=>{
  if(event.pointerType==="touch"||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const rect=event.currentTarget.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;
  event.currentTarget.style.setProperty("--tilt-x",`${-y*12}deg`);
  event.currentTarget.style.setProperty("--tilt-y",`${x*16}deg`);
  event.currentTarget.style.setProperty("--glare-x",`${(x+.5)*100}%`);
 };
 return <Link ref={element} href={href} className={styles.world} data-position={position} aria-label={`Explore ${title}`}
  onPointerEnter={()=>setHovered(true)} onPointerMove={pointer} onPointerLeave={()=>{setHovered(false);reset();}} onFocus={()=>setFocused(true)} onBlur={()=>{setFocused(false);reset();}}
  onClick={event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();onEnter(href);}}>
  <span className={styles.portalBody}>
   <span className={styles.portalTop}><b>0{index+1}</b><span>SCREAM VISION / {title}</span><i>↗</i></span>
   <span className={styles.portalArt}>
    {images.map((src,i)=><span key={src} data-active={i===active}><PortfolioImage src={src} alt="" fill sizes="(max-width:600px) 160px, 260px" /></span>)}
    <span className={styles.portalGlare}/>
   </span>
   <span className={styles.portalLabel}><strong>{title}</strong><span>{note}</span></span>
   <span className={styles.portalTicks}>{images.map((src,i)=><i key={src} data-active={i===active}/>)}</span>
  </span>
 </Link>;
}
