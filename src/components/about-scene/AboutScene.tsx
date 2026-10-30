"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { isPageActive, observePageActivity } from "@/components/site-nav/pageActivity";
import { usePhoneMotion } from "@/components/portfolio-home/usePhoneMotion";
import styles from "./aboutScene.module.css";

export function AboutScene(){
 const root=useRef<HTMLElement>(null),scene=useRef<HTMLDivElement>(null);
 const [loaded,setLoaded]=useState(0);
 const phone=usePhoneMotion(),sensors=useRef({enabled:phone.enabled,onData:phone.onData});
 useEffect(()=>{sensors.current={enabled:phone.enabled,onData:phone.onData};},[phone.enabled,phone.onData]);
 useEffect(()=>{
  const element=root.current,visual=scene.current;if(!element||!visual)return;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)"),coarse=window.matchMedia("(pointer:coarse)");
  let frame=0,visible=true,x=0,y=0,targetX=0,targetY=0,scroll=0,last=performance.now(),idle=0,baseline: {beta:number;gamma:number}|null=null;
  const pointer=(event:PointerEvent)=>{if(coarse.matches||!isPageActive())return;targetX=(event.clientX/window.innerWidth-.5)*28;targetY=(event.clientY/window.innerHeight-.5)*18;};
  const reset=()=>{targetX=0;targetY=0;};
  const orientation=(event:DeviceOrientationEvent)=>{
   if(!sensors.current.enabled||reduced.matches||!isPageActive()||event.beta===null||event.gamma===null)return;
   if(!baseline)baseline={beta:event.beta,gamma:event.gamma};
   const angle=(screen.orientation?.angle??0)*Math.PI/180;
   const dx=Math.max(-15,Math.min(15,event.gamma-baseline.gamma)),dy=Math.max(-15,Math.min(15,event.beta-baseline.beta));
   targetX=(dx*Math.cos(angle)+dy*Math.sin(angle))*.9;targetY=(dy*Math.cos(angle)-dx*Math.sin(angle))*.6;
   sensors.current.onData();
  };
  const recalibrate=()=>{baseline=null;reset();};
  const onScroll=()=>{scroll=Math.min(element.scrollTop,window.innerHeight);};
  const tick=(now:number)=>{
   const dt=Math.min(64,now-last);last=now;idle+=dt;
   const ease=1-Math.exp(-dt/160);x+=(targetX-x)*ease;y+=(targetY-y)*ease;
   element.style.setProperty("--look-x",`${(x+Math.sin(idle/4200)*1.8).toFixed(2)}px`);
   element.style.setProperty("--look-y",`${(y+Math.cos(idle/5100)*1.2).toFixed(2)}px`);
   element.style.setProperty("--scene-scroll",`${(scroll*.09).toFixed(2)}px`);
   frame=requestAnimationFrame(tick);
  };
  const sync=()=>{visual.dataset.animate=String(!reduced.matches&&visible&&isPageActive());cancelAnimationFrame(frame);if(!reduced.matches&&visible&&isPageActive()){last=performance.now();frame=requestAnimationFrame(tick);}else if(reduced.matches){element.style.setProperty("--look-x","0px");element.style.setProperty("--look-y","0px");element.style.setProperty("--scene-scroll","0px");}};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(visual);
  const stop=observePageActivity(sync);reduced.addEventListener("change",sync);
  window.addEventListener("pointermove",pointer,{passive:true});window.addEventListener("blur",reset);window.addEventListener("deviceorientation",orientation,{passive:true});window.addEventListener("orientationchange",recalibrate);
  element.addEventListener("scroll",onScroll,{passive:true});sync();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();stop();reduced.removeEventListener("change",sync);window.removeEventListener("pointermove",pointer);window.removeEventListener("blur",reset);window.removeEventListener("deviceorientation",orientation);window.removeEventListener("orientationchange",recalibrate);element.removeEventListener("scroll",onScroll);};
 },[]);
 return <main ref={root} className={styles.page} data-ready={loaded===3}>
  <SiteNav/>
  <div ref={scene} className={styles.scene} role="img" aria-label="SCREAM VISION beside a green car, with a low-poly city skyline at night">
   <div className={styles.city}><Image src="/scene/about/night-city.webp" alt="" fill sizes="100vw" priority unoptimized onLoad={()=>setLoaded(value=>value|1)} onError={()=>setLoaded(value=>value|1)}/><div className={styles.shootingStars} aria-hidden="true"><span/><span/></div></div>
   <div className={styles.cityShade}/>
   <div className={styles.subject}><div className={styles.subjectMotion}><Image src="/scene/about/artist-sedan.webp" alt="" fill sizes="(max-width: 700px) 210vw, 85vw" priority unoptimized onLoad={()=>setLoaded(value=>value|2)} onError={()=>setLoaded(value=>value|2)}/></div></div>
   <div className={styles.vignette}/>
   <div className={styles.sceneCaption} aria-hidden="true"><span>SCREAM VISION</span><span>AFTER HOURS / 02</span></div>
  </div>
  <section className={styles.dossier} aria-labelledby="about-title">
   <p className={styles.eyebrow}><i/> INDEPENDENT DIGITAL ARTIST</p>
   <h1 id="about-title">Scream<br/><em>Vision.</em></h1>
   <p className={styles.artistStatement}>Cover art with a story.<br/>Characters with an attitude.</p>
   <p className={styles.bio}>I’m an independent artist creating cover art, motion and illustrated worlds for music and collectibles. I turn ideas into characters, atmosphere and images with a life of their own.</p>
   <div className={styles.projectCta}>
    <a className={styles.primaryCta} href="mailto:screamvisionmfer@gmail.com?subject=New%20project"><span>LET’S MAKE<br/><strong>SOMETHING YOURS.</strong></span><i aria-hidden="true">↗</i></a>
    <span className={styles.email}>screamvisionmfer@gmail.com</span>
   </div>
   <nav className={styles.workLinks} aria-label="Explore my work">
    <Link href="/covers">COVER ART <span aria-hidden="true">↗</span></Link>
    <Link href="/illustrations">ILLUSTRATION <span aria-hidden="true">↗</span></Link>
    <Link href="/cards">CARDS <span aria-hidden="true">↗</span></Link>
    <Link href="/collaborations">COLLABORATIONS <span aria-hidden="true">↗</span></Link>
   </nav>
   <footer className={styles.footer}><a href="https://t.me/screamdesign" target="_blank" rel="noopener noreferrer">TELEGRAM ↗</a><a href="https://www.behance.net/jimmyscream" target="_blank" rel="noopener noreferrer">BEHANCE ↗</a>{phone.status!=="unavailable"&&!phone.enabled&&<button onClick={()=>void phone.toggle()} disabled={phone.status==="requesting"}>{phone.status==="requesting"?"CONNECTING…":"ENABLE PHONE TILT"}</button>}</footer>
  </section>
 </main>;
}
