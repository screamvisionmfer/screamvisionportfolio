"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { haptic } from "@/components/haptics/haptics";
import { useModalFocus } from "@/components/viewer-controls/useModalFocus";
import { CopyWallet } from "./CopyWallet";
import styles from "./comicReader.module.css";

const image=(n:number,large=false)=>`/comics/groy-payne-01/${String(n).padStart(2,"0")}${large?"-large":""}.webp`;
function ControlIcon({kind}:{kind:"left"|"right"|"reset"|"support"|"expand"|"collapse"|"close"}){
 const paths={left:"M19 12H5m6-6-6 6 6 6",right:"M5 12h14m-6-6 6 6-6 6",reset:"M3 10a9 9 0 1 1 2 8M3 4v6h6",support:"M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",expand:"M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5",collapse:"M3 8h5V3m8 0v5h5M8 21v-5H3m18 0h-5v5",close:"m6 6 12 12M6 18 18 6"};
 return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[kind]}/></svg>;
}
const W=1.414,H=2;
export function ComicProject(){
 const page=useRef<HTMLElement>(null);
 const [fullscreen,setFullscreen]=useState(false);
 useEffect(()=>{const sync=()=>setFullscreen(document.fullscreenElement===page.current);document.addEventListener("fullscreenchange",sync);return()=>document.removeEventListener("fullscreenchange",sync);},[]);
 const toggleFullscreen=async()=>{if(document.fullscreenElement){await document.exitFullscreen();}else{try{await page.current?.requestFullscreen();}catch{setFullscreen(v=>!v);}}};
 const host=useRef<HTMLDivElement>(null),target=useRef(0),turn=useRef(0);
 const [support,setSupport]=useState(false),[views,setViews]=useState<number|null>(null);
 useEffect(()=>{const key="groy-view-01",seen=sessionStorage.getItem(key);
 fetch("/api/comic-views",{method:seen?"GET":"POST"}).then(r=>r.ok?r.json():null).then(data=>{if(typeof data?.views==="number"){setViews(data.views);sessionStorage.setItem(key,"1");}}).catch(()=>{});
 },[]);
 const supportRef=useModalFocus<HTMLElement>(support);

 const [sheet,setSheet]=useState(0),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[zoom,setZoom]=useState<number|null>(null);
 useEffect(()=>{if(!ready)return;const timer=setTimeout(()=>setSupport(true),800);return()=>clearTimeout(timer);},[ready]);
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
  let lastInput=performance.now(),pointerX=0,pointerY=0,interacting=false;
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.zoomToCursor=true;controls.enablePan=true;controls.mouseButtons.MIDDLE=THREE.MOUSE.PAN;controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;controls.screenSpacePanning=true;controls.minDistance=2.5;controls.maxDistance=14;controls.rotateSpeed=.7;controls.zoomSpeed=.7;controls.minPolarAngle=.05;controls.maxPolarAngle=Math.PI-.05;
  controls.autoRotateSpeed=.45;
  const started=()=>{interacting=true;lastInput=performance.now();};const ended=()=>{interacting=false;lastInput=performance.now();};
  controls.addEventListener("start",started);controls.addEventListener("end",ended);
  const pointer=(event:PointerEvent)=>{const rect=element.getBoundingClientRect();pointerX=(event.clientX-rect.left)/rect.width-.5;pointerY=(event.clientY-rect.top)/rect.height-.5;lastInput=performance.now();};
  const leave=()=>{pointerX=0;pointerY=0;};element.addEventListener("pointermove",pointer);element.addEventListener("pointerleave",leave);
  scene.add(new THREE.HemisphereLight(0xffffff,0x929292,1.5));
  const light=new THREE.DirectionalLight(0xfff4de,1.7);light.position.set(-3,5,7);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.camera.left=-4;light.shadow.camera.right=4;light.shadow.camera.top=4;light.shadow.camera.bottom=-4;light.shadow.normalBias=.015;scene.add(light);
  const backlight=new THREE.PointLight(0xffdeb0,9,12,2);backlight.position.set(0,.4,-1.3);scene.add(backlight);
  const rim=new THREE.DirectionalLight(0xc4dcff,.65);rim.position.set(4,1,3);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({opacity:.22}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.22;floor.receiveShadow=true;scene.add(floor);
  const loader=new THREE.TextureLoader(),textures:THREE.Texture[]=[],materials:THREE.Material[]=[],geometries:THREE.BufferGeometry[]=[];
  let disposed=false;
  const texture=(n:number)=>{const t=loader.load(image(n),()=>{if(!disposed&&n===1)setReady(true);},undefined,()=>{if(!disposed&&n===1)setFailed(true);});t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.push(t);return t;};
  const spine=new THREE.MeshBasicMaterial({color:0x030303});materials.push(spine);
  const paper=new THREE.MeshStandardMaterial({color:0x35332e,roughness:.9});materials.push(paper);
  const leaves=Array.from({length:15},(_,i)=>{
   const cover=i===0||i===14;
   const front=new THREE.MeshPhysicalMaterial({color:0x888888,emissive:0xffffff,emissiveIntensity:.85,roughness:.48,metalness:0,specularIntensity:.22,clearcoat:.25,clearcoatRoughness:.3});
   const back=new THREE.MeshPhysicalMaterial({color:0x888888,emissive:0xffffff,emissiveIntensity:.85,roughness:.48,metalness:0,specularIntensity:.22,clearcoat:.25,clearcoatRoughness:.3});
   materials.push(front,back);
   const geo=new THREE.BoxGeometry(W,H,cover?.0025:.0008,40,8,1);geo.translate(W/2,0,0);geometries.push(geo);
   const original=Float32Array.from(geo.attributes.position.array);
   const mesh=new THREE.Mesh(geo,[paper,spine,paper,paper,front,back]);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.position.z=(15-i)*.004;book.add(mesh);
   return {mesh,geo,original,front,back};
  });
  const resize=()=>{const width=element.clientWidth,height=element.clientHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};
  resetView.current=()=>{const mobile=camera.aspect<.8,focus=mobile&&target.current>0&&target.current<15?W/2:0;controls.target.set(focus,0,0);const width=mobile||target.current===0||target.current===15?W:W*2;const distance=Math.max(H/.78,width/(camera.aspect*.78))/(2*Math.tan(THREE.MathUtils.degToRad(18)));camera.position.set(focus,.12,distance);controls.update();};
  const observer=new ResizeObserver(resize);observer.observe(element);resize();
  let frame=0,last=0,flipStart=0,flipFrom=0,flipTo=0,previousFit=0,previousFocus=0;
  const animate=(time:number)=>{
   frame=requestAnimationFrame(animate);if(document.hidden)return;
   const dt=Math.min(.05,(time-last)/1000||.016);last=time;
   const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
   if(flipTo===flipFrom&&Math.abs(turn.current-target.current)>.001){flipFrom=turn.current;flipTo=flipFrom+Math.sign(target.current-flipFrom);flipStart=time;}
   if(flipTo!==flipFrom){const t=Math.min(1,(time-flipStart)/(reduced?1:950));const eased=t*t*(3-2*t);turn.current=flipFrom+(flipTo-flipFrom)*eased;if(t===1)flipFrom=flipTo;}
   const value=turn.current;
   const mobile=camera.aspect<.8;
   const viewWidth=mobile?W:(value<.01||value>14.99)?W:W*2;
   const focus=mobile?W/2*Math.min(1,value,15-value):0;
   camera.position.x+=focus-previousFocus;controls.target.x+=focus-previousFocus;previousFocus=focus;
   const fit=Math.max(H/.88,viewWidth/(camera.aspect*(camera.aspect<.8?.94:.82)))/(2*Math.tan(THREE.MathUtils.degToRad(18)));
   if(!previousFit){camera.position.set(0,.15,fit);previousFit=fit;}
   else if(Math.abs(fit-previousFit)>.001){camera.position.multiplyScalar(fit/previousFit);previousFit=fit;}
   controls.autoRotate=target.current===0&&!interacting&&!reduced&&time-lastInput>4500;
   controls.update(dt);
   book.position.x=THREE.MathUtils.lerp(-W/2,0,Math.min(1,value));
   if(value>14)book.position.x=THREE.MathUtils.lerp(0,W/2,value-14);
   const floating=target.current===0&&!interacting&&!reduced;
   book.rotation.y=THREE.MathUtils.damp(book.rotation.y,floating?pointerX*.16:0,5,dt);
   book.rotation.x=THREE.MathUtils.damp(book.rotation.x,floating?pointerY*.1:0,5,dt);
   book.position.y=floating?Math.sin(time*.0006)*.012:0;
   leaves.forEach(({mesh,geo,original,front,back},i)=>{
    if(i===0||i===14||Math.abs(value-i)<2.2){
     if(!front.map){front.map=texture(i*2+1);front.emissiveMap=front.map;front.needsUpdate=true;}
     if(!back.map){back.map=texture(i*2+2);back.emissiveMap=back.map;back.needsUpdate=true;}
    }else if(Math.abs(value-i)>3){
     if(front.map){front.map.dispose();front.map=null;front.emissiveMap=null;front.needsUpdate=true;}
     if(back.map){back.map.dispose();back.map=null;back.emissiveMap=null;back.needsUpdate=true;}
    }
    const t=THREE.MathUtils.clamp(value-i,0,1),angle=t*Math.PI;
    const flex=Math.sin(t*Math.PI);
    const positions=geo.attributes.position;
    // Integrate a changing tangent across the sheet: anchored spine, lagging edge.
    const samples=80,step=W/samples,xs=[0],zs=[0];
    for(let k=1;k<=samples;k++){
     const u=(k-.5)/samples;
     const tangent=angle+flex*(Math.sin(u*Math.PI*.9)-.62)*1.9;
     xs[k]=xs[k-1]+Math.cos(tangent)*step;
     zs[k]=zs[k-1]+Math.sin(tangent)*step;
    }
    for(let v=0;v<positions.count;v++){
     const x=original[v*3],y=original[v*3+1],z=original[v*3+2],u=x/W;
     const f=Math.min(samples-.00001,Math.max(0,u*samples)),k=Math.floor(f),mix=f-k;
     const tangent=angle+flex*(Math.sin(u*Math.PI*.9)-.62)*1.9;
     const px=THREE.MathUtils.lerp(xs[k],xs[k+1],mix);
     const pz=THREE.MathUtils.lerp(zs[k],zs[k+1],mix);
     const corner=flex*Math.pow(u,2)*Math.sin(y/H*Math.PI)*.055;
     positions.setXYZ(v,px-z*Math.sin(tangent),y,pz+z*Math.cos(tangent)+corner);
    }
    positions.needsUpdate=true;geo.computeVertexNormals();mesh.position.z=t>=.5?(i+1)*.005:(15-i)*.005;
   });
   renderer.render(scene,camera);
  };frame=requestAnimationFrame(animate);
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();element.removeEventListener("pointermove",pointer);element.removeEventListener("pointerleave",leave);textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());floor.geometry.dispose();(floor.material as THREE.Material).dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);

 const left=sheet===15?30:sheet*2,right=sheet===0?1:Math.min(30,sheet*2+1);
 return <main ref={page} className={styles.page} data-open={sheet>0} data-fullscreen={fullscreen}>
  <div className={styles.siteHeader}><SiteNav/></div><Link href="/playground" className={styles.back}>← PLAYGROUND</Link>
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
   <button onClick={()=>change(-1)} disabled={sheet===0} aria-label="Previous page"><ControlIcon kind="left"/></button>
   <span aria-live="polite">{sheet===0?"COVER":sheet===15?"BACK COVER":`${left} — ${right}`}</span>
   <button onClick={()=>change(1)} disabled={sheet===15} aria-label="Next page"><ControlIcon kind="right"/></button>
   <button className={styles.iconButton} aria-label={fullscreen?"Exit fullscreen":"Fullscreen"} title="Fullscreen" onClick={toggleFullscreen}><ControlIcon kind={fullscreen?"collapse":"expand"}/></button>
   <button className={styles.iconButton} aria-label="Reset view" title="Reset view" onClick={()=>resetView.current?.()}><ControlIcon kind="reset"/></button>
   <button onClick={()=>setSupport(true)} className={styles.iconButton} aria-label="Support the comic" title="Support"><ControlIcon kind="support"/></button>
   {views!==null&&<span className={styles.viewCount}>{views.toLocaleString()} views</span>}
   <button ref={readButton} className={styles.read} onClick={()=>{setZoom(right);}}>READ</button>
  </nav>
  {zoom!==null&&<div className={styles.zoom} role="dialog" aria-modal="true" aria-label="Read comic page" onKeyDown={e=>{if(e.key==="Tab"){e.preventDefault();const items=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));const i=items.indexOf(document.activeElement as HTMLButtonElement);items[(i+(e.shiftKey?-1:1)+items.length)%items.length].focus();}}}>
   <div className={styles.zoomBar}><button onClick={()=>{setZoom(Math.max(1,zoom-1));}} disabled={zoom===1} aria-label="Previous page"><ControlIcon kind="left"/></button><span>{zoom} / 30</span><button onClick={()=>{setZoom(Math.min(30,zoom+1));}} disabled={zoom===30} aria-label="Next page"><ControlIcon kind="right"/></button><button ref={zoomClose} onClick={()=>{setZoom(null);readButton.current?.focus();}} aria-label="Close reading view"><ControlIcon kind="close"/></button></div>
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
    <div className={styles.supportCover} aria-hidden="true"><img src={image(1)} alt=""/></div>
    <button className={styles.supportClose} onClick={()=>setSupport(false)} aria-label="Close support"><ControlIcon kind="close"/></button>
    <p className={styles.eyebrow}>GROY PAYNE / INDEPENDENT COMIC</p><h2>Help write<br/>the next chapter.</h2>
    <p>Every page takes time. If you enjoyed the story, you can help me keep making it. Tips of any size are appreciated.</p>
    {[["Ethereum","0x0D6b9D09F2Fb29490D9Ced2020ed401580E3DC7a"],["Solana","3RVY5jVyaeUrQiWkpaQPBiuzhvZv6Mi9dyfHXXBNsS"]].map(([network,address])=><div className={styles.wallet} key={network}><CopyWallet network={network} address={address}/></div>)}
    <small>Send only assets supported by the selected network.</small>
    <button className={styles.continueButton} onClick={()=>setSupport(false)}>CONTINUE TO COMIC</button>
   </section>
  </div>}
 </main>;
}
