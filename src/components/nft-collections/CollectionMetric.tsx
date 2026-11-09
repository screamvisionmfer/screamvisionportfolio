"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import page from "./collectionProject.module.css";
type Props={root:RefObject<HTMLElement|null>;label:string;value:number;note:string;index:number;ratio?:number;unit?:string;compact?:boolean;art?:string};
export function CollectionMetric({root,label,value,note,index,ratio,unit,compact,art}:Props){
 const card=useRef<HTMLElement>(null),number=useRef<HTMLSpanElement>(null),[visible,setVisible]=useState(false);
 useEffect(()=>{if(!card.current)return;const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=.55)){setVisible(true);observer.disconnect();}},{root:root.current,threshold:[.55],rootMargin:"-65px 0px -25px 0px"});observer.observe(card.current);return()=>observer.disconnect();},[root]);
 useEffect(()=>{if(!visible)return;let frame=0;const reduced=matchMedia("(prefers-reduced-motion:reduce)").matches,start=performance.now()+(reduced?0:350+(index%3)*160),duration=reduced?0:2800;
 const formatter=new Intl.NumberFormat("en-US",compact?{notation:"compact",maximumFractionDigits:1}:{maximumFractionDigits:0});
 const tick=(now:number)=>{const t=duration?Math.max(0,Math.min(1,(now-start)/duration)):1;const eased=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;if(number.current)number.current.textContent=formatter.format(value*eased);if(t<1)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[visible,value,compact,index]);
 return <article ref={card} className={page.metricPanel} data-visible={visible} style={{"--metric-delay":`${(index%3)*160}ms`,"--fill":ratio??1} as CSSProperties}>{art&&<span className={page.metricGhost} aria-hidden="true"><Image src={art} alt="" fill sizes="200px" unoptimized/></span>}<span className={page.metricLabel}><i/> {label}</span><strong><span ref={number}>0</span>{unit&&<small>{unit}</small>}</strong>{ratio!==undefined?<div className={page.bar} role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={ratio>0?Math.round(value/ratio):value||1}><i/></div>:<div className={page.scanLine}/>}<small>{note}</small></article>;
}
