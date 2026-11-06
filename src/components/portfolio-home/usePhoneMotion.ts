"use client";
import { useCallback, useEffect, useState } from "react";

type Status="ready"|"requesting"|"waiting"|"active"|"denied"|"unavailable"|"no-data";
type MotionAPI=typeof DeviceOrientationEvent & { requestPermission?:()=>Promise<"granted"|"denied"> };

export function usePhoneMotion(){
 const [enabled,setEnabled]=useState(false),[status,setStatus]=useState<Status>("ready");
 useEffect(()=>{
  if(!window.isSecureContext||!("DeviceOrientationEvent" in window)){setStatus("unavailable");return;}
  const api=DeviceOrientationEvent as MotionAPI;
  if(!window.matchMedia("(pointer:coarse)").matches)return;
  try{if(localStorage.getItem("portfolio:phone-tilt")==="off")return;}catch{}
  if(!api.requestPermission){setEnabled(true);setStatus("waiting");return;}
  // iOS needs a real gesture, even when permission was granted on an earlier visit.
  let requesting=false;
  const enable=()=>{if(requesting)return;requesting=true;setStatus("requesting");void api.requestPermission!().then(result=>{if(result==="granted"){setEnabled(true);setStatus("waiting");}else setStatus("denied");}).catch(()=>setStatus("denied"));};
  window.addEventListener("pointerup",enable,{once:true});
  return()=>window.removeEventListener("pointerup",enable);

 },[]);
 useEffect(()=>{
  if(!enabled)return;
  const timer=setTimeout(()=>setStatus(previous=>previous==="active"?previous:"no-data"),5000);
  return()=>clearTimeout(timer);
 },[enabled]);
 const onData=useCallback(()=>setStatus("active"),[]);
 const toggle=async()=>{
  if(enabled){setEnabled(false);setStatus("ready");try{localStorage.setItem("portfolio:phone-tilt","off");}catch{}return;}
  if(!window.isSecureContext||!("DeviceOrientationEvent" in window)){setStatus("unavailable");return;}
  setStatus("requesting");
  try{
   const api=DeviceOrientationEvent as MotionAPI;
   if(api.requestPermission&&await api.requestPermission()!=="granted"){setStatus("denied");return;}
   setEnabled(true);setStatus("waiting");try{localStorage.setItem("portfolio:phone-tilt","on");}catch{}
  }catch{setEnabled(false);setStatus("denied");}
 };
 const message={ready:"Tilt your phone to move the room",requesting:"Waiting for motion access…",waiting:"Move your phone gently",active:"Phone tilt is active",denied:"Motion access is blocked in browser settings",unavailable:"Motion sensors are unavailable in this browser","no-data":"No sensor data received. Try your phone’s browser."}[status];
 return {enabled,status,message,onData,toggle};
}
