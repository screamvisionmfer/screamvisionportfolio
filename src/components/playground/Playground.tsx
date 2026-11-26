"use client";
import { useEffect, useRef, useState } from "react";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { haptic } from "@/components/haptics/haptics";
import styles from "./categoryHub.module.css";

export function Playground(){
 const [entering,setEntering]=useState(false);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 return <main className={styles.page} data-entering={entering}>
  <SiteNav/>
  <div className={styles.ambient} aria-hidden="true"/>
  <section className={styles.hub}>
   <header className={styles.header}><h1>PLAYGROUND</h1><p className={styles.description}>Human ideas. Artificial possibilities.<span>Comics, stories and visual experiments made with AI.</span></p></header>
   <a href="/playground/groy-payne-honey-and-blood" className={styles.composition} onPointerMove={event=>{if(event.pointerType!=="mouse"||matchMedia("(prefers-reduced-motion: reduce)").matches)return;const rect=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty("--pointer-x",`${((event.clientX-rect.left)/rect.width-.5)*12}deg`);event.currentTarget.style.setProperty("--pointer-y",`${-((event.clientY-rect.top)/rect.height-.5)*8}deg`);}} onPointerLeave={event=>{event.currentTarget.style.setProperty("--pointer-x","0deg");event.currentTarget.style.setProperty("--pointer-y","0deg");}} aria-label="Open Comics" onClick={event=>{
    if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();if(entering)return;
    haptic("select");setEntering(true);
    timer.current=setTimeout(()=>window.dispatchEvent(new CustomEvent("portfolio:navigate",{detail:"/playground/groy-payne-honey-and-blood"})),matchMedia("(prefers-reduced-motion: reduce)").matches?0:550);
   }}>
    <span className={styles.backdrop} aria-hidden="true"/>
    <span className={styles.frames} aria-hidden="true">
     <span className={styles.left}><span/></span>
     <span className={styles.right}><span/></span>
     <span className={styles.center}><span/></span>
    </span>
    <span className={styles.caption}>Comics<small>Groy Payne: Honey &amp; Blood</small></span>
   </a>
  </section>
 </main>;
}
