"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { mediaSource } from "@/components/portfolio-image/PortfolioImage";
import { haptic } from "@/components/haptics/haptics";
import { menuArtwork } from "./menuArtwork";
import styles from "./mobileFocusMenu.module.css";

const sections=[
 {href:"/covers",name:"Covers",note:"Music / Artwork"},
 {href:"/illustrations",name:"Illustrations",note:"Characters / Worlds"},
 {href:"/cards",name:"Cards",note:"Collect / Unseal"},
 {href:"/collaborations",name:"Collaborations",note:"Shared universes"},
 {href:"/collections",name:"Collections",note:"Original worlds"},
 {href:"/playground",name:"Playground",note:"Stories / Experiments"},
];
const utilities=[{href:"/",name:"Home",note:"Choose your next world"},{href:"/about",name:"About",note:"The artist behind the worlds"},{href:"/contacts",name:"Contacts",note:"Start something together"}];
const all=[...sections,...utilities];

function pickArtwork(){
 const chosen:Record<string,string>={};
 for(const [href,images] of Object.entries(menuArtwork)){
  let last="";try{last=sessionStorage.getItem(`menu:last:${href}`)??"";}catch{}
  const candidates=images.filter(image=>image!==last),pool=candidates.length?candidates:images;
  chosen[href]=mediaSource(pool[Math.floor(Math.random()*pool.length)],640);
  try{sessionStorage.setItem(`menu:last:${href}`,pool.find(image=>mediaSource(image,640)===chosen[href])??"");}catch{}
 }
 return chosen;
}

export function MobileFocusMenu({activeHref,pathname,onClose}:{activeHref:string;pathname:string;onClose:()=>void}){
 const initial=sections.some(item=>item.href===activeHref)?activeHref:"/covers";
 const [artwork]=useState(pickArtwork),[selected,setSelected]=useState(initial),[pending,setPending]=useState(false),[committed,setCommitted]=useState(false);
 const [frame,setFrame]=useState({src:artwork[initial],previous:null as string|null});
 const current=useRef(artwork[initial]),request=useRef(0),hold=useRef<ReturnType<typeof setTimeout>|null>(null),loading=useRef<HTMLImageElement|null>(null),timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 const info=all.find(item=>item.href===selected)??sections[0];
 useEffect(()=>{const images=sections.map(item=>{const image=new window.Image();image.decoding="async";image.src=artwork[item.href];return image;});return()=>{for(const image of images){image.onload=null;image.onerror=null;}};},[artwork]);
 const cancel=()=>{request.current++;if(hold.current)clearTimeout(hold.current);if(timeout.current)clearTimeout(timeout.current);if(loading.current){loading.current.onload=null;loading.current.onerror=null;}};
 useEffect(()=>()=>{request.current++;if(hold.current)clearTimeout(hold.current);if(timeout.current)clearTimeout(timeout.current);if(loading.current){loading.current.onload=null;loading.current.onerror=null;}},[]);
 const choose=(event:MouseEvent<HTMLAnchorElement>,href:string)=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();if(committed)return;
  cancel();if(href===pathname){onClose();return;}
  setSelected(href);setPending(true);haptic("select");const token=request.current,src=artwork[href];
  if(matchMedia("(prefers-reduced-motion:reduce)").matches){setCommitted(true);window.dispatchEvent(new CustomEvent("portfolio:menu-navigate",{detail:href}));return;}
  let scheduled=false;
  const finish=(loaded:boolean)=>{
   if(request.current!==token)return;
   if(loaded&&src!==current.current){const previous=current.current;current.current=src;setFrame({src,previous});}
   if(scheduled)return;scheduled=true;if(timeout.current)clearTimeout(timeout.current);
   hold.current=setTimeout(()=>{if(request.current!==token)return;setCommitted(true);window.dispatchEvent(new CustomEvent("portfolio:menu-navigate",{detail:href}));},600);
  };
  if(src===current.current){finish(true);return;}
  const image=new window.Image();loading.current=image;image.decoding="async";
  image.onload=()=>{void image.decode().catch(()=>{}).then(()=>finish(true));};image.onerror=()=>finish(false);image.src=src;
  timeout.current=setTimeout(()=>finish(false),350);
 };
 return <div className={styles.root} role="dialog" aria-modal="true" aria-label="World select" data-pending={pending} data-committed={committed}>
  <div className={styles.visual} aria-hidden="true">{frame.previous&&<Image src={frame.previous} alt="" fill sizes="100vw" unoptimized/>}<div key={frame.src} className={styles.incoming}><Image src={frame.src} alt="" fill sizes="100vw" unoptimized priority/></div><span/></div>
  <div className={styles.caption} key={selected}><p>{sections.some(item=>item.href===selected)?`${String(sections.findIndex(item=>item.href===selected)+1).padStart(2,"0")} / 06`:"SCREAM VISION"}</p><h2>{info.name}</h2><span>{info.note}</span></div>
  <nav className={styles.links} aria-label="Portfolio sections">{sections.map((item,index)=><Link key={item.href} href={item.href} data-cinematic-link="true" data-selected={selected===item.href} aria-current={activeHref===item.href?"page":undefined} onClick={event=>choose(event,item.href)}><small>{String(index+1).padStart(2,"0")}</small><span>{item.name}</span></Link>)}</nav>
  <nav className={styles.utilities} aria-label="Information and contacts">{utilities.map(item=><Link key={item.href} href={item.href} data-cinematic-link="true" data-selected={selected===item.href} onClick={event=>choose(event,item.href)}>{item.name}</Link>)}</nav>
 </div>;
}
