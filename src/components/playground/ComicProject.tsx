"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { useModalFocus } from "@/components/viewer-controls/useModalFocus";
import { haptic } from "@/components/haptics/haptics";
import styles from "./playground.module.css";

const project={id:"first-story",format:"Comic series",title:"Untitled story",status:"In development"};

export function ComicProject(){
 const [turned,setTurned]=useState(false),[briefing,setBriefing]=useState(false),[dragging,setDragging]=useState(false);
 const swiped=useRef(false);
 const book=useRef<HTMLButtonElement>(null),drag=useRef<{x:number;angle:number;moved:boolean}|null>(null),angle=useRef(-24);
 const dialog=useModalFocus<HTMLElement>(briefing);
 useEffect(()=>{if(!briefing)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setBriefing(false);};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[briefing]);
 const turn=()=>{const next=!turned;setTurned(next);angle.current=next?-160:-24;book.current?.style.setProperty("--turn",`${angle.current}deg`);haptic("select");};
 return <main className={styles.page}>
  <SiteNav/><Link className={styles.hubBack} href="/playground">← PLAYGROUND</Link>
  <div className={styles.ambient} aria-hidden="true"/><div className={styles.horizon} aria-hidden="true"/>
  <div className={styles.heading}><p><i/> SCREAM VISION / COMIC SERIES</p><h1>UNTITLED<span>01</span></h1><span>A story is taking shape.</span></div>
  <section className={styles.stage} aria-label="Selected project">
   <span className={styles.coordinate} aria-hidden="true">WORLD 01 <i/> UNRELEASED</span>
   <div className={styles.orbit} aria-hidden="true"/>
   <div className={styles.objectStage}>
    <div className={styles.bookShadow} aria-hidden="true"/>
    <button ref={book} className={styles.object} data-dragging={dragging} aria-label="Rotate the comic preview" aria-pressed={turned}
     onPointerDown={event=>{if(event.button!==0)return;swiped.current=false;drag.current={x:event.clientX,angle:angle.current,moved:false};event.currentTarget.setPointerCapture(event.pointerId);setDragging(true);}}
     onPointerMove={event=>{if(!drag.current)return;const delta=event.clientX-drag.current.x;if(Math.abs(delta)>6)drag.current.moved=true;angle.current=Math.max(-190,Math.min(35,drag.current.angle+delta*.55));event.currentTarget.style.setProperty("--turn",`${angle.current}deg`);}}
     onPointerUp={()=>{swiped.current=!!drag.current?.moved;if(drag.current?.moved){setTurned(angle.current<-90);haptic("tick");}drag.current=null;setDragging(false);}}
     onPointerCancel={()=>{drag.current=null;setDragging(false);}}
     onClick={event=>{if(event.detail===0||!swiped.current)turn();}}
     onKeyDown={event=>{if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();turn();}}}>
     <span className={styles.book}>
      <span className={styles.front}><span className={styles.coverTop}>SCREAM VISION <span>ORIGINAL SERIES</span></span><span className={styles.coverArt} aria-hidden="true"><i/><i/><i/><b>?</b></span><strong>A STORY<br/>IS TAKING<br/><em>SHAPE.</em></strong><span className={styles.coverBottom}><span>WORK IN PROGRESS</span><span>01 / ∞</span></span></span>
      <span className={styles.spine}>SCREAM VISION <i/> UNTITLED STORY</span>
      <span className={styles.paper}/>
      <span className={styles.back}><span>NOT EVERY WORLD<br/>STARTS WITH A MAP.</span><strong>THIS ONE<br/>STARTS<br/>WITH A<br/>STORY.</strong><span>SCREAM VISION / PLAYGROUND</span></span>
     </span>
    </button>
   </div>
   <div className={styles.objectTools}><button onClick={turn} aria-label="Turn comic preview">↻ <span>TURN</span></button><span>DRAG TO ROTATE</span></div>
   <div className={styles.projectInfo}><div><p><i/>{project.status}</p><h2>{project.title}</h2><span>{project.format} / A new world, still taking shape.</span></div><button className={styles.open} onClick={()=>{setBriefing(true);haptic("select");}}>PROJECT BRIEF <span>↗</span></button></div>
  </section>
  <footer className={styles.deck}><div className={styles.deckLabel}><span>ISSUE SELECT</span><span>SERIES IN DEVELOPMENT</span></div><div className={styles.slots}><button aria-current="true" onClick={()=>{setBriefing(true);haptic("select");}}><span className={styles.miniBook} aria-hidden="true">01</span><span><small>SERIES / IN DEVELOPMENT</small><strong>{project.title}</strong><em>IN DEVELOPMENT</em></span><i>↗</i></button><div className={styles.emptySlot}><span>02</span><p>The first issue is on its way.<small>The release date is still to be announced.</small></p></div></div></footer>
  {briefing&&<div className={styles.modal} onClick={event=>{if(event.target===event.currentTarget)setBriefing(false);}}><section ref={dialog} role="dialog" aria-modal="true" aria-labelledby="project-brief-title" className={styles.brief}><button className={styles.close} onClick={()=>setBriefing(false)} aria-label="Close project brief">×</button><p>WORLD 01 / PROJECT BRIEF</p><span className={styles.status}><i/> IN DEVELOPMENT</span><h2 id="project-brief-title">A NEW STORY.<br/>A NEW WORLD.</h2><p className={styles.briefCopy}>An original comic series by SCREAM VISION. The story, its characters and its visual world are in development.</p><div className={styles.release}><span>FIRST RELEASE</span><strong>Still in the making.</strong><p>No issues have been published yet. This is where the series will live.</p></div><a href="https://x.com/scream_vision" target="_blank" rel="noopener noreferrer">FOLLOW THE PROGRESS <span>↗</span></a><button className={styles.return} onClick={()=>setBriefing(false)}>← BACK TO THE SERIES</button></section></div>}
 </main>;
}
