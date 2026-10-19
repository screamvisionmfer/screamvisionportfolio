"use client";

import { useEffect, useRef } from "react";
import type * as Three from "three";
import { mediaSource } from "@/components/portfolio-image/PortfolioImage";
import type { CardPack } from "@/data/card-packs";
import styles from "./cardArchive.module.css";

type Props = { pack: CardPack; opening: boolean; onReady: () => void; onComplete: () => void; onUnavailable: () => void };
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => 1 - Math.pow(1 - clamp(n), 3);

/** One demand-rendered scene, only mounted while the booster is on screen. */
export function BoosterScene({ pack, opening, onReady, onComplete, onUnavailable }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const begin = useRef<() => void>(() => {});
  const requested = useRef(opening);
  const callbacks = useRef({ onReady, onComplete, onUnavailable });
  callbacks.current = { onReady, onComplete, onUnavailable };
  requested.current = opening;
  useEffect(() => { if (opening) begin.current(); }, [opening]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};
    import("three").then(async (T) => {
      if (disposed) return;
      let renderer: Three.WebGLRenderer;
      try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); }
      catch { callbacks.current.onUnavailable(); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      element.appendChild(renderer.domElement);
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(36, 1, .1, 40);
      const packGroup = new T.Group();
      scene.add(packGroup);
      scene.add(new T.HemisphereLight(0xfffee6, 0x28282f, 2.8));
      const key = new T.DirectionalLight(0xffffff, 3.4);
      key.position.set(-3, 4, 6); scene.add(key);
      const rim = new T.DirectionalLight(0xd6ee87, 3);
      rim.position.set(4, 1, 2); scene.add(rim);

      const textures = new Set<Three.Texture>();
      const geometries = new Set<Three.BufferGeometry>();
      const materials = new Set<Three.Material>();
      const geometry = <G extends Three.BufferGeometry>(g: G) => { geometries.add(g); return g; };
      const material = <M extends Three.Material>(m: M) => { materials.add(m); return m; };
      let raf = 0;
      let last = 0;
      let elapsed = 0;
      let started = false;
      let completed = false;
      let inView = true;
      let available = false;
      const landing = { x: 0, y: 0, scale: 1, spacing: 1.6 };
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      const aim = { x: -.16, y: .08 };
      const loader = new T.TextureLoader();
      const texture = async (src: string) => {
        const tex = await loader.loadAsync(mediaSource(src));
        if (disposed) { tex.dispose(); return null; }
        tex.colorSpace = T.SRGBColorSpace;
        tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
        textures.add(tex);
        return tex;
      };

      const foil = material(new T.MeshPhysicalMaterial({ color: 0xc5c865, metalness: .7, roughness: .3, clearcoat: 1, side: T.DoubleSide, transparent: true }));
      const back = new T.Mesh(geometry(new T.BoxGeometry(2.18, 3.08, .14)), foil);
      packGroup.add(back);
      // Sculpt the front surface instead of pasting a flat rectangle onto the scene.
      const frontGeometry = geometry(new T.PlaneGeometry(2.18, 3.06, 24, 32));
      const positions = frontGeometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i), y = positions.getY(i);
        positions.setZ(i, .15 + .034 * Math.sin(x * 10 + y * 1.3) * Math.pow(Math.abs(x) / 1.09, 3) + .018 * Math.cos(y * 17));
      }
      frontGeometry.computeVertexNormals();
      const frontRest = new Float32Array(positions.array);
      const frontMaterial = material(new T.MeshPhysicalMaterial({ color: 0xffffff, metalness: .18, roughness: .43, clearcoat: .8, clearcoatRoughness: .27, transparent: true, side: T.DoubleSide }));
      const front = new T.Mesh(frontGeometry, frontMaterial);
      packGroup.add(front);
      const strip = new T.Group();
      strip.position.y = 1.68;
      packGroup.add(strip);
      const crimpGeometry = geometry(new T.PlaneGeometry(2.22, .27, 80, 2));
      const crimpPositions = crimpGeometry.attributes.position;
      for (let i = 0; i < crimpPositions.count; i++) crimpPositions.setZ(i, .025 * Math.sin(crimpPositions.getX(i) * 115));
      crimpGeometry.computeVertexNormals();
      const tearGeometry = geometry(crimpGeometry.clone());
      const tearPositions = tearGeometry.attributes.position;
      const tearRest = new Float32Array(tearPositions.array);
      strip.add(new T.Mesh(tearGeometry, foil));
      const bottom = new T.Mesh(crimpGeometry, foil);
      bottom.position.y = -1.67; packGroup.add(bottom);
      const seam = new T.Mesh(geometry(new T.BoxGeometry(2.2, .018, .18)), material(new T.MeshBasicMaterial({ color: 0x2d3220 })));
      seam.position.y = 1.525; packGroup.add(seam);
      const openingGlow = material(new T.MeshBasicMaterial({ color: 0xe6f443, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
      const slit = new T.Mesh(geometry(new T.PlaneGeometry(2.12, .045)), openingGlow);
      slit.position.set(0, 1.53, .2); packGroup.add(slit);

      const cards: Three.Group[] = [];
      const cardMaterials: Three.MeshBasicMaterial[] = [];
      const cardGeometry = geometry(new T.BoxGeometry(1.25, 1.87, .032));
      const faceGeometry = geometry(new T.PlaneGeometry(1.23, 1.85));
      const metal = material(new T.MeshStandardMaterial({ color: 0x7d8588, metalness: .7, roughness: .25 }));
      // The cards have designed backs and protective sleeves throughout the reveal.
      const sleeveTexture = (art?: CanvasImageSource, index = 0) => {
        const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 768;
        const ctx = canvas.getContext("2d")!;
        const edge = ctx.createLinearGradient(0, 0, 512, 768);
        edge.addColorStop(0, "#b3c1c0"); edge.addColorStop(.14, "#243038"); edge.addColorStop(.75, "#11191c"); edge.addColorStop(1, "#8a9797");
        ctx.fillStyle = edge; ctx.fillRect(0, 0, 512, 768);
        ctx.strokeStyle = "#8fa49f"; ctx.lineWidth = 2; ctx.strokeRect(7, 7, 498, 754);
        ctx.fillStyle = "#111a1e"; ctx.fillRect(15, 15, 482, 738);
        if (art) {
          ctx.fillStyle = "#ced6cc"; ctx.fillRect(20, 21, 472, 62);
          ctx.fillStyle = "#994539"; ctx.fillRect(29, 31, 30, 29);
          ctx.fillStyle = "#f2efe4"; ctx.font = "bold 17px Arial"; ctx.fillText("SV", 32, 52);
          ctx.fillStyle = "#1c282a"; ctx.font = "bold 14px Arial"; ctx.fillText("SCREAM VISION", 72, 47);
          ctx.font = "10px Arial"; ctx.fillText(`${pack.title} / VIBECHAIN`, 72, 65);
          ctx.font = "bold 22px Arial"; ctx.fillText(`#${String(index + 1).padStart(2, "0")}`, 436, 53);
          const source = art as HTMLImageElement;
          const crop = source.naturalHeight * (472 / 634);
          ctx.drawImage(source, (source.naturalWidth - crop) / 2, 0, crop, source.naturalHeight, 20, 95, 472, 634);
        } else {
          ctx.strokeStyle = "#354333"; ctx.lineWidth = 1;
          for (let n = -768; n < 512; n += 24) { ctx.beginPath(); ctx.moveTo(n, 0); ctx.lineTo(n + 768, 768); ctx.stroke(); }
          ctx.fillStyle = "#131c16"; ctx.fillRect(55, 260, 402, 230);
          ctx.strokeStyle = "#a8b680"; ctx.strokeRect(55, 260, 402, 230);
          ctx.textAlign = "center"; ctx.fillStyle = "#dce3c0"; ctx.font = "900 61px Arial";
          ctx.fillText("SCREAM", 256, 345); ctx.fillText("VISION", 256, 409);
          ctx.font = "12px Arial"; ctx.fillText(`${pack.title} / ORIGINAL ARTWORK`, 256, 452);
          ctx.fillText("VIBECHAIN COLLECTION", 256, 690);
        }
        const tex = new T.CanvasTexture(canvas); tex.colorSpace = T.SRGBColorSpace; textures.add(tex); return tex;
      };
      const cardBack = material(new T.MeshBasicMaterial({ map: sleeveTexture() }));
      for (let i = 0; i < Math.min(5, pack.cards.length); i++) {
        const group = new T.Group();
        group.add(new T.Mesh(cardGeometry, [metal, metal, metal, metal, metal, cardBack]));
        const faceMaterial = material(new T.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
        cardMaterials.push(faceMaterial);
        const face = new T.Mesh(faceGeometry, faceMaterial);
        face.position.z = .021;
        group.add(face); group.visible = false;
        scene.add(group); cards.push(group);
      }

      const particleGeometry = geometry(new T.BufferGeometry());
      const particlePositions = new Float32Array(64 * 3);
      particleGeometry.setAttribute("position", new T.BufferAttribute(particlePositions, 3));
      const particleMaterial = material(new T.PointsMaterial({ color: 0xe0f1a4, size: .027, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }));
      const sparks = new T.Points(particleGeometry, particleMaterial); scene.add(sparks);

      const render = (now: number) => {
        raf = 0;
        if (disposed || document.hidden || !inView || completed) { element.dataset.animationActive = "false"; return; }
        const elapsedDelta = last ? (now - last) / 1000 : .016;
        const dt = Math.min(elapsedDelta, .05);
        last = now;
        let moving = false;
        if (started) {
          elapsed += elapsedDelta;
          const tension = Math.sin(clamp(elapsed / .55) * Math.PI);
          const tear = ease((elapsed - .38) / .85);
          const burst = ease((elapsed - 1.05) / 1.25);
          const exit = ease((elapsed - 1.35) / 1.15);
          packGroup.rotation.z = -.08 + tension * .055 + exit * .35;
          packGroup.rotation.y = -.14 - exit * 1.1;
          packGroup.position.y = -exit * 3.8;
          packGroup.position.x = -exit * 1.4;
          packGroup.scale.set(1 + tension * .025, 1 - tension * .035, 1);
          // The tear travels across the sealed edge before the foil peels away.
          for (let i = 0; i < tearPositions.count; i++) {
            const x = tearRest[i * 3];
            const peel = ease((tear * 1.55 - (x + 1.11) / 2.22) / .55);
            tearPositions.setXYZ(i, x, tearRest[i * 3 + 1] + peel * .65, tearRest[i * 3 + 2] + peel * .7);
          }
          tearPositions.needsUpdate = true;
          tearGeometry.computeVertexNormals();
          const detach = ease((elapsed - 1.05) / .75);
          strip.position.set(detach * 2.3, 1.68 + detach * 1.8, detach * .5);
          strip.rotation.set(detach * 1.3, detach * .7, -detach * 1.8);
          for (let i = 0; i < positions.count; i++) {
            const x = frontRest[i * 3], y = frontRest[i * 3 + 1];
            const fold = Math.max(0, (y - .25) / 1.28) * tear;
            positions.setXYZ(i, x, y - fold * .18, frontRest[i * 3 + 2] + Math.sin(x * 5) * tension * .025 + fold * .28);
          }
          positions.needsUpdate = true;
          frontGeometry.computeVertexNormals();
          openingGlow.opacity = Math.sin(tear * Math.PI) * .8;
          frontMaterial.opacity = 1 - exit;
          foil.opacity = 1 - exit;
          seam.visible = exit < .6;
          cards.forEach((card, i) => {
            const local = ease((elapsed - .95 - i * .09) / 1.1);
            const settle = ease((elapsed - 1.5 - i * .06) / .8);
            card.visible = local > 0;
            // Lift through the seal, then deal into the actual ribbon slots.
            card.position.set((landing.x + i * landing.spacing) * settle, landing.y * settle + Math.sin(local * Math.PI) * .6, 0);
            card.rotation.set((1 - local) * -.15, Math.PI * (1 - settle) - Math.min(25, i * 12) * Math.PI / 180 * settle, 0);
            const sideScale = i === 0 ? 1 : (.87 - Math.min(i - 1, 2.5) * .07) / 1.1;
            card.scale.setScalar(.75 + (landing.scale * sideScale - .75) * settle);
          });
          for (let i = 0; i < 64; i++) {
            const a = i * 2.399;
            particlePositions[i * 3] = Math.cos(a) * burst * (1.7 + i % 5 * .4);
            particlePositions[i * 3 + 1] = 1.2 + Math.sin(a) * burst * (1.2 + i % 7 * .2) - burst * burst;
            particlePositions[i * 3 + 2] = Math.sin(i * 7) * burst;
          }
          particleGeometry.attributes.position.needsUpdate = true;
          particleMaterial.opacity = Math.sin(burst * Math.PI) * .9;
          if (elapsed >= 2.7 || reduced.matches) {
            completed = true;
            element.dataset.animationActive = "false";
            callbacks.current.onComplete();
          } else moving = true;
        } else {
          const follow = 1 - Math.exp(-dt * 9);
          packGroup.rotation.y += (aim.x - packGroup.rotation.y) * follow;
          packGroup.rotation.x += (aim.y - packGroup.rotation.x) * follow;
          packGroup.rotation.z = -.085;
          moving = Math.abs(aim.x - packGroup.rotation.y) + Math.abs(aim.y - packGroup.rotation.x) > .0005;
        }
        renderer.render(scene, camera);
        element.dataset.animationActive = String(moving);
        if (moving) raf = requestAnimationFrame(render);
      };
      const wake = () => { if (!raf && !disposed && !document.hidden && inView && !completed) { last = 0; raf = requestAnimationFrame(render); } };
      const resize = () => {
        const { width, height } = element.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.z = camera.aspect < .8 ? 10 : 8.5;
        camera.updateProjectionMatrix();
        const anchor = element.closest("main")?.querySelector<HTMLElement>("[data-card-landing]");
        if (anchor) {
          const bounds = element.getBoundingClientRect(), slot = anchor.getBoundingClientRect();
          const units = 2 * Math.tan(camera.fov * Math.PI / 360) * camera.position.z / height;
          const gap = Number.parseFloat(getComputedStyle(anchor.parentElement!).columnGap) || 28;
          landing.x = (slot.left + slot.width / 2 - bounds.left - width / 2) * units;
          landing.y = (bounds.top + height / 2 - slot.top - slot.height / 2) * units;
          landing.scale = slot.height * units / 1.87;
          landing.spacing = (slot.width / 1.1 + gap) * units;
        }
        wake();
      };
      begin.current = () => {
        if (started || !available) return;
        started = true; elapsed = 0; wake();
      };
      const pointer = (event: PointerEvent) => {
        if (started || reduced.matches || event.pointerType === "touch") return;
        const bounds = element.getBoundingClientRect();
        aim.x = (event.clientX - bounds.left) / bounds.width * .52 - .26;
        aim.y = ((event.clientY - bounds.top) / bounds.height - .5) * .25;
        wake();
      };
      const leave = () => { aim.x = -.16; aim.y = .08; wake(); };
      const visibility = () => {
        if (document.hidden) { cancelAnimationFrame(raf); raf = 0; element.dataset.animationActive = "false"; }
        else wake();
      };
      const contextLost = (event: Event) => { event.preventDefault(); callbacks.current.onUnavailable(); };
      const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(element);
      const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (inView) wake(); else { cancelAnimationFrame(raf); raf = 0; element.dataset.animationActive = "false"; } });
      observer.observe(element);
      const surface = element.parentElement!;
      surface.addEventListener("pointermove", pointer);
      surface.addEventListener("pointerleave", leave);
      document.addEventListener("visibilitychange", visibility);
      renderer.domElement.addEventListener("webglcontextlost", contextLost);
      reduced.addEventListener("change", wake);
      cleanup = () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect(); observer.disconnect();
        surface.removeEventListener("pointermove", pointer); surface.removeEventListener("pointerleave", leave);
        document.removeEventListener("visibilitychange", visibility);
        reduced.removeEventListener("change", wake);
        renderer.domElement.removeEventListener("webglcontextlost", contextLost);
        geometries.forEach((g) => g.dispose()); materials.forEach((m) => m.dispose()); textures.forEach((t) => t.dispose());
        renderer.dispose(); renderer.domElement.remove();
      };
      resize();
      try {
        const cover = await texture(pack.artwork);
        if (disposed || !cover) return;
        frontMaterial.map = cover; frontMaterial.needsUpdate = true;
        await Promise.all(cards.map(async (_, i) => {
          const index = i;
          const map = await texture(pack.cards[index].image);
          if (!map || disposed) return;
          cardMaterials[i].map = sleeveTexture(map.image, index); cardMaterials[i].needsUpdate = true;
        }));
        if (disposed) return;
        available = true;
        element.dataset.ready = "true";
        callbacks.current.onReady();
        if (requested.current) begin.current();
        wake();
      } catch { if (!disposed) callbacks.current.onUnavailable(); }
    }).catch(() => { if (!disposed) callbacks.current.onUnavailable(); });
    return () => { disposed = true; begin.current = () => {}; cleanup(); };
  }, [pack]);
  return <div ref={host} className={styles.webgl} aria-hidden="true" data-animation-active="false" />;
}
