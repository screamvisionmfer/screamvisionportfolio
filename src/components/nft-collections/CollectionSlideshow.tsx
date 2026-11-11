"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import page from "./collectionProject.module.css";

export function CollectionSlideshow({artworks,onInspect}:{artworks:{src:string;name:string;rank:number}[];onInspect:(index:number)=>void}){
 const [active,setActive]=useState(0),[paused,setPaused]=useState(false);
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const element=root.current;if(!element)return;
  const reduced=matchMedia("(prefers-reduced-motion:reduce)");
  let visible=false,timer:ReturnType<typeof setInterval>|undefined;
  const sync=()=>{clearInterval(timer);if(visible&&!document.hidden&&!reduced.matches&&!paused&&artworks.length>1)timer=setInterval(()=>setActive(index=>(index+1)%artworks.length),1800);};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.25});
  observer.observe(element);document.addEventListener("visibilitychange",sync);reduced.addEventListener("change",sync);
  return()=>{clearInterval(timer);observer.disconnect();document.removeEventListener("visibilitychange",sync);reduced.removeEventListener("change",sync);};
 },[artworks.length,paused]);
 return <div ref={root} className={page.intelSlideshow} onFocusCapture={()=>setPaused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setPaused(false);}}>
  <button className={page.slideshowImage} onClick={()=>onInspect(active)} aria-label={`Inspect featured ${artworks[active].name}`}>
   {artworks.map((art,index)=><span key={art.src} data-active={index===active}><Image src={art.src} alt={index===active?art.name:""} fill sizes="(max-width:700px) 85vw, 480px" unoptimized draggable={false}/></span>)}
  </button>
  <div className={page.slideshowFooter}><span>{artworks[active].name} <small>RANK #{artworks[active].rank}</small></span><div aria-label="Featured artworks">{artworks.map((art,index)=><button key={art.src} aria-label={`Show ${art.name}`} aria-pressed={active===index} onClick={()=>setActive(index)}/>)}</div></div>
 </div>;
}
