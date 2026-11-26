"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { haptic } from "@/components/haptics/haptics";
import { useModalFocus } from "@/components/viewer-controls/useModalFocus";
import styles from "./comicReader.module.css";

const image=(n:number,large=false)=>`/comics/groy-payne-01/${String(n).padStart(2,"0")}${large?"-large":""}.webp`;
const W=1.414,H=2;
export function ComicProject(){
 const host=useRef<HTMLDivElement>(null),target=useRef(0),turn=useRef(0);
 const [support,setSupport]=useState(false),[copied,setCopied]=useState(""),[views,setViews]=useState<number|null>(null);
 useEffect(()=>{try{if(!sessionStorage.getItem("groy-support")){setSupport(true);sessionStorage.setItem("groy-support","1");}}catch{}
 const key="groy-view-01",seen=sessionStorage.getItem(key);
 fetch("/api/comic-views",{method:seen?"GET":"POST"}).then(r=>r.ok?r.json():null).then(data=>{if(typeof data?.views==="number"){setViews(data.views);sessionStorage.setItem(key,"1");}}).catch(()=>{});
 },[]);
 const supportRef=useModalFocus<HTMLElement>(support);
 const copy=async(network:string,address:string)=>{try{await navigator.clipboard.writeText(address);setCopied(network);}catch{setCopied("Select and copy the address below");}};
 const [sheet,setSheet]=useState(0),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[zoom,setZoom]=useState<number|null>(null);
 const clickStart=useRef<{x:number;y:number;time:number}|null>(null);
 const resetView=useRef<(()=>void)|null>(null);
 const swipe=useRef<number|null>(null);
 const zoomClose=useRef<HTMLButtonElement>(null),readButton=useRef<HTMLButtonElement>(null);
 const change=(delta:number)=>{setSheet(value=>{const next=Math.max(0,Math.min(15,value+delta));target.current=next;if(next!==value)haptic("tick");return next;});};
 useEffect(()=>{if(zoom!==null)zoomClose.current?.focus();},[zoom]);
 useEffect(()=>{const key=(event:KeyboardEvent)=>{if(document.documentElement.dataset.navigationOpen==="true")return;if(event.key==="Escape"){setZoom(null);readButton.current?.focus();}if(support)return;if(zoom!==null){if(event.key==="ArrowRight"||event.key==="ArrowLeft"){event.preventDefault();setZoom(Math.max(1,Math.min(30,zoom+(event.key==="ArrowRight"?1:-1))));}return;}if(event.key==="ArrowRight"){event.preventDefault();change(1);}if(event.key==="ArrowLeft"){event.preventDefault();change(-1);}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);},[zoom,support]);
 useEffect(()=>{
  const element=host.current;if(!element)return;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.toneMappingExposure=1;
  element.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,40);
  const book=new THREE.Group();scene.add(book);
  camera.position.set(0,.12,5);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.zoomToCursor=true;controls.enablePan=false;controls.minDistance=2.5;controls.maxDistance=14;controls.rotateSpeed=.7;controls.zoomSpeed=.7;controls.minPolarAngle=.05;controls.maxPolarAngle=Math.PI-.05;
  scene.add(new THREE.HemisphereLight(0xffffff,0x929292,1.5));
  const light=new THREE.DirectionalLight(0xffffff,1.3);light.position.set(-3,5,7);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.camera.left=-4;light.shadow.camera.right=4;light.shadow.camera.top=4;light.shadow.camera.bottom=-4;light.shadow.normalBias=.015;scene.add(light);
  const rim=new THREE.DirectionalLight(0xffffff,.3);rim.position.set(4,1,3);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({opacity:.22}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.22;floor.receiveShadow=true;scene.add(floor);
  const loader=new THREE.TextureLoader(),textures:THREE.Texture[]=[],materials:THREE.Material[]=[],geometries:THREE.BufferGeometry[]=[];
  let disposed=false;
  const texture=(n:number)=>{const t=loader.load(image(n),()=>{if(!disposed&&n===1)setReady(true);},undefined,()=>{if(!disposed&&n===1)setFailed(true);});t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.push(t);return t;};
  const spine=new THREE.MeshStandardMaterial({color:0x080808,roughness:.85});materials.push(spine);
  const paper=new THREE.MeshStandardMaterial({color:0xd9d0b9,roughness:.85});materials.push(paper);
  const leaves=Array.from({length:15},(_,i)=>{
   const cover=i===0||i===14;
   const front=new THREE.MeshStandardMaterial({roughness:cover?.34:.67,metalness:0});
   const back=new THREE.MeshStandardMaterial({roughness:cover?.34:.67,metalness:0});
   materials.push(front,back);
   const geo=new THREE.BoxGeometry(W,H,cover?.009:.003,28,1,1);geo.translate(W/2,0,0);geometries.push(geo);
   const original=Float32Array.from(geo.attributes.position.array);
   const mesh=new THREE.Mesh(geo,[paper,spine,paper,paper,front,back]);mesh.castShadow=true;mesh.receiveShadow=true;mesh.position.z=(15-i)*.004;book.add(mesh);
   return {mesh,geo,original,front,back};
  });
  const resize=()=>{const width=element.clientWidth,height=element.clientHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};
  resetView.current=()=>{controls.target.set(0,0,0);const width=target.current===0||target.current===15?W:W*2;const distance=Math.max(H/.78,width/(camera.aspect*.78))/(2*Math.tan(THREE.MathUtils.degToRad(18)));camera.position.set(0,.12,distance);controls.update();};
  const observer=new ResizeObserver(resize);observer.observe(element);resize();
  let frame=0,last=0,flipStart=0,flipFrom=0,flipTo=0,previousFit=0;
  const animate=(time:number)=>{
   frame=requestAnimationFrame(animate);if(document.hidden)return;
   const dt=Math.min(.05,(time-last)/1000||.016);last=time;
   const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
   if(flipTo===flipFrom&&Math.abs(turn.current-target.current)>.001){flipFrom=turn.current;flipTo=flipFrom+Math.sign(target.current-flipFrom);flipStart=time;}
   if(flipTo!==flipFrom){const t=Math.min(1,(time-flipStart)/(reduced?1:950));const eased=t*t*(3-2*t);turn.current=flipFrom+(flipTo-flipFrom)*eased;if(t===1)flipFrom=flipTo;}
   const value=turn.current;
   const viewWidth=(value<.01||value>14.99)?W:W*2;
   const fit=Math.max(H/.78,viewWidth/(camera.aspect*.78))/(2*Math.tan(THREE.MathUtils.degToRad(18)));
   if(!previousFit){camera.position.set(0,.15,fit);previousFit=fit;}
   else if(Math.abs(fit-previousFit)>.001){camera.position.multiplyScalar(fit/previousFit);previousFit=fit;}
   controls.update();
   book.position.x=THREE.MathUtils.lerp(-W/2,0,Math.min(1,value));
   if(value>14)book.position.x=THREE.MathUtils.lerp(0,W/2,value-14);
   book.rotation.y=0;
   book.rotation.x=0;
   leaves.forEach(({mesh,geo,original,front,back},i)=>{
    if(i===0||i===14||Math.abs(value-i)<2.2){
     if(!front.map){front.map=texture(i*2+1);front.needsUpdate=true;}
     if(!back.map){back.map=texture(i*2+2);back.needsUpdate=true;}
    }else if(Math.abs(value-i)>3){
     if(front.map){front.map.dispose();front.map=null;front.needsUpdate=true;}
     if(back.map){back.map.dispose();back.map=null;back.needsUpdate=true;}
    }
    const t=THREE.MathUtils.clamp(value-i,0,1),angle=t*Math.PI;
    const curve=Math.sin(t*Math.PI)*.75;
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
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());floor.geometry.dispose();(floor.material as THREE.Material).dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);

 const left=sheet===15?30:sheet*2,right=sheet===0?1:Math.min(30,sheet*2+1);
 return <main className={styles.page} data-open={sheet>0}>
  <SiteNav/><Link href="/playground" className={styles.back}>← PLAYGROUND</Link>
  <header className={styles.heading}><h1>GROY PAYNE<span>Honey &amp; Blood</span></h1><p><b>ISSUE 01</b><span>NOVEMBER 2026</span></p></header>
  <div className={styles.stage} ref={host} aria-label="Click to turn pages, drag to rotate, scroll to zoom toward cursor."
   onPointerDown={e=>{if(e.button===0)clickStart.current={x:e.clientX,y:e.clientY,time:performance.now()};}}
   onPointerCancel={()=>{clickStart.current=null;}}
   onPointerUp={e=>{const start=clickStart.current;clickStart.current=null;if(!start||Math.hypot(e.clientX-start.x,e.clientY-start.y)>6||performance.now()-start.time>600)return;
    const rect=e.currentTarget.getBoundingClientRect();change(sheet===0?1:sheet===15?-1:e.clientX<rect.left+rect.width/2?-1:1);
   }}/>
  {!ready&&!failed&&<p className={styles.loading}>Opening comic…</p>}
  {failed&&<div className={styles.fallback}><img src={image(right)} alt={`Comic page ${right}`}/></div>}
  <nav className={styles.controls} aria-label="Comic pages">
   <button onClick={()=>change(-1)} disabled={sheet===0} aria-label="Previous page">←</button>
   <span aria-live="polite">{sheet===0?"COVER":sheet===15?"BACK COVER":`${left} — ${right}`}</span>
   <button onClick={()=>change(1)} disabled={sheet===15} aria-label="Next page">→</button>
   <button className={styles.read} onClick={()=>resetView.current?.()}>RESET VIEW</button>
   <button onClick={()=>setSupport(true)} className={styles.read}>SUPPORT</button>
   {views!==null&&<span className={styles.viewCount}>{views.toLocaleString()} views</span>}
   <button ref={readButton} className={styles.read} onClick={()=>{setZoom(right);}}>READ</button>
  </nav>
  {zoom!==null&&<div className={styles.zoom} role="dialog" aria-modal="true" aria-label="Read comic page" onKeyDown={e=>{if(e.key==="Tab"){e.preventDefault();const items=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));const i=items.indexOf(document.activeElement as HTMLButtonElement);items[(i+(e.shiftKey?-1:1)+items.length)%items.length].focus();}}}>
   <div className={styles.zoomBar}><button onClick={()=>{setZoom(Math.max(1,zoom-1));}} disabled={zoom===1} aria-label="Previous page">←</button><span>{zoom} / 30</span><button onClick={()=>{setZoom(Math.min(30,zoom+1));}} disabled={zoom===30} aria-label="Next page">→</button><button ref={zoomClose} onClick={()=>{setZoom(null);readButton.current?.focus();}} aria-label="Close reading view">×</button></div>
   <div className={styles.zoomImage} key={zoom} onTouchStart={e=>{swipe.current=e.touches[0].clientX;}} onTouchEnd={e=>{if(swipe.current===null)return;const dx=e.changedTouches[0].clientX-swipe.current;swipe.current=null;if(Math.abs(dx)>45){setZoom(Math.max(1,Math.min(30,zoom+(dx<0?1:-1))));}}}>
    {zoom>1&&<button className={styles.previousSlide} aria-label="Previous page" onClick={()=>{setZoom(zoom-1);}}><img src={image(zoom-1)} alt=""/></button>}
    <div className={styles.pageImage}>
     <img src={image(zoom,true)} alt={`Groy Payne: Honey & Blood, page ${zoom}`} draggable={false}/>
    </div>
    {zoom<30&&<button className={styles.nextSlide} aria-label="Next page" onClick={()=>{setZoom(zoom+1);}}><img src={image(zoom+1)} alt=""/></button>}
   </div>
  </div>}
  {support&&<div className={styles.supportOverlay} onClick={e=>{if(e.target===e.currentTarget)setSupport(false);}}>
   <section ref={supportRef} className={styles.supportCard} role="dialog" aria-modal="true" aria-label="Support the comic" onKeyDown={e=>{if(e.key==="Escape")setSupport(false);}}>
    <button className={styles.supportClose} onClick={()=>setSupport(false)} aria-label="Close support">×</button>
    <p className={styles.eyebrow}>GROY PAYNE / INDEPENDENT COMIC</p><h2>Help write<br/>the next chapter.</h2>
    <p>Every page takes time. If you enjoyed the story, you can help me keep making it. Tips of any size are appreciated.</p>
    {[["Ethereum","0x0D6b9D09F2Fb29490D9Ced2020ed401580E3DC7a"],["Solana","3RVY5jVyaeUrQiWkpaQPBiuzhvZv6Mi9dyfHXXBNsS"]].map(([network,address])=><div className={styles.wallet} key={network}><button onClick={()=>copy(network,address)}>{network}<span>{copied===network?"COPIED":"COPY ADDRESS"}</span></button><code>{address}</code></div>)}
    <small>Send only assets supported by the selected network.</small>
    <button className={styles.continueButton} onClick={()=>setSupport(false)}>CONTINUE TO COMIC</button>
   </section>
  </div>}
 </main>;
}
