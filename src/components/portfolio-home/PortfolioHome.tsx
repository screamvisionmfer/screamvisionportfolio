"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { covers } from "@/data/covers";
import { illustrations } from "@/data/illustrations";
import { collaborations } from "@/data/collaborations";
import { cardPacks } from "@/data/card-packs";
import { WorldPortal } from "./WorldPortal";
import styles from "./portfolioHome.module.css";
const RoomScene=dynamic(()=>import("./RoomScene").then(m=>m.RoomScene),{ssr:false});
const sections=[
 {title:"Covers",href:"/covers",note:"Music / Artwork",position:"covers",images:covers.slice(0,3).map(item=>item.image)},
 {title:"Illustrations",href:"/illustrations",note:"Characters / Worlds",position:"illustrations",images:[illustrations[26].image,illustrations[37].image,illustrations[21].image]},
 {title:"Cards",href:"/cards",note:"Collect / Unseal",position:"cards",images:[cardPacks[0].cards[0].image,cardPacks[1].cards[0].image,cardPacks[0].cards[6].image]},
 {title:"Collaborations",href:"/collaborations",note:"Shared universes",position:"collaborations",images:[collaborations[1].hero,collaborations[0].hero,collaborations[0].assets[4].src]},
];
export function PortfolioHome(){
 const [ready,setReady]=useState(false),[lit,setLit]=useState(true),[leaving,setLeaving]=useState(false);
 const [motion,setMotion]=useState(true),[retro,setRetro]=useState(true),[settings,setSettings]=useState(false),[resetVersion,setResetVersion]=useState(0);
 const router=useRouter(),exit=useRef<ReturnType<typeof setTimeout>|null>(null),settingsButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  const cover=new URLSearchParams(window.location.search).get("cover");
  if(cover&&covers.some(item=>item.id===cover))router.replace(`/covers?cover=${encodeURIComponent(cover)}`);
  return()=>{if(exit.current)clearTimeout(exit.current);};
 },[router]);
 useEffect(()=>{
  if(!settings)return;
  const key=(event:KeyboardEvent)=>{if(event.key==="Escape"){setSettings(false);settingsButton.current?.focus();}};
  window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);
 },[settings]);
 const enter=(href:string)=>{
  if(leaving)return;router.prefetch(href);setLeaving(true);
  exit.current=setTimeout(()=>router.push(href),window.matchMedia("(prefers-reduced-motion: reduce)").matches?0:420);
 };
 return <main className={styles.room} data-ready={ready} data-lit={lit} data-motion={motion} data-retro={retro} data-leaving={leaving}>
  <h1 className={styles.srOnly}>SCREAM VISION — Cover art, illustrations and collectible worlds</h1>
  <div className={styles.scene}><RoomScene lit={lit} motion={motion} resetVersion={resetVersion} onReady={()=>setReady(true)}/></div>
  <div className={styles.screen} aria-hidden="true"/>
  <header className={styles.header}>
   <Link href="/" aria-label="SCREAM VISION home"><Image src="/scream-logo.png" alt="SCREAM VISION" width={104} height={60} unoptimized/></Link>
   <span>Independent artist<br/><b>Portfolio / Room 01</b></span>
   <Link href="/contacts">Get in touch <i>↗</i></Link>
  </header>
  <button className={styles.wallSwitch} onClick={()=>setLit(value=>!value)} aria-label={lit?"Turn lamp off":"Turn lamp on"} aria-pressed={lit}>
   <span className={styles.switchImages}><Image src="/scene/switch-on.webp" alt="" fill sizes="75px" unoptimized data-visible={lit}/><Image src="/scene/switch-off.webp" alt="" fill sizes="75px" unoptimized data-visible={!lit}/></span>
   <span><b>LIGHT</b><i data-on={lit}/>{lit?"ON":"OFF"}</span>
  </button>
  <nav className={styles.worlds} aria-label="Choose a world" onKeyDown={event=>{
   if(!["ArrowRight","ArrowLeft","ArrowUp","ArrowDown"].includes(event.key))return;
   const links=Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a")),index=links.indexOf(document.activeElement as HTMLAnchorElement);
   event.preventDefault();links[(Math.max(0,index)+(event.key==="ArrowLeft"||event.key==="ArrowUp"?-1:1)+links.length)%links.length]?.focus();
  }}>{sections.map((section,index)=><WorldPortal key={section.href} {...section} index={index} motion={motion} onEnter={enter}/>)}</nav>
  <div className={styles.loading} role="status">{ready?"":"Loading the room"}<span/></div>
  {settings&&<section className={styles.settings} data-room-settings role="dialog" aria-label="Room settings">
   <div><h2>Room settings</h2><button aria-label="Close settings" onClick={()=>{setSettings(false);settingsButton.current?.focus();}}>×</button></div>
   <label>Motion / Parallax<input type="checkbox" checked={motion} onChange={event=>setMotion(event.target.checked)}/></label>
   <label>Retro screen<input type="checkbox" checked={retro} onChange={event=>setRetro(event.target.checked)}/></label>
   <button className={styles.resetView} onClick={()=>setResetVersion(value=>value+1)}>Reset camera <span>↶</span></button>
   <p>Mouse to look · Wheel to zoom<br/>Arrows to select · Enter to open</p>
  </section>}
  <footer className={styles.consoleBar}>
   <div className={styles.controls}><span><b className={styles.green}>A</b> ENTER</span><span><b className={styles.grey}>R</b> ZOOM</span></div>
   <div className={styles.footerLinks}><Link href="/contacts"><b className={styles.blue}>X</b> CONTACT</Link><a href="https://t.me/screamdesign" target="_blank" rel="noopener noreferrer">TELEGRAM ↗</a><a href="https://www.behance.net/jimmyscream" target="_blank" rel="noopener noreferrer">BEHANCE ↗</a><Link href="/about">ABOUT</Link></div>
   <button ref={settingsButton} aria-expanded={settings} onClick={()=>setSettings(value=>!value)}><b className={styles.yellow}>Y</b> SETTINGS</button>
  </footer>
 </main>;
}
