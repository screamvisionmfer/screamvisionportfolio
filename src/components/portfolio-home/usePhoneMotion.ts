"use client";
import { useCallback, useEffect, useState } from "react";

type Status="ready"|"requesting"|"waiting"|"active"|"denied"|"unavailable"|"no-data";
type MotionAPI=typeof DeviceOrientationEvent & { requestPermission?:()=>Promise<"granted"|"denied"> };

export function usePhoneMotion(){
 const [enabled,setEnabled]=useState(false),[status,setStatus]=useState<Status>("ready");
 useEffect(()=>{
  if(!window.isSecureContext||!("DeviceOrientationEvent" in window)){setStatus("unavailable");return;}
  const api=DeviceOrientationEvent as MotionAPI;
  if(!api.requestPermission&&window.matchMedia("(pointer:coarse)").matches){setEnabled(true);setStatus("waiting");}
 },[]);
 useEffect(()=>{
  if(!enabled)return;
  const timer=setTimeout(()=>setStatus(previous=>previous==="active"?previous:"no-data"),5000);
  return()=>clearTimeout(timer);
 },[enabled]);
 const onData=useCallback(()=>setStatus("active"),[]);
 const toggle=async()=>{
  if(enabled){setEnabled(false);setStatus("ready");return;}
  if(!window.isSecureContext||!("DeviceOrientationEvent" in window)){setStatus("unavailable");return;}
  setStatus("requesting");
  try{
   const api=DeviceOrientationEvent as MotionAPI;
   if(api.requestPermission&&await api.requestPermission()!=="granted"){setStatus("denied");return;}
   setEnabled(true);setStatus("waiting");
  }catch{setEnabled(false);setStatus("denied");}
 };
 const message={ready:"Tilt your phone to move the room",requesting:"Waiting for motion access…",waiting:"Move your phone gently",active:"Phone tilt is active",denied:"Motion access is blocked in browser settings",unavailable:"Motion sensors are unavailable in this browser","no-data":"No sensor data received. Try your phone’s browser."}[status];
 return {enabled,status,message,onData,toggle};
}
