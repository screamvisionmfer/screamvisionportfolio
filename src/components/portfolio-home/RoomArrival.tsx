"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./portfolioHome.module.css";

/** One curtain for every internal page change, including button-driven navigation. */
export function RoomArrival(){
 const pathname=usePathname(),router=useRouter(),previous=useRef(pathname),busy=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [phase,setPhase]=useState<"idle"|"out"|"in">("idle");
 useEffect(()=>{
  const navigate=(href:string)=>{
   if(busy.current)return;
   const url=new URL(href,window.location.href);
   if(url.origin!==location.origin||url.pathname===location.pathname)return;
   if(matchMedia("(prefers-reduced-motion: reduce)").matches){router.push(href);return;}
   busy.current=true;router.prefetch(href);setPhase("out");
   timer.current=setTimeout(()=>router.push(href),550);
  };
  let downX=0,downY=0,dragged=false;
  const down=(event:PointerEvent)=>{downX=event.clientX;downY=event.clientY;dragged=false;};
  const up=(event:PointerEvent)=>{dragged=Math.hypot(event.clientX-downX,event.clientY-downY)>8;};
  const click=(event:MouseEvent)=>{
   if((event.detail&&dragged)||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const a=(event.target as Element).closest<HTMLAnchorElement>("a[href]");
   if(!a||a.hasAttribute("download")||(a.target&&a.target!=="_self"))return;
   const url=new URL(a.href);if(url.origin!==location.origin||url.pathname===location.pathname)return;
   event.preventDefault();navigate(url.pathname+url.search+url.hash);
  };
  const request=(event:Event)=>navigate((event as CustomEvent<string>).detail);
  document.addEventListener("click",click,true);document.addEventListener("pointerdown",down,true);document.addEventListener("pointerup",up,true);window.addEventListener("portfolio:navigate",request);
  return()=>{document.removeEventListener("click",click,true);document.removeEventListener("pointerdown",down,true);document.removeEventListener("pointerup",up,true);window.removeEventListener("portfolio:navigate",request);if(timer.current)clearTimeout(timer.current);};
 },[router]);
 useLayoutEffect(()=>{
  if(previous.current===pathname)return;
  previous.current=pathname;busy.current=false;
  if(timer.current)clearTimeout(timer.current);
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){setPhase("idle");return;}
  setPhase("in");timer.current=setTimeout(()=>setPhase("idle"),650);
 },[pathname]);
 return phase!=="idle"?<div className={styles.routeCurtain} data-phase={phase} aria-hidden="true"/>:null;
}
