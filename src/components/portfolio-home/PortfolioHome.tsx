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
import { SiteNav } from "@/components/site-nav/SiteNav";
import { WorldPortal } from "./WorldPortal";
import { useMobilePortals } from "./useMobilePortals";
import { usePhoneMotion } from "./usePhoneMotion";
import { applyNoirMode, readNoirMode } from "@/components/site-settings/NoirMode";
import { haptic, readHaptics, setHaptics, supportsHaptics } from "@/components/haptics/haptics";
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
 const [vibration,setVibration]=useState(true),[vibrationSupported,setVibrationSupported]=useState(false);
 useEffect(()=>{setVibration(readHaptics());setVibrationSupported(supportsHaptics());},[]);
 const [gearTurn,setGearTurn]=useState(0);
 const [ready,setReady]=useState(false),[lit,setLit]=useState(true),[leaving,setLeaving]=useState(false);
 const [motion,setMotion]=useState(true),[retro,setRetro]=useState(false),[settings,setSettings]=useState(false),[resetVersion,setResetVersion]=useState(0);
 const phone=usePhoneMotion();
 const [noir,setNoir]=useState(false);
 useEffect(()=>{setNoir(readNoirMode());},[]);
 const changeNoir=(enabled:boolean)=>{setNoir(enabled);applyNoirMode(enabled);};
 const rail=useRef<HTMLElement>(null),settingsPanel=useRef<HTMLElement>(null);
 const activePortal=useMobilePortals(rail);
 const router=useRouter(),settingsButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  const cover=new URLSearchParams(window.location.search).get("cover");
  if(cover&&covers.some(item=>item.id===cover))router.replace(`/covers?cover=${encodeURIComponent(cover)}`);
 },[router]);
 useEffect(()=>{
  if(!settings)return;
  const close=(event:KeyboardEvent)=>{if(event.key==="Escape"){setSettings(false);settingsButton.current?.focus();}};
  const outside=(event:PointerEvent)=>{const target=event.target as Node;if(!settingsPanel.current?.contains(target)&&!settingsButton.current?.contains(target))setSettings(false);};
  window.addEventListener("keydown",close);window.addEventListener("pointerdown",outside);
  return()=>{window.removeEventListener("keydown",close);window.removeEventListener("pointerdown",outside);};
 },[settings]);
 const enter=(href:string)=>{
  if(leaving)return;router.prefetch(href);setLeaving(true);
  window.dispatchEvent(new CustomEvent("portfolio:navigate",{detail:href}));
 };
 return <main className={styles.room} data-ready={ready} data-lit={lit} data-motion={motion} data-retro={retro} data-leaving={leaving}>
  <h1 className={styles.srOnly}>SCREAM VISION — Cover art, illustrations and collectible worlds</h1>
  <div className={styles.scene}><RoomScene lit={lit} motion={motion} gyro={phone.enabled} onGyroData={phone.onData} resetVersion={resetVersion} onReady={()=>setReady(true)}/></div>
  <div className={styles.focusVeil} aria-hidden="true"/>
  <div className={styles.screen} aria-hidden="true"/>
  <SiteNav />
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
  {settings&&<section ref={settingsPanel} id="room-settings" className={styles.settings} data-room-settings role="dialog" aria-label="Room settings">
   <div><h2>SETTINGS</h2><button aria-label="Close settings" onClick={()=>{setSettings(false);settingsButton.current?.focus();}}>×</button></div>
   <label>Motion / Parallax<input type="checkbox" checked={motion} onChange={event=>setMotion(event.target.checked)}/></label>
   <label>Retro screen<input type="checkbox" checked={retro} onChange={event=>setRetro(event.target.checked)}/></label>
   <label>Noir mode<input type="checkbox" checked={noir} onChange={event=>changeNoir(event.target.checked)}/></label>
   <label>Vibration{!vibrationSupported&&<small>Not supported</small>}<input type="checkbox" disabled={!vibrationSupported} checked={vibrationSupported&&vibration} onChange={event=>{const value=event.target.checked;setVibration(value);setHaptics(value);if(value)haptic("select");}}/></label>
   <PhoneMotionControl phone={phone} motion={motion}/>
   <button className={styles.resetView} onClick={()=>setResetVersion(value=>value+1)}>Reset camera</button>
   <p>Mouse to look · Wheel to zoom<br/>Arrow keys to select · Enter to open</p>
  </section>}
  <footer className={styles.consoleBar}>
   <div className={styles.controls}><span>CLICK TO EXPLORE</span><span>SCROLL TO ZOOM</span></div>
   <div className={styles.footerLinks}><a href="mailto:screamvisionmfer@gmail.com"> screamvisionmfer@gmail.com</a><a href="https://t.me/screamdesign" target="_blank" rel="noopener noreferrer">TELEGRAM</a><a href="https://www.behance.net/jimmyscream" target="_blank" rel="noopener noreferrer">BEHANCE</a><Link href="/about">ABOUT</Link></div>
   <button ref={settingsButton} className={styles.settingsGear} aria-label={settings?"Close room settings":"Open room settings"} aria-controls="room-settings" aria-expanded={settings} onClick={()=>{setGearTurn(value=>value+90);setSettings(value=>!value);}}><svg style={{transform:`rotate(${gearTurn}deg)`}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="m9 3-.7 2.2-2 .9-2.1-.5-2 3.4 1.5 1.7v2.5L2.2 15l2 3.4 2.1-.5 2 .9L9 21h4l.7-2.2 2-.9 2.1.5 2-3.4-1.5-1.8v-2.5l1.5-1.7-2-3.4-2.1.5-2-.9L13 3Z"/><circle cx="11" cy="12" r="3.2"/></svg></button>
  </footer>
 </main>;
}
