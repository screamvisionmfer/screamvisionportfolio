"use client";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PortfolioImage } from "@/components/portfolio-image/PortfolioImage";
import { CardRail } from "@/components/card-archive/CardRail";
import { useModalFocus } from "@/components/viewer-controls/useModalFocus";
import { type CoverProject } from "@/data/projects";
import styles from "./artistArchive.module.css";
export function ArtistArchive({items,current,onClose,onSelect}:{items:CoverProject[];current:string;onClose:()=>void;onSelect:(slug:string)=>void}){
 const rail=useRef<HTMLDivElement>(null);
 const dialog=useModalFocus<HTMLElement>(true);
 const [active,setActive]=useState(Math.max(0,items.findIndex(item=>item.slug===current)));
 return createPortal(<div className={styles.backdrop} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
  <section ref={dialog} className={styles.panel} role="dialog" aria-modal="true" aria-label={`${items[0].artist} projects`} tabIndex={-1} onKeyDown={event=>{if(event.key==="Escape"){event.stopPropagation();onClose();}}}>
   <header><div><p>Artist archive · {items.length} projects</p><h2>{items[0].artist}</h2></div><button onClick={onClose} aria-label="Close artist archive">×</button></header>
   <div className={styles.stage}><CardRail rootRef={rail} index={active} count={items.length} onActiveChange={setActive} wheelMode="steps">
    {items.map((item,index)=><button className={styles.work} key={item.slug} aria-label={`Open ${item.title}`} aria-current={item.slug===current?"true":undefined} onClick={()=>{if(index!==active)setActive(index);else onSelect(item.slug);}}>
     <span className={styles.art}><PortfolioImage src={item.cover} alt={item.title} fill sizes="(max-width:700px) 200px, 280px" draggable={false}/>{item.slug===current&&<i>Viewing</i>}</span>
     <strong>{item.title}</strong>{item.year&&<small>{item.year}</small>}
    </button>)}
   </CardRail></div>
   <footer><span>{String(active+1).padStart(2,"0")} / {String(items.length).padStart(2,"0")}</span><button onClick={()=>onSelect(items[active].slug)}>{items[active].slug===current?"Return to project":"Open project"}<span>↗</span></button></footer>
  </section>
 </div>,document.body);
}
