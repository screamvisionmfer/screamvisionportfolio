"use client";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { isPageActive, observePageActivity } from "@/components/site-nav/pageActivity";
import styles from "./portfolioHome.module.css";

const vertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment = `
uniform sampler2D art; uniform float power; uniform float time; uniform float kind;
varying vec2 vUv;
void main(){
 vec2 uv=vUv; if(kind==2.) uv.y=.56+uv.y*.44;
 if(kind==1.) uv.x+=sin(uv.y*5.+time*.7)*.0015*sin(uv.y*3.14159);
 vec4 c=texture2D(art,uv); if(c.a<.06) discard;

 float light=power*(.86+.025*sin(time*1.9));
 c.rgb*=mix(vec3(.13,.145,.16),vec3(1.04,.94,.77),light);
 if(kind==2.) c.a*=power;
 float d=mod(floor(gl_FragCoord.x)+floor(gl_FragCoord.y)*2.,4.)/4.-.375;
 c.rgb+=d*.003;
 gl_FragColor=c;
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

export function RoomScene({ lit, onReady }: { lit: boolean; onReady: () => void }) {
 const host=useRef<HTMLDivElement>(null);
 const control=useRef({lit,onReady}); control.current={lit,onReady};
 const wake=useRef<()=>void>(()=>{});
 const [failed,setFailed]=useState(false);
 useEffect(()=>{wake.current();},[lit]);
 useEffect(()=>{
  const el=host.current; if(!el) return;
  let disposed=false, cleanup=()=>{};
  import("three").then(async T=>{
   if(disposed)return;
   let renderer:THREE.WebGLRenderer;
   try {renderer=new T.WebGLRenderer({alpha:true,antialias:false,powerPreference:"low-power"});} catch {setFailed(true);control.current.onReady();return;}
   renderer.outputColorSpace=T.SRGBColorSpace; renderer.setPixelRatio(1); renderer.setClearColor(0x000000,0); el.appendChild(renderer.domElement);
   const scene=new T.Scene(); const camera=new T.PerspectiveCamera(40,1,.1,40); camera.position.set(0,0,10);
   const textures:THREE.Texture[]=[],materials:THREE.Material[]=[],geometries:THREE.BufferGeometry[]=[];
   const uniforms={power:{value:0},time:{value:0}};
   let frame=0,last=0,time=0,loaded=false,intro=0,power=0,aimX=0,aimY=0,mobile=false;
   const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
   const objects:THREE.Mesh[]=[];
   const textureLoader=new T.TextureLoader();
   const layer=async(file:string,w:number,h:number,x:number,y:number,z:number,kind=0)=>{
    if(disposed)return;
    const texture=await textureLoader.loadAsync(`/scene/${file}.webp`);
    if(disposed){texture.dispose();return;}
    texture.colorSpace=T.SRGBColorSpace; texture.minFilter=T.LinearFilter; texture.magFilter=T.NearestFilter; textures.push(texture);
    const geo=new T.PlaneGeometry(w,h);geometries.push(geo);
    const material=new T.ShaderMaterial({uniforms:{...uniforms,art:{value:texture},kind:{value:kind}},vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false});materials.push(material);
    const mesh=new T.Mesh(geo,material);mesh.position.set(x,y,z);mesh.renderOrder=objects.length;scene.add(mesh);objects.push(mesh);return mesh;
   };
   const dustGeo=new T.BufferGeometry();const dustPositions=new Float32Array(55*3);
   for(let i=0;i<55;i++){dustPositions[i*3]=Math.sin(i*53.7)*2.5;dustPositions[i*3+1]=(i/55)*6-3;dustPositions[i*3+2]=Math.sin(i*31.1)*2;}
   dustGeo.setAttribute("position",new T.BufferAttribute(dustPositions,3));geometries.push(dustGeo);
   const dustMat=new T.PointsMaterial({color:0xf5c675,size:.015,transparent:true,opacity:0,depthWrite:false});materials.push(dustMat);const dust=new T.Points(dustGeo,dustMat);scene.add(dust);
   let character:THREE.Mesh|undefined,lampMesh:THREE.Mesh|undefined;
   const render=(now:number)=>{
    frame=0;if(disposed||!isPageActive()) {el.dataset.animationActive="false";return;}
    if(last && now-last<32 && !reduced.matches){frame=requestAnimationFrame(render);return;} const dt=last?Math.min((now-last)/1000,.05):.016;last=now;time+=dt;
    if(loaded)intro=Math.min(3,intro+dt);
    const target=control.current.lit?(reduced.matches?1:intro<.25?0:intro<.38?.8:intro<.48?.12:intro<.6?.9:intro<.66?.3:1):0;
    power+=(target-power)*(reduced.matches?1:1-Math.exp(-dt*9));uniforms.power.value=power;
    uniforms.time.value=reduced.matches?0:time;
    camera.position.x+=(aimX-camera.position.x)*(1-Math.exp(-dt*4));camera.position.y+=(aimY-camera.position.y)*(1-Math.exp(-dt*4));camera.lookAt(0,mobile?-.6:0,0);
    if(character&&!reduced.matches)character.scale.y=1+Math.sin(time*.8)*.002;
    if(lampMesh&&!reduced.matches)lampMesh.rotation.z=Math.sin(time*.65)*.008;
    dustMat.opacity=power*.22;dust.position.y=Math.sin(time*.12)*.15;
    renderer.render(scene,camera);
    const settling=Math.abs(power-target)>.001||Math.abs(camera.position.x-aimX)>.001||Math.abs(camera.position.y-aimY)>.001;
    if(!reduced.matches||settling||intro<1){frame=requestAnimationFrame(render);el.dataset.animationActive="true";}else el.dataset.animationActive="false";
   };
   const start=()=>{if(!disposed&&!frame&&isPageActive()){last=0;frame=requestAnimationFrame(render);}};wake.current=start;
   const resize=()=>{const {width,height}=el.getBoundingClientRect();mobile=width<600;camera.aspect=width/height;camera.position.z=mobile?12.5:10;camera.fov=mobile?44:40;camera.updateProjectionMatrix();renderer.setSize(Math.max(1,Math.round(width*.8)),Math.max(1,Math.round(height*.8)),false);start();};
   const root=el.closest("main");
   const pointer=(event:PointerEvent)=>{if(reduced.matches||event.pointerType==="touch")return;aimX=(event.clientX/window.innerWidth-.5)*.42;aimY=-(event.clientY/window.innerHeight-.5)*.25;root?.style.setProperty("--mouse-x",`${aimX*35}px`);root?.style.setProperty("--mouse-y",`${-aimY*35}px`);start();};
   const leave=()=>{aimX=aimY=0;root?.style.setProperty("--mouse-x","0px");root?.style.setProperty("--mouse-y","0px");start();};
   const activity=()=>{if(root)root.dataset.active=String(isPageActive());if(!isPageActive()){cancelAnimationFrame(frame);frame=0;el.dataset.animationActive="false";}else start();};
   const observer=new ResizeObserver(resize);observer.observe(el);window.addEventListener("pointermove",pointer);document.addEventListener("pointerleave",leave);const stop=observePageActivity(activity);reduced.addEventListener("change",start);
   const lost=(event:Event)=>{event.preventDefault();setFailed(true);control.current.onReady();cancelAnimationFrame(frame);frame=0;};renderer.domElement.addEventListener("webglcontextlost",lost);
   cleanup=()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener("pointermove",pointer);document.removeEventListener("pointerleave",leave);stop();reduced.removeEventListener("change",start);renderer.domElement.removeEventListener("webglcontextlost",lost);textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());renderer.dispose();renderer.domElement.remove();};
   try {
    // Keep compositing order stable regardless of download timing.
    await layer("plants",13,7.5,0,.1,-2.4);
    await layer("rug",12,3,0,-2.5,-1.6);
    const beamGeo=new T.PlaneGeometry(6,6);geometries.push(beamGeo);
    const beamMat=new T.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:`uniform float power;varying vec2 vUv;void main(){float spread=.025+(1.-vUv.y)*.47;float edge=1.-smoothstep(spread*.7,spread,abs(vUv.x-.5));float fade=smoothstep(0.,.25,vUv.y)*(1.-smoothstep(.92,1.,vUv.y));gl_FragColor=vec4(.82,.55,.23,edge*fade*power*.13);}`,transparent:true,depthWrite:false,blending:T.AdditiveBlending});materials.push(beamMat);
    const beam=new T.Mesh(beamGeo,beamMat);beam.position.set(0,-.25,-.7);beam.renderOrder=2;scene.add(beam);
    character=await layer("character",4.55,5.6,0,-.65,0,1);
    const smokeGeo=new T.PlaneGeometry(.65,1.55);geometries.push(smokeGeo);
    const smokeMat=new T.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:`uniform float time;uniform float power;varying vec2 vUv;void main(){float y=vUv.y;float bend=sin(y*8.-time*.8)*.12*y+sin(y*17.+time*.5)*.04;float width=.015+y*.13;float thread=exp(-pow((vUv.x-.5-bend)/width,2.));float fade=sin(y*3.14159);gl_FragColor=vec4(.6,.57,.51,thread*fade*power*.15);}`,transparent:true,depthWrite:false});materials.push(smokeMat);
    const smoke=new T.Mesh(smokeGeo,smokeMat);smoke.position.set(-.93,1.85,.12);smoke.renderOrder=5;scene.add(smoke);
    await layer("cat",1.45,1.45,-2.15,-2.45,.5);
    lampMesh=await layer("lamp",2.8,1.75,0,2.9,.7,2);
    if(disposed)return;loaded=true;resize();control.current.onReady();start();
   }catch{if(!disposed){setFailed(true);control.current.onReady();}}
  }).catch(()=>{if(!disposed){setFailed(true);control.current.onReady();}});
  return()=>{disposed=true;wake.current=()=>{};cleanup();};
 },[]);
 return <div className={styles.canvas} ref={host} aria-hidden="true" data-animation-active="false">{failed&&<img className={styles.fallback} src="/scene/fallback.webp" alt="" />}</div>;
}
