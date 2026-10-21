"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { isPageActive, observePageActivity } from "@/components/site-nav/pageActivity";
import styles from "./portfolioHome.module.css";

const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment=`
uniform sampler2D art;uniform float power;uniform float time;uniform float kind;
varying vec2 vUv;
void main(){
 vec2 uv=vUv;
 if(kind==2.)uv.y=.34+uv.y*.66;
 if(kind==1.)uv.x+=sin(uv.y*5.+time*.7)*.0015*sin(uv.y*3.14159);
 vec4 c=texture2D(art,uv);if(c.a<.06)discard;
 float ambient=kind==2.?.4:.14;
 c.rgb*=mix(vec3(ambient,ambient,ambient),vec3(1.02,.94,.8),power);
 if(kind==2.){
  float bulb=1.-smoothstep(.65,1.,length((uv-vec2(.5,.445))/vec2(.14,.064)));
  c.rgb=c.rgb*(1.+bulb*power*1.4)+vec3(.32,.18,.025)*bulb*power;
 }
 float d=mod(floor(gl_FragCoord.x)+floor(gl_FragCoord.y)*2.,4.)/4.-.375;
 gl_FragColor=vec4(c.rgb+d*.003,c.a);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

export function RoomScene({lit,motion,resetVersion,onReady}:{lit:boolean;motion:boolean;resetVersion:number;onReady:()=>void}){
 const host=useRef<HTMLDivElement>(null),control=useRef({lit,motion,resetVersion,onReady});
 control.current={lit,motion,resetVersion,onReady};
 const wake=useRef<()=>void>(()=>{}),[failed,setFailed]=useState(false);
 useEffect(()=>{wake.current();},[lit,motion,resetVersion]);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  let disposed=false,cleanup=()=>{};
  import("three").then(async T=>{
   if(disposed)throw new Error("Scene disposed");
   let renderer:THREE.WebGLRenderer;
   try{renderer=new T.WebGLRenderer({alpha:true,antialias:false,powerPreference:"low-power"});}
   catch{setFailed(true);control.current.onReady();return;}
   renderer.outputColorSpace=T.SRGBColorSpace;renderer.setPixelRatio(1);renderer.setClearColor(0x000000,0);el.appendChild(renderer.domElement);
   const scene=new T.Scene(),camera=new T.PerspectiveCamera(40,1,.1,40);
   camera.position.set(0,0,10);
   const textures:THREE.Texture[]=[],materials:THREE.Material[]=[],geometries:THREE.BufferGeometry[]=[];
   const uniforms={power:{value:0},time:{value:0}},root=el.closest("main");
   const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
   const loader=new T.TextureLoader();
   let frame=0,last=0,time=0,intro=0,power=0,loaded=false,mobile=false,baseZ=10;
   let lastInteraction=0;
   let aimX=0,aimY=0,zoom=0,lastReset=control.current.resetVersion;
   let angle=0,velocity=0,pitch=0,pitchVelocity=0,previousPointerX:number|null=null,previousPointerY=0;
   let character:THREE.Mesh|undefined,lampMesh:THREE.Mesh|undefined,beamMesh:THREE.Mesh|undefined,blackCat:THREE.Mesh|undefined,orangeCat:THREE.Mesh|undefined;
   const pendulum=new T.Group();scene.add(pendulum);
   const layer=async(file:string,w:number,h:number,x:number,y:number,z:number,order:number,kind=0,parent:THREE.Object3D=scene)=>{
    if(disposed)throw new Error("Scene disposed");
    const texture=await loader.loadAsync(`/scene/${file}.webp`);
    if(disposed){texture.dispose();throw new Error("Scene disposed");}
    texture.colorSpace=T.SRGBColorSpace;texture.minFilter=T.LinearFilter;texture.magFilter=T.NearestFilter;textures.push(texture);
    const geometry=new T.PlaneGeometry(w,h);geometries.push(geometry);
    const material=new T.ShaderMaterial({uniforms:{...uniforms,art:{value:texture},kind:{value:kind}},vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false});materials.push(material);
    const mesh=new T.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.renderOrder=order;parent.add(mesh);return mesh;
   };
   const dustGeo=new T.BufferGeometry(),dustPositions=new Float32Array(40*3);
   for(let i=0;i<40;i++){dustPositions[i*3]=Math.sin(i*53.7)*2.5;dustPositions[i*3+1]=i/40*6-3;dustPositions[i*3+2]=Math.sin(i*31.1 )*1.35;}
   dustGeo.setAttribute("position",new T.BufferAttribute(dustPositions,3));geometries.push(dustGeo);
   const dustMat=new T.PointsMaterial({color:0xf5c675,size:.015,transparent:true,opacity:0,depthWrite:false});materials.push(dustMat);
   const dust=new T.Points(dustGeo,dustMat);dust.renderOrder=7;scene.add(dust);
   const render=(now:number)=>{
    frame=0;if(disposed||!isPageActive()){el.dataset.animationActive="false";return;}
    const moving=control.current.motion&&!reduced.matches;
    if(last&&now-last<32&&moving){frame=requestAnimationFrame(render);return;}
    const dt=last?Math.min((now-last)/1000,.05):.016;last=now;time+=dt;
    if(lastReset!==control.current.resetVersion){lastReset=control.current.resetVersion;zoom=0;aimX=aimY=0;angle=velocity=pitch=pitchVelocity=0;previousPointerX=null;root?.style.setProperty("--mouse-x","0px");root?.style.setProperty("--mouse-y","0px");}
    if(loaded)intro=Math.min(3,intro+dt);
    let target=control.current.lit?(!moving?1:intro<.25?0:intro<.38?.8:intro<.48?.12:intro<.6?.9:intro<.66?.3:1):0;
    const idle=moving?T.MathUtils.smoothstep(time-lastInteraction,2,5):0;
    const phase=time%20;
    if(moving&&control.current.lit&&time>=20&&phase<.28){target*=1-.24*Math.pow(Math.sin(phase/.28*Math.PI),2);el.dataset.lastFlicker=String(Math.floor(time/20)*20);}
    power+=(target-power)*(reduced.matches?1:1-Math.exp(-dt*9));uniforms.power.value=power;
    uniforms.time.value=moving?time:0;
    if(!moving){aimX=aimY=0;angle=velocity=pitch=pitchVelocity=0;}
    const cameraX=aimX+Math.sin(time*.23)*.045*idle,cameraY=aimY+Math.sin(time*.19)*.028*idle;
    camera.position.x+=(cameraX-camera.position.x)*(1-Math.exp(-dt*4));
    camera.position.y+=(cameraY-camera.position.y)*(1-Math.exp(-dt*4));
    camera.position.z+=(baseZ+zoom-camera.position.z)*(reduced.matches?1:1-Math.exp(-dt*5));
    camera.lookAt(0,mobile?-2.1:0,0);
    if(moving){
     velocity+=(-angle*18-velocity*2.6)*dt;angle+=velocity*dt;
     pitchVelocity+=(-pitch*20-pitchVelocity*3)*dt;pitch+=pitchVelocity*dt;
     angle=T.MathUtils.clamp(angle,-.2,.2);pitch=T.MathUtils.clamp(pitch,-.12,.12);
     if(Math.abs(angle)+Math.abs(velocity)<.0001)angle=velocity=0;
     if(Math.abs(pitch)+Math.abs(pitchVelocity)<.0001)pitch=pitchVelocity=0;
    }
    pendulum.rotation.set(pitch+Math.sin(time*.71)*.004*idle,0,angle+Math.sin(time*.83)*.012*idle);
    if(character)character.scale.y=moving?1+Math.sin(time*.8)*.002:1;
    dustMat.opacity=power*.2;dust.position.y=moving?Math.sin(time*.12)*.15:0;
    el.dataset.lampAngle=pendulum.rotation.z.toFixed(4);el.dataset.lightLevel=power.toFixed(3);el.dataset.idle=idle.toFixed(2);el.dataset.zoom=(camera.position.z-baseZ).toFixed(3);
    renderer.render(scene,camera);
    const settling=Math.abs(power-target)>.001||Math.abs(camera.position.x-aimX)>.001||Math.abs(camera.position.y-aimY)>.001||Math.abs(camera.position.z-baseZ-zoom)>.001;
    if(moving||settling||intro<1){frame=requestAnimationFrame(render);el.dataset.animationActive="true";}else el.dataset.animationActive="false";
   };
   const start=()=>{if(!disposed&&!frame&&isPageActive()){last=0;frame=requestAnimationFrame(render);}};wake.current=start;
   const resize=()=>{
    const {width,height}=el.getBoundingClientRect();mobile=width<600;baseZ=mobile?15.2:10;
    camera.aspect=width/height;camera.fov=mobile?44:40;camera.position.z=baseZ+zoom;camera.updateProjectionMatrix();
    // The pivot sits at the ceiling, rather than at the centre of the lampshade.
    pendulum.position.set(0,(baseZ-.7)*Math.tan(T.MathUtils.degToRad(camera.fov/2))+(mobile?-2:.12),.7);
    const lift=20*(2*(baseZ-.7)*Math.tan(T.MathUtils.degToRad(camera.fov/2)))/height;
    if(lampMesh)lampMesh.position.y=-.93+lift;if(beamMesh)beamMesh.position.y=-4.5+lift;
    if(blackCat)blackCat.position.x=mobile?-2.5:-2.73;if(orangeCat)orangeCat.position.x=mobile?2.5:2.95;
    renderer.setSize(Math.max(1,Math.round(width*.8)),Math.max(1,Math.round(height*.8)),false);start();
   };
   const pointer=(event:PointerEvent)=>{
    if(reduced.matches||!control.current.motion||event.pointerType==="touch")return;
    lastInteraction=time;
    const x=event.clientX/window.innerWidth,y=event.clientY/window.innerHeight;
    if(previousPointerX!==null){velocity+=-T.MathUtils.clamp(x-previousPointerX,-.15,.15)*2.5;pitchVelocity+=T.MathUtils.clamp(y-previousPointerY,-.15,.15 )*1.35;}
    previousPointerX=x;previousPointerY=y;
    aimX=(x-.5)*.58;aimY=-(y-.5)*.3;
    root?.style.setProperty("--mouse-x",`${aimX*25}px`);root?.style.setProperty("--mouse-y",`${-aimY*25}px`);start();
   };
   const leave=()=>{lastInteraction=time;aimX=aimY=0;previousPointerX=null;root?.style.setProperty("--mouse-x","0px");root?.style.setProperty("--mouse-y","0px");start();};
   const wheel=(event:WheelEvent)=>{
    if(event.ctrlKey||!isPageActive()||(event.target as HTMLElement).closest("[data-room-settings]")||(mobile&&(event.target as HTMLElement).closest("nav[aria-label=\"Choose a world\"]")))return;
    event.preventDefault();
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?window.innerHeight:1);
    zoom=T.MathUtils.clamp(zoom+delta*.0015,-1.05,.7);start();
   };
   const activity=()=>{if(root)root.dataset.active=String(isPageActive());previousPointerX=null;if(!isPageActive()){cancelAnimationFrame(frame);frame=0;el.dataset.animationActive="false";}else start();};
   const observer=new ResizeObserver(resize);observer.observe(el);
   window.addEventListener("pointermove",pointer);document.addEventListener("pointerleave",leave);root?.addEventListener("wheel",wheel,{passive:false});
   const stop=observePageActivity(activity);reduced.addEventListener("change",start);
   const lost=(event:Event)=>{event.preventDefault();setFailed(true);control.current.onReady();cancelAnimationFrame(frame);frame=0;};
   renderer.domElement.addEventListener("webglcontextlost",lost);
   let released=false;
   cleanup=()=>{if(released)return;released=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener("pointermove",pointer);document.removeEventListener("pointerleave",leave);root?.removeEventListener("wheel",wheel);stop();reduced.removeEventListener("change",start);renderer.domElement.removeEventListener("webglcontextlost",lost);textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());renderer.dispose();renderer.domElement.remove();};
   try{
    await layer("plants",13,7.5,0,.1,-2.4,0);
    await layer("rug",12,3,0,-2.5,-1.6,1);
    blackCat=await layer("cat",1.25,1.25,-2.73,-1.95,-1.2,2);
    orangeCat=await layer("cat-orange",1.3,1.3,2.95,-1.95,-1.2,2);
    character=await layer("character",4.55,5.6,0,-.65,0,4,1);
    lampMesh=await layer("lamp-off",2.25,1.86,0,-.93,0,6,2,pendulum);
    const beamGeo=new T.PlaneGeometry(6,6);geometries.push(beamGeo);
    const beamMat=new T.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:`uniform float power;varying vec2 vUv;void main(){float spread=.025+(1.-vUv.y)*.47;float edge=1.-smoothstep(spread*.7,spread,abs(vUv.x-.5));float fade=smoothstep(0.,.25,vUv.y)*(1.-smoothstep(.92,1.,vUv.y));gl_FragColor=vec4(.82,.55,.23,edge*fade*power*.13);}`,transparent:true,depthWrite:false,blending:T.AdditiveBlending});materials.push(beamMat);
    const beam=new T.Mesh(beamGeo,beamMat);beamMesh=beam;beam.position.set(0,-4.5,-1.4);beam.renderOrder=3;pendulum.add(beam);
    if(disposed)throw new Error("Scene disposed");loaded=true;resize();control.current.onReady();start();
   }catch{if(!disposed){cleanup();setFailed(true);control.current.onReady();}}
  }).catch(()=>{if(!disposed){setFailed(true);control.current.onReady();}});
  return()=>{disposed=true;wake.current=()=>{};cleanup();};
 },[]);
 return <div className={styles.canvas} ref={host} aria-hidden="true" data-animation-active="false">{failed&&<Image className={styles.fallback} src="/scene/fallback.webp" alt="" fill unoptimized/>}</div>;
}
