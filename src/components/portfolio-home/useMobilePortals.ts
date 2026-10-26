"use client";
import { haptic } from "@/components/haptics/haptics";
import { useEffect, useState, type RefObject } from "react";

/** Native touch momentum with snap points; pointer drag also works in a narrow desktop window. */
export function useMobilePortals(ref:RefObject<HTMLElement|null>){
 const [active,setActive]=useState(0);
 useEffect(()=>{
  const rail=ref.current;if(!rail)return;
  const media=window.matchMedia("(max-width: 600px)");
  let selected=0,lastScroll=0,lastTime=0;
  let frame=0,down=false,moved=false,startX=0,startScroll=0;
  const cards=Array.from(rail.querySelectorAll<HTMLElement>("a"));
  const draw=()=>{
   frame=0;if(!media.matches)return;
   const centre=rail.scrollLeft+rail.clientWidth/2;
   const distances=cards.map(card=>(card.offsetLeft+card.offsetWidth/2-centre)/card.offsetWidth);
   let nearest=0;
   cards.forEach((card,index)=>{
    const distance=Math.max(-1.5,Math.min(1.5,distances[index]));
    card.style.setProperty("--rail-turn",`${-distance*10}deg`);
    card.style.setProperty("--rail-scale",String(Math.max(.87,1-Math.abs(distance)*.09)));
    card.style.setProperty("--rail-opacity",String(Math.max(.48,1-Math.abs(distance)*.3)));
    if(Math.abs(distances[index])<Math.abs(distances[nearest]))nearest=index;
   });
   const now=performance.now();
   if(selected!==nearest){selected=nearest;haptic("tick",Math.abs(rail.scrollLeft-lastScroll)/Math.max(16,now-lastTime));}
   lastScroll=rail.scrollLeft;lastTime=now;
   setActive(previous=>previous===nearest?previous:nearest);
  };
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(draw);};
  const pointerDown=(event:PointerEvent)=>{
   if(!media.matches||event.pointerType==="touch"||event.button!==0)return;
   down=true;moved=false;startX=event.clientX;startScroll=rail.scrollLeft;
  };
  const pointerMove=(event:PointerEvent)=>{
   if(!down)return;
   const delta=event.clientX-startX;
   if(Math.abs(delta)>6){moved=true;rail.setPointerCapture(event.pointerId);rail.dataset.dragging="true";rail.scrollLeft=startScroll-delta;}
  };
  const pointerUp=()=>{down=false;rail.dataset.dragging="false";};
  const click=(event:MouseEvent)=>{if(moved&&event.detail){event.preventDefault();event.stopPropagation();moved=false;}};
  const drag=(event:DragEvent)=>{if(media.matches)event.preventDefault();};
  const observer=new ResizeObserver(scroll);observer.observe(rail);
  rail.addEventListener("scroll",scroll,{passive:true});rail.addEventListener("pointerdown",pointerDown);rail.addEventListener("pointermove",pointerMove);rail.addEventListener("pointerup",pointerUp);rail.addEventListener("pointercancel",pointerUp);rail.addEventListener("click",click,true);rail.addEventListener("dragstart",drag);media.addEventListener("change",scroll);scroll();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();rail.removeEventListener("scroll",scroll);rail.removeEventListener("pointerdown",pointerDown);rail.removeEventListener("pointermove",pointerMove);rail.removeEventListener("pointerup",pointerUp);rail.removeEventListener("pointercancel",pointerUp);rail.removeEventListener("click",click,true);rail.removeEventListener("dragstart",drag);media.removeEventListener("change",scroll);};
 },[ref]);
 return active;
}
