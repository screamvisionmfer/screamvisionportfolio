"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { haptic } from "@/components/haptics/haptics";
import { useModalFocus } from "@/components/viewer-controls/useModalFocus";
import { observePageActivity, isPageActive } from "@/components/site-nav/pageActivity";
import styles from "./worldHub.module.css";

const worlds=[
 {id:"story",title:"Untitled story",type:"Comic series",status:"IN DEVELOPMENT",note:"A story. Its characters. A world of its own.",color:"#bba477",glow:"#6b593e",href:"/playground/untitled-story"},
 {id:"motion",title:"Motion study",type:"Moving images",status:"VISUAL PROTOTYPE",note:"An empty stage for moving images and visual experiments.",color:"#8ea8b4",glow:"#294757",href:null},
 {id:"signal",title:"Character lab",type:"Characters / Experiments",status:"VISUAL PROTOTYPE",note:"A placeholder world for characters, ideas and unexpected things.",color:"#b19dba",glow:"#54375b",href:null},
];

function WorldArt({kind}:{kind:string}){
 return <span className={styles.art} data-kind={kind} aria-hidden="true">
  {kind==="story"?<span className={styles.story}><i/><i/><i/><span className={styles.storySun}/><span className={styles.storyFloor}/><b>01</b></span>:kind==="motion"?<span className={styles.motion}>{[0,1,2,3,4,5].map(n=><i key={n} style={{"--ring":n} as CSSProperties}/>)}<b/></span>:<span className={styles.signal}><span className={styles.core}/>{[0,1,2].map(n=><i key={n} style={{"--ring":n} as CSSProperties}/>)}<span className={styles.monolith}/><b>?</b></span>}
  <span className={styles.artFloor}/>
 </span>;
}

