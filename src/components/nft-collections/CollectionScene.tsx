"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import type { NftCollection } from "@/data/nft-collections";
import { isPageActive, observePageActivity } from "@/components/site-nav/pageActivity";
import styles from "./collectionsArchive.module.css";
export function CollectionScene({collection,active,entering}:{collection:NftCollection;active:boolean;entering:boolean}){
 const host=useRef<HTMLDivElement>(null),controls=useRef({active,entering}),wake=useRef(()=>{}),[ready,setReady]=useState(false);
 controls.current={active,entering};useEffect(()=>wake.current(),[active,entering]);
 useEffect(()=>{
  const el=host.current;if(!el)return;let disposed=false,cleanup=()=>{};
  void import("three").then(async T=>{
   if(disposed)return;let renderer:THREE.WebGLRenderer;
   try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});}catch{return;}
   renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor(0x000000,0);el.appendChild(renderer.domElement);
   const scene=new T.Scene(),camera=new T.PerspectiveCamera(30,1,.1,50);camera.position.set(0,1,9.2);
   scene.add(new T.AmbientLight(0xc9d7d4,2.2));const key=new T.DirectionalLight(0xffdfac,4);key.position.set(-4,6,5);scene.add(key);
   const rim=new T.PointLight(collection.accent,30,15);rim.position.set(2,2,-2);scene.add(rim);
   const geometries:THREE.BufferGeometry[]=[],materials:THREE.Material[]=[],textures:THREE.Texture[]=[],panels:THREE.Group[]=[];
   const geometry=(g:THREE.BufferGeometry)=>{geometries.push(g);return g;},material=<M extends THREE.Material>(m:M)=>{materials.push(m);return m;};
   const floorY=-1.75;
   const ground=new T.Mesh(geometry(new T.PlaneGeometry(14,12)),material(new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{tint:{value:new T.Color(collection.accent)}},vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:"uniform vec3 tint;varying vec2 vUv;void main(){float d=length((vUv-.5)*vec2(1.,1.7));gl_FragColor=vec4(tint,(1.-smoothstep(.05,.55,d))*.12);}"})));ground.rotation.x=-Math.PI/2;ground.position.y=floorY;scene.add(ground);
   const grid=new T.GridHelper(14,18,collection.accent,collection.accent);const gridMaterial=grid.material as THREE.Material;gridMaterial.transparent=true;gridMaterial.opacity=.065;materials.push(gridMaterial);geometries.push(grid.geometry);grid.position.y=floorY+.005;scene.add(grid);
   let frame=0,last=0,time=0,aimX=0,aimY=0,visible=true,loaded=false,announced=false,baseZ=9.2;
   const reduced=matchMedia("(prefers-reduced-motion: reduce)");
   const render=(now:number)=>{
    frame=0;if(disposed||!visible||!isPageActive())return;
    const dt=last?Math.min(.05,(now-last)/1000):.016;if(last&&now-last<30){frame=requestAnimationFrame(render);return;}last=now;time+=dt;
    const moving=!reduced.matches,idle=moving&&controls.current.active;
    const tx=moving?aimX*.55+(idle?Math.sin(time*.23)*.08:0):0,ty=1+(moving?aimY*.28:0),tz=controls.current.entering&&!reduced.matches?baseZ*.57:baseZ;
    const follow=1-Math.exp(-dt*5);camera.position.x+=(tx-camera.position.x)*follow;camera.position.y+=(ty-camera.position.y)*follow;camera.position.z+=(tz-camera.position.z)*follow;camera.lookAt(0,.05,0);
    panels.forEach((panel,i)=>{panel.position.y=.12+(idle?Math.sin(time*.55+i*1.8)*.035:0);});
    renderer.render(scene,camera);if(loaded&&!announced){announced=true;setReady(true);}
    if(idle||controls.current.entering||Math.abs(camera.position.x-tx)+Math.abs(camera.position.y-ty)+Math.abs(camera.position.z-tz)>.003)frame=requestAnimationFrame(render);
   };
   const start=()=>{if(!disposed&&visible&&isPageActive()&&!frame){last=0;frame=requestAnimationFrame(render);}};wake.current=start;
   const resize=()=>{const {width,height}=el.getBoundingClientRect();if(width<1||height<1)return;camera.aspect=width/height;baseZ=camera.aspect<1.5?13.5:9.2;if(!controls.current.entering)camera.position.z=baseZ;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7,Math.sqrt(1_200_000/(width*height))));renderer.setSize(Math.round(width),Math.round(height),false);start();};
   const pointer=(event:PointerEvent)=>{if(event.pointerType==="touch"||reduced.matches)return;const rect=el.getBoundingClientRect();aimX=((event.clientX-rect.left)/rect.width-.5)*2;aimY=-((event.clientY-rect.top)/rect.height-.5)*2;start();};
   const leave=()=>{aimX=aimY=0;start();};const button=el.closest("button");button?.addEventListener("pointermove",pointer);button?.addEventListener("pointerleave",leave);
   const observer=new ResizeObserver(resize);observer.observe(el);const visibility=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});visibility.observe(el);
   const sync=()=>{cancelAnimationFrame(frame);frame=0;start();};const stop=observePageActivity(sync);reduced.addEventListener("change",sync);
   const lost=(event:Event)=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;setReady(false);};renderer.domElement.addEventListener("webglcontextlost",lost);
   let released=false;cleanup=()=>{if(released)return;released=true;cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();stop();reduced.removeEventListener("change",sync);button?.removeEventListener("pointermove",pointer);button?.removeEventListener("pointerleave",leave);renderer.domElement.removeEventListener("webglcontextlost",lost);textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
   try{
    const loader=new T.TextureLoader();
    await Promise.all([1,0,2].map(async(art,i)=>{
     const texture=await loader.loadAsync(collection.artworks[art].src);if(disposed||released){texture.dispose();return;}texture.colorSpace=T.SRGBColorSpace;texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textures.push(texture);
     const group=new T.Group(),size=i===1?3.7:3.15;group.position.set((i-1)*2.65,.12,i===1?.7:-1.25);group.rotation.y=i===0?.48:i===2?-.48:-.08;group.rotation.z=i===0?-.07:i===2?.07:.015;
     const frameMesh=new T.Mesh(geometry(new T.BoxGeometry(size+.12,size+.12,.16)),material(new T.MeshStandardMaterial({color:0x34392f,metalness:.72,roughness:.38})));group.add(frameMesh);
     const artMesh=new T.Mesh(geometry(new T.PlaneGeometry(size,size)),material(new T.MeshBasicMaterial({map:texture,color:0xe8e5db,toneMapped:false})));artMesh.position.z=.086;group.add(artMesh);
     const shadow=new T.Mesh(geometry(new T.PlaneGeometry(size*1.4,size*.9)),material(new T.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:"varying vec2 vUv;void main(){float d=length((vUv-.5)*vec2(1.,2.));gl_FragColor=vec4(0.,0.,0.,(1.-smoothstep(.08,.5,d))*.65);}"})));shadow.rotation.x=-Math.PI/2;shadow.position.set(group.position.x,floorY+.015,group.position.z);scene.add(shadow);
     panels.push(group);scene.add(group);
    }));
    if(disposed||released)return;loaded=true;resize();start();
   }catch{if(!disposed){cleanup();setReady(false);}}
  }).catch(()=>{});
  return()=>{disposed=true;wake.current=()=>{};cleanup();};
 },[collection]);
 return <div ref={host} className={styles.showroomCanvas} data-ready={ready} aria-hidden="true"><div className={styles.sceneFallback}>{[1,0,2].map((i,n)=><span key={i} style={{"--plane":n} as React.CSSProperties}><Image src={collection.artworks[i].src} alt="" fill sizes="400px" unoptimized draggable={false}/></span>)}</div></div>;
}
