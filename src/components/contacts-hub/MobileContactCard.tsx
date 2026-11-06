"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./mobileContactCard.module.css";

type HubLink={label:string;href:string;note:string};
type LinkGroup={label:string;links:HubLink[]};
const email="screamvisionmfer@gmail.com",contactUrl="https://thescreamvision.vercel.app/contacts";
const works=[{href:"/covers",title:"COVER ART",image:"covers"},{href:"/illustrations",title:"ILLUSTRATION",image:"illustrations"},{href:"/cards",title:"CARD PACKS",image:"cards"},{href:"/collaborations",title:"COLLABORATIONS",image:"collaborations"},{href:"/collections",title:"NFT COLLECTIONS",image:"collections"}];

function Icon({name}:{name:"arrow"|"share"|"save"|"copy"|"mail"|"send"}){
 const paths={arrow:"M5 19 19 5M5 5h14v14",share:"M12 16V3m-5 5 5-5 5 5M5 13v7h14v-7",save:"M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4",copy:"M8 8h12v12H8zM16 8V4H4v12h4",mail:"M3 5h18v14H3zM3 6l9 7 9-7",send:"m3 10 18-7-7 18-4-7-7-4Zm7 4L21 3"};
 return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>;
}
function LinkFolder({title,links}:{title:string;links:HubLink[]}){
 const [open,setOpen]=useState(false),id=`contact-folder-${title.toLowerCase().replaceAll(" ","-")}`;
 return <section className={styles.folder}>
  <button aria-expanded={open} aria-controls={id} onClick={()=>setOpen(value=>!value)}><span>{title}</span><small>{String(links.length).padStart(2,"0")}</small><i aria-hidden="true" data-open={open}>+</i></button>
  <div id={id} className={styles.folderPanel} data-open={open} aria-hidden={!open} inert={!open}><div><div className={styles.folderLinks}>{links.map(link=><a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"><span><strong>{link.label}</strong><small>{link.note}</small></span><Icon name="arrow"/></a>)}</div></div></div>
 </section>;
}
async function writeClipboard(value:string){
 try{await navigator.clipboard.writeText(value);return true;}catch{
  const previous=document.activeElement as HTMLElement|null,field=document.createElement("textarea");field.value=value;field.readOnly=true;field.style.cssText="position:fixed;left:-9999px;top:0;";document.body.appendChild(field);field.select();let copied=false;
  try{copied=document.execCommand("copy");}catch{}finally{field.remove();previous?.focus({preventScroll:true});}return copied;
 }
}
export function MobileContactCard({groups}:{groups:LinkGroup[]}){
 const [message,setMessage]=useState(""),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const notify=(text:string)=>{setMessage(text);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setMessage(""),3200);};
 const copy=async()=>notify(await writeClipboard(email)?"Email copied":"Long-press the email to copy it");
 const share=async()=>{
  if(navigator.share){try{await navigator.share({title:"SCREAM VISION",text:"Cover art, illustration & collectible worlds.",url:contactUrl});return;}catch(error){if(error instanceof DOMException&&error.name==="AbortError")return;}}
  notify(await writeClipboard(contactUrl)?"Profile link copied":"Share this page from your browser menu");
 };
 const socials=[...groups[0].links.filter(link=>link.label!=="Telegram"),groups[1].links.find(link=>link.label==="Behance")!];
 return <article className={styles.card} aria-label="SCREAM VISION artist contact card">
  <div className={styles.hero} aria-hidden="true"><Image className={styles.city} src="/scene/about/night-city.webp" alt="" fill sizes="760px" unoptimized/><div className={styles.heroShade}/><div className={styles.portrait}><Image src="/scene/about/contact-portrait.webp" alt="" fill sizes="250px" unoptimized/></div><span className={styles.heroLabel}>ARTIST PROFILE <i/> 06</span></div>
  <div className={styles.body}>
   <header className={styles.identity}><p><i/> INDEPENDENT DIGITAL ARTIST</p><h1>SCREAM<br/>VISION.</h1><span>Cover art. Characters. Worlds.</span><p className={styles.bio}>Artwork and motion for music artists<br/>and collectible projects.</p></header>
   <div className={styles.primaryLinks}><a href="https://t.me/screamdesign" target="_blank" rel="noopener noreferrer"><Icon name="send"/><strong>TELEGRAM</strong><small>Let’s talk about your project</small><span>↗</span></a><a href={`mailto:${email}?subject=New%20project`}><Icon name="mail"/><strong>EMAIL</strong><small>Start a conversation</small><span>↗</span></a></div>
   <button className={styles.copyEmail} onClick={()=>void copy()} aria-label="Copy email address"><span>{email}</span><Icon name="copy"/></button>
   <div className={styles.utilities}><a href="/scream-vision.vcf" download="SCREAM-VISION.vcf"><Icon name="save"/><span>SAVE CONTACT</span></a><button onClick={()=>void share()}><Icon name="share"/><span>SHARE PROFILE</span></button></div>
   <nav className={styles.socials} aria-label="Social profiles">{socials.map(link=><a href={link.href} key={link.label} target="_blank" rel="noopener noreferrer">{link.label==="X / Twitter"?"X / TWITTER":link.label.toUpperCase()}<span aria-hidden="true">↗</span></a>)}</nav>
   <section className={styles.work} aria-labelledby="contact-work-title"><h2 id="contact-work-title">EXPLORE MY WORLD <span>05</span></h2><nav aria-label="Portfolio sections">{works.map(work=><Link href={work.href} key={work.href}><Image src={`/menu-previews/${work.image}.webp`} alt="" fill sizes="(max-width: 760px) 45vw, 200px" unoptimized/><span>{work.title}</span><Icon name="arrow"/></Link>)}</nav></section>
   <div className={styles.folders}><LinkFolder title="Marketplaces" links={groups[2].links}/><LinkFolder title="Collections" links={groups[3].links}/><LinkFolder title="More portfolio" links={groups[1].links.filter(link=>link.label!=="Behance")}/></div>
   <footer className={styles.footer}><span>SCREAM VISION</span><Link href="/about">MEET THE ARTIST ↗</Link></footer>
  </div>
  <div className={styles.toast} role="status" aria-live="polite" data-visible={Boolean(message)}>{message}</div>
 </article>;
}
