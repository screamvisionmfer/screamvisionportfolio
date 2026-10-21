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
import { useMobilePortals } from "./useMobilePortals";
import { usePhoneMotion } from "./usePhoneMotion";
import { applyNoirMode, readNoirMode } from "@/components/site-settings/NoirMode";
import styles from "./portfolioHome.module.css";
const RoomScene=dynamic(()=>import("./RoomScene").then(m=>m.RoomScene),{ssr:false});
const sections=[
 {title:"Covers",href:"/covers",note:"Music / Artwork",position:"covers",images:covers.slice(0,3).map(item=>item.image)},
 {title:"Illustrations",href:"/illustrations",note:"Characters / Worlds",position:"illustrations",images:[illustrations[26].image,illustrations[37].image,illustrations[21].image]},
 {title:"Cards",href:"/cards",note:"Collect / Unseal",position:"cards",images:[cardPacks[0].cards[0].image,cardPacks[1].cards[0].image,cardPacks[0].cards[6].image]},
 {title:"Collaborations",href:"/collaborations",note:"Shared universes",position:"collaborations",images:[collaborations[1].hero,collaborations[0].hero,collaborations[0].assets[4].src]},
];
function PhoneMotionControl({phone,motion}:{phone:ReturnType<typeof usePhoneMotion>;motion:boolean}){
 return <div className={styles.gyroControl}><div><span>Phone tilt</span><button aria-label={phone.enabled?"Disable gyroscope":"Enable gyroscope"} aria-pressed={phone.enabled} disabled={!motion||phone.status==="requesting"||phone.status==="unavailable"} onClick={()=>void phone.toggle()}>{phone.status==="requesting"?"…":phone.enabled?"ON":"ENABLE"}</button></div><p role="status">{motion?phone.message:"Enable Motion / Parallax first"}</p></div>;
}
export function PortfolioHome(){
 const [ready,setReady]=useState(false),[lit,setLit]=useState(true),[leaving,setLeaving]=useState(false);
 const [motion,setMotion]=useState(true),[retro,setRetro]=useState(true),[settings,setSettings]=useState(false),[resetVersion,setResetVersion]=useState(0);
 const [drawerOpen,setDrawerOpen]=useState(false);
 const phone=usePhoneMotion();
 const [noir,setNoir]=useState(false);
 useEffect(()=>{setNoir(readNoirMode());},[]);
 const changeNoir=(enabled:boolean)=>{setNoir(enabled);applyNoirMode(enabled);};
 const rail=useRef<HTMLElement>(null),drawerButton=useRef<HTMLButtonElement>(null),drawerDrag=useRef({y:0,moved:false});
 const activePortal=useMobilePortals(rail);
 const router=useRouter(),exit=useRef<ReturnType<typeof setTimeout>|null>(null),settingsButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  const cover=new URLSearchParams(window.location.search).get("cover");
  if(cover&&covers.some(item=>item.id===cover))router.replace(`/covers?cover=${encodeURIComponent(cover)}`);
  return()=>{if(exit.current)clearTimeout(exit.current);};
 },[router]);
 useEffect(()=>{
  if(!settings&&!drawerOpen)return;
  const key=(event:KeyboardEvent)=>{if(event.key==="Escape"){setSettings(false);setDrawerOpen(false);(drawerOpen?drawerButton:settingsButton).current?.focus();}};
  window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);
 },[settings,drawerOpen]);
 const enter=(href:string)=>{
  if(leaving)return;router.prefetch(href);setLeaving(true);
  exit.current=setTimeout(()=>router.push(href),window.matchMedia("(prefers-reduced-motion: reduce)").matches?0:620);
 };
 return <main className={styles.room} data-ready={ready} data-lit={lit} data-motion={motion} data-retro={retro} data-leaving={leaving}>
  <h1 className={styles.srOnly}>SCREAM VISION — Cover art, illustrations and collectible worlds</h1>
  <div className={styles.scene}><RoomScene lit={lit} motion={motion} gyro={phone.enabled} onGyroData={phone.onData} resetVersion={resetVersion} onReady={()=>setReady(true)}/></div>
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
  <div className={styles.railHint}>{String(activePortal+1).padStart(2,"0")} / 04 <span>SWIPE TO EXPLORE</span></div>
  <nav ref={rail} className={styles.worlds} aria-label="Choose a world" onKeyDown={event=>{
   if(!["ArrowRight","ArrowLeft","ArrowUp","ArrowDown"].includes(event.key))return;
   const links=Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a")),index=links.indexOf(document.activeElement as HTMLAnchorElement);
   event.preventDefault();links[(Math.max(0,index)+(event.key==="ArrowLeft"||event.key==="ArrowUp"?-1:1)+links.length)%links.length]?.focus();
  }}>{sections.map((section,index)=><WorldPortal key={section.href} {...section} index={index} motion={motion} railActive={activePortal===index} onEnter={enter}/>)}</nav>
  <div className={styles.loading} role="status">{ready?"":"Loading the room"}<span/></div>
  {settings&&<section className={`${styles.settings} ${styles.desktopSettings}`} data-room-settings role="dialog" aria-label="Room settings">
   <div><h2>Room settings</h2><button aria-label="Close settings" onClick={()=>{setSettings(false);settingsButton.current?.focus();}}>×</button></div>
   <label>Motion / Parallax<input type="checkbox" checked={motion} onChange={event=>setMotion(event.target.checked)}/></label>
   <label>Retro screen<input type="checkbox" checked={retro} onChange={event=>setRetro(event.target.checked)}/></label>
   <label>Noir mode<input type="checkbox" checked={noir} onChange={event=>changeNoir(event.target.checked)}/></label>
   <PhoneMotionControl phone={phone} motion={motion}/>
   <button className={styles.resetView} onClick={()=>setResetVersion(value=>value+1)}>Reset camera <span>↶</span></button>
   <p>Mouse to look · Wheel to zoom<br/>Arrows to select · Enter to open</p>
  </section>}
  <footer className={styles.consoleBar}>
   <div className={styles.controls}><span><b className={styles.green}>A</b> ENTER</span><span><b className={styles.grey}>R</b> ZOOM</span></div>
   <div className={styles.footerLinks}><a href="mailto:screamvisionmfer@gmail.com"><b className={styles.blue}>X</b> screamvisionmfer@gmail.com</a><a href="https://t.me/screamdesign" target="_blank" rel="noopener noreferrer">TELEGRAM ↗</a><a href="https://www.behance.net/jimmyscream" target="_blank" rel="noopener noreferrer">BEHANCE ↗</a><Link href="/about">ABOUT</Link></div>
   <button ref={settingsButton} aria-expanded={settings} onClick={()=>setSettings(value=>!value)}><b className={styles.yellow}>Y</b> SETTINGS</button>
  </footer>
  <button className={styles.drawerBackdrop} data-open={drawerOpen} tabIndex={drawerOpen?0:-1} aria-hidden={!drawerOpen} aria-label="Dismiss room panel" onClick={()=>{setDrawerOpen(false);drawerButton.current?.focus();}}/>
  <section className={styles.mobileConsole} data-open={drawerOpen} aria-label="Mobile room controls" data-room-settings>
   <button ref={drawerButton} className={styles.drawerHandle} aria-expanded={drawerOpen} aria-controls="mobile-room-panel" aria-label={drawerOpen?"Close room panel":"Open room panel"}
    onPointerDown={event=>{drawerDrag.current={y:event.clientY,moved:false};event.currentTarget.setPointerCapture(event.pointerId);}}
    onPointerUp={event=>{const delta=event.clientY-drawerDrag.current.y;if(Math.abs(delta)>30){drawerDrag.current.moved=true;setDrawerOpen(delta<0);}}}
    onClick={event=>{if(event.detail&&drawerDrag.current.moved){drawerDrag.current.moved=false;return;}drawerDrag.current.moved=false;setDrawerOpen(value=>!value);}}>
    <i/><span><b className={styles.yellow}>Y</b> SYSTEM / CONTACTS</span><strong>{drawerOpen?"⌄":"⌃"}</strong>
   </button>
   <div id="mobile-room-panel" className={styles.drawerBody} inert={!drawerOpen} aria-hidden={!drawerOpen}>
    <p className={styles.drawerTitle}>ROOM 01 / DISPLAY OPTIONS</p>
    <label>Motion / Parallax<input type="checkbox" checked={motion} onChange={event=>setMotion(event.target.checked)}/></label>
    <label>Retro screen<input type="checkbox" checked={retro} onChange={event=>setRetro(event.target.checked)}/></label>
    <label>Noir mode<input type="checkbox" checked={noir} onChange={event=>changeNoir(event.target.checked)}/></label>
    <PhoneMotionControl phone={phone} motion={motion}/>
    <button className={styles.resetView} onClick={()=>setResetVersion(value=>value+1)}>Reset camera <span>↶</span></button>
    <a className={styles.drawerEmail} href="mailto:screamvisionmfer@gmail.com"><b className={styles.blue}>X</b> screamvisionmfer@gmail.com <span>↗</span></a>
    <div className={styles.drawerLinks}><a href="https://t.me/screamdesign" target="_blank" rel="noopener noreferrer">TELEGRAM ↗</a><a href="https://www.behance.net/jimmyscream" target="_blank" rel="noopener noreferrer">BEHANCE ↗</a><Link href="/about">ABOUT</Link></div>
    <p className={styles.drawerHelp}><b className={styles.green}>A</b> TAP TO ENTER <span>↔ SWIPE TO SELECT</span></p>
   </div>
  </section>
 </main>;
}
