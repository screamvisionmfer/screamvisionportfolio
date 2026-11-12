"use client";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Link from "next/link";
import { PortalArtwork } from "./PortalArtwork";
import styles from "./portfolioHome.module.css";

export function WorldPortal({ title, href, images, note, index, position, motion, railActive, onEnter, onReady }: {
 title:string; href:string; images:string[]; note:string; index:number; position:string; motion:boolean; railActive:boolean; onEnter:(href:string)=>void;onReady?:()=>void;
}) {
 const [deck,setDeck]=useState<string[]>([]);
 const [slots,setSlots]=useState<string[]>([]),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false);
 const rotation=useRef({cursor:3,slot:0,images:[] as string[]});
 const element=useRef<HTMLAnchorElement>(null),[entering,setEntering]=useState(false);
 useEffect(()=>{
  const shuffled=[...new Set(images)];
  for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  try{
   const key=`portal:last-art:${position}`,previous=sessionStorage.getItem(key);
   if(shuffled.length>1&&shuffled[0]===previous)[shuffled[0],shuffled[1]]=[shuffled[1],shuffled[0]];
   if(shuffled[0])sessionStorage.setItem(key,shuffled[0]);
  }catch{}
  setDeck(shuffled);setSlots(shuffled.slice(0,3));rotation.current={cursor:3,slot:0,images:shuffled.slice(0,3)};
 },[images,position]);
 useEffect(()=>{
  const mobile=matchMedia("(max-width:600px)").matches;
  if(!motion||entering||deck.length<=3||!(hovered||focused||(mobile&&railActive)))return;
  const timer=setInterval(()=>{
   if(document.hidden||element.current?.closest("main")?.getAttribute("data-active")==="false"||document.documentElement.dataset.navigationOpen==="true"||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
   const state=rotation.current;let candidate=deck[state.cursor%deck.length];
   for(let attempts=0;attempts<deck.length&&state.images.includes(candidate);attempts++){state.cursor++;candidate=deck[state.cursor%deck.length];}
   if(state.images.includes(candidate))return;
   const next=[...state.images];next[state.slot]=candidate;state.images=next;state.slot=(state.slot+1)%next.length;state.cursor++;setSlots(next);
  },1800);
  return()=>clearInterval(timer);
 },[hovered,focused,deck,motion,railActive,entering]);
 const reset=()=>{const el=element.current;if(!el)return;for(const [key,value] of [["--tilt-x","0deg"],["--tilt-y","0deg"],["--art-x","0px"],["--art-y","0px"],["--glare-x","50%"],["--glare-y","0%"]])el.style.setProperty(key,value);};
 const spotlight=()=>{const el=element.current;if(!el)return;const rect=el.getBoundingClientRect(),root=el.closest("main");root?.style.setProperty("--focus-x",`${rect.left+rect.width/2}px`);root?.style.setProperty("--focus-y",`${rect.top+rect.height*.4}px`);};
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
 return <Link ref={element} href={href} className={styles.world} style={{"--portal-index":index} as CSSProperties} data-position={position} data-scene={position==="cards"?"cards":"layered"} data-cinematic-link="true" data-awake={hovered||focused||railActive} data-entering={entering} data-rail-active={railActive} aria-label={`Explore ${title}`}
  onPointerEnter={()=>{spotlight();setHovered(true);}} onPointerMove={pointer} onPointerLeave={()=>{setHovered(false);reset();}} onFocus={()=>{spotlight();setFocused(true);}} onBlur={()=>{setFocused(false);reset();}}
  onClick={event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();if(entering)return;spotlight();reset();setEntering(true);onEnter(href);}}>
  <span className={styles.portalArrival}><span className={styles.portalBody}>
   <span className={styles.portalArt} data-portal-art>
    {position!=="cards"?<span className={styles.coverScene}>
     {slots.map((src,i)=><span key={i} className={styles.coverPlane} data-layer={i}><PortalArtwork src={src} priority={i===0} onReady={i===0?onReady:undefined}/><span className={styles.coverLight}/></span>)}
    </span>:<>{slots.map((src,i)=><span key={i} data-active={i===0}><PortalArtwork src={src} priority={i===0} onReady={i===0?onReady:undefined}/></span>)}</>}


   </span>
   <span className={styles.portalLabel}><span>0{index+1} / {note}</span><strong>{title}</strong></span>

  </span></span>
 </Link>;
}