export function Playground(){
 const [selected,setSelected]=useState(0),[entering,setEntering]=useState(false),[preview,setPreview]=useState(false),[active,setActive]=useState(true);
 const current=worlds[selected],stage=useRef<HTMLDivElement>(null),lastWheel=useRef(0),wheelSum=useRef(0),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const gesture=useRef<{x:number;y:number;time:number}|null>(null),swiped=useRef(false),dialog=useModalFocus<HTMLElement>(preview);
 const move=(direction:number)=>{if(entering)return;setSelected(value=>(value+direction+worlds.length)%worlds.length);haptic("select");};
 const open=()=>{if(entering)return;if(!current.href){setPreview(true);haptic("select");return;}setEntering(true);haptic("select");const href=current.href;if(matchMedia("(prefers-reduced-motion:reduce)").matches){window.dispatchEvent(new CustomEvent("portfolio:navigate",{detail:href}));return;}timer.current=setTimeout(()=>window.dispatchEvent(new CustomEvent("portfolio:navigate",{detail:href})),300);};
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 useEffect(()=>{const sync=()=>setActive(isPageActive());sync();return observePageActivity(sync);},[]);
 useEffect(()=>{const keys=(event:KeyboardEvent)=>{if(document.documentElement.dataset.navigationOpen==="true"||preview||entering)return;if(event.key==="ArrowRight"||event.key==="ArrowLeft"){event.preventDefault();setSelected(value=>(value+(event.key==="ArrowRight"?1:-1)+worlds.length)%worlds.length);haptic("tick");}};window.addEventListener("keydown",keys);return()=>window.removeEventListener("keydown",keys);},[preview,entering]);
 useEffect(()=>{const element=stage.current;if(!element)return;const wheel=(event:WheelEvent)=>{if(event.ctrlKey||preview||entering)return;event.preventDefault();const now=performance.now();if(now-lastWheel.current<650)return;wheelSum.current+=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;if(Math.abs(wheelSum.current)<24)return;const direction=wheelSum.current>0?1:-1;wheelSum.current=0;lastWheel.current=now;setSelected(value=>(value+direction+worlds.length)%worlds.length);haptic("tick");};element.addEventListener("wheel",wheel,{passive:false});return()=>element.removeEventListener("wheel",wheel);},[preview,entering]);
 return <main className={styles.page} style={{"--accent":current.color,"--world-glow":current.glow} as CSSProperties} data-entering={entering} data-active={active&&!preview}>
  <SiteNav/>
  <div className={styles.atmosphere} aria-hidden="true">{worlds.map((world,index)=><span key={world.id} data-active={index===selected} style={{background:`radial-gradient(ellipse at 50% 52%,${world.glow}66,transparent 64%)`}}/>)}</div>
  <div className={styles.heading}><p>SCREAM VISION / WORLD SELECT</p><h1>PLAYGROUND<span>+</span></h1></div>
  <div className={styles.topStatus}><span>EXPERIMENTS IN PROGRESS</span><span>01 PROJECT / 02 VISUAL STUDIES</span></div>
  <section className={styles.worldSelect} aria-label="Choose a project world">
   <div ref={stage} className={styles.stage} tabIndex={0} aria-label="Swipe, scroll or use arrow keys to select a world"
    onPointerDown={event=>{if(event.button!==0||entering)return;swiped.current=false;gesture.current={x:event.clientX,y:event.clientY,time:performance.now()};}}
    onPointerMove={event=>{const el=stage.current;if(!el)return;if(gesture.current){el.style.setProperty("--drag",`${Math.max(-90,Math.min(90,(event.clientX-gesture.current.x)*.3))}px`);return;}if(event.pointerType==="touch"||matchMedia("(prefers-reduced-motion:reduce)").matches)return;const rect=el.getBoundingClientRect();el.style.setProperty("--look-x",`${(event.clientX-rect.left-rect.width/2)/rect.width*8}deg`);el.style.setProperty("--look-y",`${-(event.clientY-rect.top-rect.height/2)/rect.height*5}deg`);}}
    onPointerUp={event=>{const start=gesture.current;gesture.current=null;event.currentTarget.style.setProperty("--drag","0px");if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y,velocity=Math.abs(dx)/Math.max(1,performance.now()-start.time);if(Math.abs(dx)>Math.abs(dy)&&(Math.abs(dx)>40||(Math.abs(dx)>18&&velocity>.45))){swiped.current=true;move(dx<0?1:-1);}}}
    onPointerCancel={()=>{gesture.current=null;stage.current?.style.setProperty("--drag","0px");}}
    onPointerLeave={()=>{gesture.current=null;stage.current?.style.setProperty("--drag","0px");stage.current?.style.setProperty("--look-x","0deg");stage.current?.style.setProperty("--look-y","0deg");}}>
    <div className={styles.ground} aria-hidden="true"/>
    {worlds.map((world,index)=>{let offset=(index-selected+worlds.length)%worlds.length;if(offset>1)offset-=worlds.length;return <button key={world.id} className={styles.world} data-offset={offset} data-kind={world.id} style={{"--local-accent":world.color} as CSSProperties} tabIndex={offset===0?0:-1} aria-label={offset===0?`Open ${world.title}`:`Select ${world.title}`} onClick={()=>{if(swiped.current){swiped.current=false;return;}if(offset===0)open();else{setSelected(index);haptic("select");}}}><WorldArt kind={world.id}/><span className={styles.sideLabel}>{world.title}<small>{world.status}</small></span></button>;})}
   </div>
   <div className={styles.selection} key={current.id}><p><i/>{current.status}<span>/ {current.type}</span></p><h2>{current.title}</h2><span>{current.note}</span></div>
   <div className={styles.actions}><button className={styles.enter} onClick={open}>{current.href?"ENTER WORLD":"EXPLORE STUDY"}</button></div>
  </section>
  <footer className={styles.footer}><span>DRAG / SCROLL TO SELECT</span><nav aria-label="World selection">{worlds.map((world,index)=><button key={world.id} aria-label={`Select ${world.title}`} aria-current={selected===index} onClick={()=>{if(!entering){setSelected(index);haptic("tick");}}}><small>0{index+1}</small><span>{world.title}</span><i/></button>)}</nav><span>{String(selected+1).padStart(2,"0")} <i>/ 03</i></span></footer>
  {preview&&<div className={styles.overlay} onClick={event=>{if(event.target===event.currentTarget)setPreview(false);}}><section ref={dialog} className={styles.study} role="dialog" aria-modal="true" aria-labelledby="study-title" onKeyDown={event=>{if(event.key==="Escape")setPreview(false);}}><button className={styles.close} aria-label="Close study" onClick={()=>setPreview(false)}>×</button><p>PLAYGROUND / VISUAL PROTOTYPE</p><div className={styles.studyArt}><WorldArt kind={current.id}/></div><div className={styles.studyText}><h2 id="study-title">{current.title}</h2><p>A visual study for the hub. No project has been released here yet.</p><button onClick={()=>setPreview(false)}>← BACK TO WORLD SELECT</button></div></section></div>}
 </main>;
}
