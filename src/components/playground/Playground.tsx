"use client";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { haptic } from "@/components/haptics/haptics";
import styles from "./categoryHub.module.css";

export function Playground(){
 return <main className={styles.page}>
  <SiteNav/>
  <div className={styles.ambient} aria-hidden="true"/>
  <section className={styles.hub}>
   <header className={styles.header}><h1>PLAYGROUND</h1></header>
   <div className={styles.panels}>
    <a href="/playground/untitled-story" className={styles.panel} aria-label="Comics" onClick={event=>{
     if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
     event.preventDefault();haptic("select");
     window.dispatchEvent(new CustomEvent("portfolio:navigate",{detail:"/playground/untitled-story"}));
    }}>
     <span className={styles.picture} aria-hidden="true"/>
     <span className={styles.wash} aria-hidden="true"/>
     <span className={styles.caption}><strong>Comics</strong></span>
    </a>
   </div>
  </section>
 </main>;
}
