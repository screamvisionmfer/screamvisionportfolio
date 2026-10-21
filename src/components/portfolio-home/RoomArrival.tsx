"use client";
import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./portfolioHome.module.css";

/** Finish the room's fade after the destination has mounted. */
export function RoomArrival(){
 const pathname=usePathname(),[arrival,setArrival]=useState<string|null>(null);
 useLayoutEffect(()=>{
  const target=sessionStorage.getItem("room-arrival");
  if(!target)return;
  sessionStorage.removeItem("room-arrival");
  if(target!==pathname||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  setArrival(pathname);
  const timer=setTimeout(()=>setArrival(null),700);
  return()=>clearTimeout(timer);
 },[pathname]);
 return arrival===pathname?<div className={styles.arrival} aria-hidden="true"/>:null;
}
