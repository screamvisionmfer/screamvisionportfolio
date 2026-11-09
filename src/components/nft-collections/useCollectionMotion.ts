"use client";
import { useEffect, useState, type RefObject } from "react";
export function useCollectionMotion(root:RefObject<HTMLElement|null>,about:RefObject<HTMLElement|null>){
 const [revealed,setRevealed]=useState(false);
 useEffect(()=>{const element=root.current,target=about.current;if(!element||!target)return;
 const reduced=matchMedia("(prefers-reduced-motion:reduce)");let frame=0;
 const draw=()=>{frame=0;const y=element.scrollTop,progress=Math.min(1,y/Math.max(1,innerHeight));element.style.setProperty("--scene-shift",`${reduced.matches?0:Math.min(y*.17,160)}px`);element.style.setProperty("--text-shift",`${reduced.matches?0:-Math.min(y*.1,90)}px`);element.style.setProperty("--hero-opacity",String(reduced.matches?1:Math.max(0,1-progress*1.25)));};
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(draw);};
 const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setRevealed(true);observer.disconnect();}},{root:element,threshold:.06});observer.observe(target);
 element.addEventListener("scroll",schedule,{passive:true});reduced.addEventListener("change",schedule);draw();
 return()=>{cancelAnimationFrame(frame);observer.disconnect();element.removeEventListener("scroll",schedule);reduced.removeEventListener("change",schedule);};
 },[root,about]);return revealed;
}
