"use client";
import { useEffect, useRef, useState } from "react";
import { PortfolioImage, mediaSource } from "@/components/portfolio-image/PortfolioImage";
import styles from "./portfolioHome.module.css";

/** Decode the next artwork before fading it over the current one. */
export function PortalArtwork({src,priority,onReady}:{src:string;priority?:boolean;onReady?:()=>void}){
 const [art,setArt]=useState({current:src,previous:null as string|null});
 const current=useRef(src);
 useEffect(()=>{
  if(src===current.current)return;
  let cancelled=false,cleanup:ReturnType<typeof setTimeout>|undefined;
  const image=new window.Image();image.decoding="async";
  const reveal=()=>{if(cancelled)return;const previous=current.current;current.current=src;setArt({current:src,previous});cleanup=setTimeout(()=>{if(!cancelled)setArt(value=>({...value,previous:null}));},750);};
  image.onload=()=>{void image.decode().catch(()=>{}).then(reveal);};
  const displayWidth=innerWidth<=600?innerWidth*.6:240;
  image.src=mediaSource(src,Math.ceil(displayWidth*(devicePixelRatio||1)));
  return()=>{cancelled=true;image.onload=null;if(cleanup)clearTimeout(cleanup);};
 },[src]);
 return <>{art.previous&&<span className={styles.portalFrame}><PortfolioImage src={art.previous} alt="" fill sizes="(max-width:600px) 60vw, 240px"/></span>}<span key={art.current} className={styles.portalFrame} data-incoming={art.previous!==null} data-art={art.current}><PortfolioImage src={art.current} alt="" fill sizes="(max-width:600px) 60vw, 240px" priority={priority} onLoad={onReady} onError={onReady}/></span></>;
}
