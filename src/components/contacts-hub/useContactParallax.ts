"use client";
import { useEffect, useRef, type RefObject } from "react";
import { isPageActive, observePageActivity } from "@/components/site-nav/pageActivity";
export function useContactParallax(root:RefObject<HTMLElement|null>,enabled:boolean,onData:()=>void){
 const sensor=useRef({enabled,onData});
 useEffect(()=>{sensor.current={enabled,onData};},[enabled,onData]);
 useEffect(()=>{
  const element=root.current;if(!element)return;
  const reduced=matchMedia("(prefers-reduced-motion:reduce)"),coarse=matchMedia("(pointer:coarse)");
  let frame=0,x=0,y=0,tx=0,ty=0,last=performance.now(),baseline:{beta:number;gamma:number}|null=null;
  const pointer=(event:PointerEvent)=>{if(coarse.matches||!isPageActive())return;tx=(event.clientX/innerWidth-.5)*24;ty=(event.clientY/innerHeight-.5)*16;};
  const reset=()=>{tx=0;ty=0;baseline=null;};
  const orientation=(event:DeviceOrientationEvent)=>{if(!sensor.current.enabled||reduced.matches||!isPageActive()||event.beta===null||event.gamma===null)return;if(!baseline)baseline={beta:event.beta,gamma:event.gamma};const angle=(screen.orientation?.angle??0)*Math.PI/180,dx=Math.max(-15,Math.min(15,event.gamma-baseline.gamma)),dy=Math.max(-15,Math.min(15,event.beta-baseline.beta));tx=(dx*Math.cos(angle)+dy*Math.sin(angle))*.8;ty=(dy*Math.cos(angle)-dx*Math.sin(angle))*.55;sensor.current.onData();};
  const tick=(now:number)=>{const ease=1-Math.exp(-Math.min(64,now-last)/170);last=now;x+=(tx-x)*ease;y+=(ty-y)*ease;element.style.setProperty("--look-x",`${x.toFixed(2)}px`);element.style.setProperty("--look-y",`${y.toFixed(2)}px`);frame=requestAnimationFrame(tick);};
  const sync=()=>{cancelAnimationFrame(frame);if(!reduced.matches&&isPageActive()){last=performance.now();frame=requestAnimationFrame(tick);}else if(reduced.matches){element.style.setProperty("--look-x","0px");element.style.setProperty("--look-y","0px");}};
  window.addEventListener("pointermove",pointer,{passive:true});window.addEventListener("deviceorientation",orientation,{passive:true});window.addEventListener("orientationchange",reset);window.addEventListener("blur",reset);reduced.addEventListener("change",sync);const stop=observePageActivity(sync);sync();
  return()=>{cancelAnimationFrame(frame);window.removeEventListener("pointermove",pointer);window.removeEventListener("deviceorientation",orientation);window.removeEventListener("orientationchange",reset);window.removeEventListener("blur",reset);reduced.removeEventListener("change",sync);stop();};
 },[root]);
}
