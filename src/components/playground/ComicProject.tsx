"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { haptic } from "@/components/haptics/haptics";
import styles from "./playground.module.css";



export function ComicProject(){
 const [turned,setTurned]=useState(false),[dragging,setDragging]=useState(false);
 const swiped=useRef(false);
 const book=useRef<HTMLButtonElement>(null),drag=useRef<{x:number;angle:number;moved:boolean}|null>(null),angle=useRef(-24);
 const turn=()=>{const next=!turned;setTurned(next);angle.current=next?-160:-24;book.current?.style.setProperty("--turn",`${angle.current}deg`);haptic("select");};
 return <main className={`${styles.page} ${styles.comicPage}`}>
  <SiteNav/><Link className={styles.hubBack} href="/playground">← PLAYGROUND</Link>
  <div className={styles.ambient} aria-hidden="true"/><div className={styles.horizon} aria-hidden="true"/>
  <section className={styles.stage} aria-label="Selected project">
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
   <div className={styles.comicCaption}><h1>UNTITLED STORY</h1><span>Drag to rotate</span></div>
  </section>
 </main>;
}
