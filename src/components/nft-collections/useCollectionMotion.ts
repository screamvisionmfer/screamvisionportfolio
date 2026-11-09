"use client";
import { useEffect, useState, type RefObject } from "react";
export function useCollectionMotion(root:RefObject<HTMLElement|null>,about:RefObject<HTMLElement|null>){
 const [revealed,setRevealed]=useState(false);
 useEffect(()=>{const element=root.current,target=about.current;if(!element||!target)return;
 const reduced=matchMedia("(prefers-reduced-motion:reduce)");let frame=0;
 const draw=()=>{frame=0;const y=element.scrollTop,progress=Math.min(1,y/Math.max(1,innerHeight));element.style.setProperty("--scene-shift",`${reduced.matches?0:Math.min(y*.17,160)}px`);element.style.setProperty("--text-shift",`${reduced.matches?0:-Math.min(y*.1,90)}px`);element.style.setProperty("--hero-opacity",String(reduced.matches?1:1-progress*.7));};
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(draw);};
 const pointer=(event:PointerEvent)=>{if(event.pointerType==="touch"||reduced.matches)return;element.style.setProperty("--look-x",`${(event.clientX/innerWidth-.5)*12}px`);element.style.setProperty("--look-y",`${(event.clientY/innerHeight-.5)*8}px`);};
 const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setRevealed(true);observer.disconnect();}},{root:element,threshold:.06});observer.observe(target);
 element.addEventListener("scroll",schedule,{passive:true});element.addEventListener("pointermove",pointer,{passive:true});reduced.addEventListener("change",schedule);draw();
 return()=>{cancelAnimationFrame(frame);observer.disconnect();element.removeEventListener("scroll",schedule);element.removeEventListener("pointermove",pointer);reduced.removeEventListener("change",schedule);};
 },[root,about]);return revealed;
}
