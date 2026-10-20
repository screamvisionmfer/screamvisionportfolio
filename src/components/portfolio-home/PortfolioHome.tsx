"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { covers } from "@/data/covers";
import styles from "./portfolioHome.module.css";
const RoomScene = dynamic(() => import("./RoomScene").then(m => m.RoomScene), { ssr: false });
const sections = [
 { title:"Covers", href:"/covers", note:"Music / Artwork", position:"covers" },
 { title:"Illustrations", href:"/illustrations", note:"Characters / Worlds", position:"illustrations" },
 { title:"Cards", href:"/cards", note:"Collect / Unseal", position:"cards" },
 { title:"Collaborations", href:"/collaborations", note:"Shared universes", position:"collaborations" },
];
export function PortfolioHome() {
 const [ready,setReady]=useState(false),[lit,setLit]=useState(true),[leaving,setLeaving]=useState(false);
 const router=useRouter(), exit=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{
  const cover=new URLSearchParams(window.location.search).get("cover");
  if(cover&&covers.some(item=>item.id===cover))router.replace(`/covers?cover=${encodeURIComponent(cover)}`);
  return()=>{if(exit.current)clearTimeout(exit.current);};
 },[router]);
 return <main className={styles.room} data-ready={ready} data-lit={lit} data-leaving={leaving}>
  <h1 className={styles.srOnly}>SCREAM VISION — Cover art, illustrations and collectible worlds</h1>
  <div className={styles.scene}><RoomScene lit={lit} onReady={()=>setReady(true)} /></div>
  <div className={styles.screen} aria-hidden="true" />
  <header className={styles.header}>
   <Link href="/" aria-label="SCREAM VISION home"><img src="/scream-logo.png" alt="SCREAM VISION" width="104" height="60" /></Link>
   <span>Independent artist<br/><b>Selected works / 2026</b></span>
   <Link href="/contacts">Get in touch <i>↗</i></Link>
  </header>
  <button className={styles.lampSwitch} onClick={()=>setLit(v=>!v)} aria-label={lit?"Turn lamp off":"Turn lamp on"} aria-pressed={lit}><i/><span>{lit?"Lights on":"Lights off"}</span></button>
  <nav className={styles.worlds} aria-label="Choose a world">
   {sections.map((section,index)=><Link key={section.href} href={section.href} className={styles.world} data-position={section.position}
    onPointerEnter={()=>router.prefetch(section.href)}
    onClick={event=>{
     if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
     event.preventDefault();if(leaving)return;setLeaving(true);
     exit.current=setTimeout(()=>router.push(section.href),window.matchMedia("(prefers-reduced-motion: reduce)").matches?0:420);
    }}>
    <span className={styles.worldNumber}>0{index+1}<i/></span><strong>{section.title}</strong><span className={styles.worldNote}>{section.note}<b>↗</b></span>
   </Link>)}
  </nav>
  <div className={styles.loading} role="status">{ready?"":"Loading the room"}<span/></div>
  <footer className={styles.footer}><span><i/>SCREAM VISION / ENTER THE WORLD</span><span>Move your cursor. Pick your world.</span><div><Link href="/about">About</Link><Link href="/contacts">Contacts ↗</Link></div></footer>
 </main>;
}
