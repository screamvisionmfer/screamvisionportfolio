"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { haptic } from "@/components/haptics/haptics";
import styles from "./categoryHub.module.css";

const categories = [
 {name:"Comics",label:"Stories & issues",color:"#d7bd71",art:"/illustrations/BRAIN%20SLAYER.webp"},
 {name:"Motion",label:"Loops & moving images",color:"#9cc7d9",art:"/covers/crash-rarri/hottest-otw/cover.webp"},
 {name:"Characters",label:"Faces & other creatures",color:"#b7d77e",art:"/illustrations/BRAINLET.webp"},
 {name:"Experiments",label:"Ideas without limits",color:"#cf9cc5",art:"/illustrations/BRAINLAKE.webp"},
];

export function Playground(){
 const [selected,setSelected]=useState(0),[opened,setOpened]=useState<number|null>(null),[entering,setEntering]=useState(false);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const back=useRef<HTMLButtonElement>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 useEffect(()=>{if(opened!==null)back.current?.focus();},[opened]);
 const open=(index:number)=>{if(entering)return;setSelected(index);setEntering(true);haptic("select");timer.current=setTimeout(()=>{setOpened(index);setEntering(false);},matchMedia("(prefers-reduced-motion: reduce)").matches?0:500);};
 return <main className={styles.page} style={{"--accent":categories[selected].color} as CSSProperties} data-entering={entering}>
  <SiteNav/>
  <div className={styles.ambient} aria-hidden="true"/>
  {opened===null?<section className={styles.hub}>
   <header className={styles.header}><p>SCREAM VISION / CREATIVE PLAYGROUND</p><h1>PLAYGROUND<span>+</span></h1><span>Pick a world. See where it goes.</span></header>
   <div className={styles.panels} aria-label="Playground categories">
    {categories.map((category,index)=><button key={category.name} className={styles.panel} data-selected={selected===index} style={{"--color":category.color,"--order":index} as CSSProperties} onPointerEnter={()=>setSelected(index)} onFocus={()=>setSelected(index)} onClick={()=>open(index)}>
     {/* Temporary artwork until each category has its own projects. */}
     <span className={styles.picture} style={{backgroundImage:`url("${category.art}")`}}/>
     <span className={styles.wash}/><span className={styles.number}>0{index+1}</span>
     <span className={styles.caption}><small>{category.label}</small><strong>{category.name}</strong></span>
    </button>)}
   </div>
   <footer className={styles.footer}><span>STORIES / MOTION / UNEXPECTED THINGS</span><span>WORK IN PROGRESS</span></footer>
  </section>:<section className={styles.category} onKeyDown={event=>{if(event.key==="Escape")setOpened(null);}}>
   <button ref={back} className={styles.back} onClick={()=>setOpened(null)}>← PLAYGROUND</button>
   <header><p>PLAYGROUND / 0{opened+1}</p><h1>{categories[opened].name}</h1></header>
   {opened===0?<button className={styles.project} onClick={()=>window.dispatchEvent(new CustomEvent("portfolio:navigate",{detail:"/playground/untitled-story"}))}><span className={styles.book}><i>SCREAM VISION</i><b>UNTITLED<br/>STORY.</b><small>01</small></span><span><small>IN DEVELOPMENT</small><strong>Untitled story</strong><span>Explore the project</span></span></button>:<div className={styles.empty}><span>+</span><h2>Something new starts here.</h2><p>No projects released yet.</p></div>}
  </section>}
 </main>;
}
