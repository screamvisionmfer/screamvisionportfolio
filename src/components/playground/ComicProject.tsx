"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { haptic } from "@/components/haptics/haptics";
import styles from "./comicReader.module.css";

const image=(n:number,large=false)=>`/comics/groy-payne-01/${String(n).padStart(2,"0")}${large?"-large":""}.webp`;
const W=1.414,H=2;
export function ComicProject(){
 const host=useRef<HTMLDivElement>(null),target=useRef(0),turn=useRef(0),rotation=useRef(-.16);
 const [sheet,setSheet]=useState(0),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[zoom,setZoom]=useState<number|null>(null);
 const zoomClose=useRef<HTMLButtonElement>(null),readButton=useRef<HTMLButtonElement>(null);
 const change=(delta:number)=>{setSheet(value=>{const next=Math.max(0,Math.min(15,value+delta));target.current=next;if(next!==value)haptic("tick");return next;});};
 useEffect(()=>{if(zoom!==null)zoomClose.current?.focus();},[zoom]);
 useEffect(()=>{const key=(event:KeyboardEvent)=>{if(document.documentElement.dataset.navigationOpen==="true")return;if(event.key==="Escape"){setZoom(null);readButton.current?.focus();}if(zoom!==null)return;if(event.key==="ArrowRight"){event.preventDefault();change(1);}if(event.key==="ArrowLeft"){event.preventDefault();change(-1);}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);},[zoom]);
 useEffect(()=>{
  const element=host.current;if(!element)return;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  element.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,40);
  const book=new THREE.Group();scene.add(book);
  scene.add(new THREE.HemisphereLight(0xfff5da,0x697180,2.5));
  const light=new THREE.DirectionalLight(0xffedce,4);light.position.set(-3,5,7);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.camera.left=-4;light.shadow.camera.right=4;light.shadow.camera.top=4;light.shadow.camera.bottom=-4;light.shadow.normalBias=.015;scene.add(light);
  const rim=new THREE.DirectionalLight(0xb5d8ed,1.2);rim.position.set(4,1,3);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({opacity:.22}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.22;floor.receiveShadow=true;scene.add(floor);
  const loader=new THREE.TextureLoader(),textures:THREE.Texture[]=[],materials:THREE.Material[]=[],geometries:THREE.BufferGeometry[]=[];
  let disposed=false;
  const texture=(n:number)=>{const t=loader.load(image(n),()=>{if(!disposed&&n===1)setReady(true);},undefined,()=>{if(!disposed&&n===1)setFailed(true);});t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.push(t);return t;};
  const paper=new THREE.MeshStandardMaterial({color:0xd9d0b9,roughness:.85});materials.push(paper);
  const leaves=Array.from({length:15},(_,i)=>{
   const cover=i===0||i===14;
   const front=new THREE.MeshStandardMaterial({roughness:cover?.34:.67,metalness:0});
   const back=new THREE.MeshStandardMaterial({roughness:cover?.34:.67,metalness:0});
   materials.push(front,back);
   const geo=new THREE.BoxGeometry(W,H,cover?.009:.003,28,1,1);geo.translate(W/2,0,0);geometries.push(geo);
   const original=Float32Array.from(geo.attributes.position.array);
   const mesh=new THREE.Mesh(geo,[paper,paper,paper,paper,front,back]);mesh.castShadow=true;mesh.receiveShadow=true;mesh.position.z=(15-i)*.004;book.add(mesh);
   return {mesh,geo,original,front,back};
  });
  const resize=()=>{const width=element.clientWidth,height=element.clientHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.position.set(0,.12,camera.aspect<.8?7.8:5);camera.lookAt(0,0,0);camera.updateProjectionMatrix();};
  const observer=new ResizeObserver(resize);observer.observe(element);resize();
  let frame=0,last=0;
  const animate=(time:number)=>{
   frame=requestAnimationFrame(animate);if(document.hidden)return;
   const dt=Math.min(.05,(time-last)/1000||.016);last=time;
   const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
   turn.current=THREE.MathUtils.damp(turn.current,target.current,reduced?50:7,dt);
   const value=turn.current;
   book.position.x=THREE.MathUtils.lerp(-W/2,0,Math.min(1,value));
   if(value>14)book.position.x=THREE.MathUtils.lerp(0,W/2,value-14);
   book.rotation.y=THREE.MathUtils.damp(book.rotation.y,target.current===0?rotation.current:0,6,dt);
   book.rotation.x=THREE.MathUtils.damp(book.rotation.x,target.current===0?.06:0,6,dt);
   leaves.forEach(({mesh,geo,original,front,back},i)=>{
    if(Math.abs(value-i)<2.2){
     if(!front.map){front.map=texture(i*2+1);front.needsUpdate=true;}
     if(!back.map){back.map=texture(i*2+2);back.needsUpdate=true;}
    }else if(Math.abs(value-i)>3){
     if(front.map){front.map.dispose();front.map=null;front.needsUpdate=true;}
     if(back.map){back.map.dispose();back.map=null;back.needsUpdate=true;}
    }
    const t=THREE.MathUtils.clamp(value-i,0,1),angle=t*Math.PI;
    const curve=Math.sin(t*Math.PI)*1.3;
    const positions=geo.attributes.position;
    for(let v=0;v<positions.count;v++){
     const x=original[v*3],y=original[v*3+1],z=original[v*3+2],c=curve/W,a=angle-curve/2;
     const px=curve>.0001?(Math.sin(a+c*x)-Math.sin(a))/c:x*Math.cos(angle);
     const pz=curve>.0001?(Math.cos(a)-Math.cos(a+c*x))/c:x*Math.sin(angle);
     positions.setXYZ(v,px-z*Math.sin(a+c*x),y,pz+z*Math.cos(a+c*x));
    }
    positions.needsUpdate=true;geo.computeVertexNormals();mesh.position.z=t>=.5?(i+1)*.005:(15-i)*.005;
   });
   renderer.render(scene,camera);
  };frame=requestAnimationFrame(animate);
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());floor.geometry.dispose();(floor.material as THREE.Material).dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 const gesture=useRef<{x:number;y:number}|null>(null);
 const left=sheet===15?30:sheet*2,right=sheet===0?1:Math.min(30,sheet*2+1);
 return <main className={styles.page}>
  <SiteNav/><Link href="/playground" className={styles.back}>← PLAYGROUND</Link>
  <header className={styles.heading}><h1>GROY PAYNE<span>Honey &amp; Blood</span></h1><p>№1 · NOV 2026</p></header>
  <div className={styles.stage} ref={host} aria-label="3D comic. Swipe to turn pages." onPointerDown={e=>{gesture.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerUp={e=>{const start=gesture.current;gesture.current=null;if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(sheet!==0&&Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy))change(dx<0?1:-1);else if(Math.abs(dx)<8&&Math.abs(dy)<8)change(1);}} onPointerCancel={()=>{gesture.current=null;}} onPointerMove={e=>{if(sheet===0&&gesture.current){rotation.current=Math.max(-2.8,Math.min(2.8,(e.clientX-gesture.current.x)*.009));}if(sheet===0&&!gesture.current&&e.pointerType==="mouse"){const rect=e.currentTarget.getBoundingClientRect();rotation.current=(e.clientX-rect.left)/rect.width*.6-.3;}}}/>
  {!ready&&!failed&&<p className={styles.loading}>Opening comic…</p>}
  {failed&&<div className={styles.fallback}><img src={image(right)} alt={`Comic page ${right}`}/></div>}
  <nav className={styles.controls} aria-label="Comic pages">
   <button onClick={()=>change(-1)} disabled={sheet===0} aria-label="Previous page">←</button>
   <span aria-live="polite">{sheet===0?"COVER":sheet===15?"BACK COVER":`${left} — ${right}`}</span>
   <button onClick={()=>change(1)} disabled={sheet===15} aria-label="Next page">→</button>
   <button ref={readButton} className={styles.read} onClick={()=>setZoom(right)}>READ</button>
  </nav>
  {zoom!==null&&<div className={styles.zoom} role="dialog" aria-modal="true" aria-label="Read comic page" onKeyDown={e=>{if(e.key==="Tab"){e.preventDefault();const items=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));const i=items.indexOf(document.activeElement as HTMLButtonElement);items[(i+(e.shiftKey?-1:1)+items.length)%items.length].focus();}}}>
   <div className={styles.zoomBar}><button onClick={()=>setZoom(Math.max(1,zoom-1))} disabled={zoom===1} aria-label="Previous page">←</button><span>{zoom} / 30</span><button onClick={()=>setZoom(Math.min(30,zoom+1))} disabled={zoom===30} aria-label="Next page">→</button><button ref={zoomClose} onClick={()=>{setZoom(null);readButton.current?.focus();}} aria-label="Close reading view">×</button></div>
   <div className={styles.zoomImage} key={zoom}><img src={image(zoom,true)} alt={`Groy Payne: Honey & Blood, page ${zoom}`}/></div>
  </div>}
 </main>;
}
