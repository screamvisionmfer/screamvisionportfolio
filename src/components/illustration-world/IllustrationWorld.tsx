"use client";

import Image from "next/image";
import { CSSProperties, PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { FullscreenButton } from "@/components/fullscreen-button/FullscreenButton";
import { Illustration, illustrations } from "@/data/illustrations";
import styles from "./illustrationWorld.module.css";

const copies = [
  { id: "origin", x: 0, y: 0 },
  { id: "horizontal", x: 1, y: 0 },
  { id: "vertical", x: 0, y: 1 },
  { id: "diagonal", x: 1, y: 1 },
] as const;
const planeArtIndexes = copies.map((_, copyIndex) => [
  ...illustrations.map((__, artIndex) => artIndex),
  (copyIndex * 13 + 23) % illustrations.length,
]);
const clampLoop = (value: number, size: number) => value > size / 2 ? value - size : value < -size / 2 ? value + size : value;

export function IllustrationWorld() {
  const worldRef = useRef<HTMLDivElement>(null);
  const planeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stageRef = useRef<HTMLElement>(null);
  const coordinateRef = useRef<HTMLElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const motion = useRef({ dragging: false, playMode: true, selected: false, reduced: false });
  const worldSize = useRef({ width: 2800, height: 3734 });
  const pointer = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, lastTime: 0, cameraX: 0, cameraY: 0, index: -1, moved: false, active: false });
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [playMode, setPlayMode] = useState(true);
  const selectedArt = selected === null ? null : illustrations[selected];

  useEffect(() => { motion.current.playMode = playMode; }, [playMode]);
  useEffect(() => {
    motion.current.selected = selected !== null;
    if (selected !== null) velocity.current = { x: 0, y: 0 };
  }, [selected]);

  const switchArt = useCallback((direction: number) => {
    setSelected((value) => value === null ? 0 : (value + direction + illustrations.length) % illustrations.length);
  }, []);

  useEffect(() => {
    const syncWorldSize = () => {
      if (window.innerWidth <= 700) {
        worldSize.current = { width: 760, height: 4054 };
      } else {
        const width = Math.max(2800, window.innerWidth + 900);
        const tileSize = (width - 324) / 6;
        worldSize.current = { width, height: Math.ceil(432 + tileSize * 8) };
      }
      stageRef.current?.style.setProperty("--world-width", String(worldSize.current.width));
      stageRef.current?.style.setProperty("--world-height", String(worldSize.current.height));
    };
    syncWorldSize();
    window.addEventListener("resize", syncWorldSize, { passive: true });
    let frame = 0;
    let running = !document.hidden;
    let lastTime = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReducedMotion = () => { motion.current.reduced = reduceMotion.matches; };
    syncReducedMotion();
    reduceMotion.addEventListener("change", syncReducedMotion);
    const render = (now: number) => {
      if (!running) return;
      const world = worldRef.current;
      if (world) {
        const { width, height } = worldSize.current;
        const delta = Math.min(32, Math.max(1, now - lastTime));
        lastTime = now;
        if (!motion.current.dragging && !motion.current.selected) {
          const speed = Math.hypot(velocity.current.x, velocity.current.y);
          if (speed > .003 && !motion.current.reduced) {
            target.current.x += velocity.current.x * delta;
            target.current.y += velocity.current.y * delta;
            const friction = Math.pow(.91, delta / 16.667);
            velocity.current.x *= friction;
            velocity.current.y *= friction;
          } else {
            velocity.current = { x: 0, y: 0 };
            if (motion.current.playMode && !motion.current.reduced) {
              target.current.x += .0275 * delta;
              target.current.y += .01 * delta;
            }
          }
        }
        const damping = motion.current.reduced ? 1 : 1 - Math.pow(.89, delta / 16.667);
        current.current.x += (target.current.x - current.current.x) * damping;
        current.current.y += (target.current.y - current.current.y) * damping;
        if (Math.abs(target.current.x - current.current.x) < .02) current.current.x = target.current.x;
        if (Math.abs(target.current.y - current.current.y) < .02) current.current.y = target.current.y;
        const wrappedX = clampLoop(current.current.x, width);
        const wrappedY = clampLoop(current.current.y, height);
        if (wrappedX !== current.current.x) {
          current.current.x = wrappedX;
          target.current.x = clampLoop(target.current.x, width);
        }
        if (wrappedY !== current.current.y) {
          current.current.y = wrappedY;
          target.current.y = clampLoop(target.current.y, height);
        }
        const sideX = wrappedX >= 0 ? 1 : -1;
        const sideY = wrappedY >= 0 ? 1 : -1;
        const positions = [[0, 0], [sideX, 0], [0, sideY], [sideX, sideY]];
        planeRefs.current.forEach((plane, index) => {
          if (!plane) return;
          const [x, y] = positions[index];
          plane.style.transform = `translate(calc(-50% + ${x * 100}%), calc(-50% + ${y * 100}%))`;
        });
        world.style.transform = `translate3d(${-current.current.x}px, ${-current.current.y}px, 0)`;
        if (coordinateRef.current) coordinateRef.current.textContent = `${Math.round(current.current.x).toString().padStart(4, "0")} / ${Math.round(current.current.y).toString().padStart(4, "0")}`;
      }
      frame = requestAnimationFrame(render);
    };
    const syncVisibility = () => {
      running = !document.hidden;
      stageRef.current?.setAttribute("data-animation-active", String(running));
      lastTime = performance.now();
      if (running && frame === 0) frame = requestAnimationFrame(render);
      if (!running && frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    if (running) frame = requestAnimationFrame(render);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", syncWorldSize);
      document.removeEventListener("visibilitychange", syncVisibility);
      reduceMotion.removeEventListener("change", syncReducedMotion);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (selected !== null) {
        if (event.key === "Escape") setSelected(null);
        if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") switchArt(-1);
        if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") switchArt(1);
        return;
      }
      const step = event.shiftKey ? 280 : 150;
      velocity.current = { x: 0, y: 0 };
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") target.current.x -= step;
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") target.current.x += step;
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") target.current.y -= step;
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") target.current.y += step;
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [selected, switchArt]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      if (selected !== null) return;
      event.preventDefault();
      velocity.current = { x: 0, y: 0 };
      target.current.x += event.deltaX || event.deltaY * .58;
      target.current.y += event.deltaY * .72;
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [selected]);

  const pointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (selected !== null || (event.target as HTMLElement).closest("a, [data-ui]")) return;
    const tile = (event.target as HTMLElement).closest<HTMLElement>("[data-art-index]");
    const now = performance.now();
    pointer.current = { x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, lastTime: now, cameraX: target.current.x, cameraY: target.current.y, index: tile ? Number(tile.dataset.artIndex) : -1, moved: false, active: true };
    velocity.current = { x: 0, y: 0 };
    motion.current.dragging = true;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!pointer.current.active) return;
    const dx = event.clientX - pointer.current.x;
    const dy = event.clientY - pointer.current.y;
    const now = performance.now();
    const delta = Math.max(8, now - pointer.current.lastTime);
    const instantX = -(event.clientX - pointer.current.lastX) / delta;
    const instantY = -(event.clientY - pointer.current.lastY) / delta;
    velocity.current.x = Math.max(-2.4, Math.min(2.4, velocity.current.x * .62 + instantX * .38));
    velocity.current.y = Math.max(-2.4, Math.min(2.4, velocity.current.y * .62 + instantY * .38));
    pointer.current.lastX = event.clientX;
    pointer.current.lastY = event.clientY;
    pointer.current.lastTime = now;
    if (Math.hypot(dx, dy) > 6) pointer.current.moved = true;
    target.current.x = pointer.current.cameraX - dx;
    target.current.y = pointer.current.cameraY - dy;
  };

  const pointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (!pointer.current.active) return;
    pointer.current.active = false;
    motion.current.dragging = false;
    setDragging(false);
    if (!pointer.current.moved && pointer.current.index >= 0) {
      velocity.current = { x: 0, y: 0 };
      setSelected(pointer.current.index);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <main ref={stageRef} className={styles.stage} data-dragging={dragging} data-preview={selected !== null} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}>
      <div className={styles.ambient} aria-hidden="true" />
      <div ref={worldRef} className={styles.world} aria-label="Infinite illustration world">
        {copies.map((copy, copyIndex) => (
          <div key={copy.id} ref={(node) => { planeRefs.current[copyIndex] = node; }} className={styles.plane} style={{ transform: `translate(calc(-50% + ${copy.x * 100}%), calc(-50% + ${copy.y * 100}%))` }} aria-hidden={copyIndex !== 0}>
            {planeArtIndexes[copyIndex].map((artIndex, cellIndex) => {
              const art = illustrations[artIndex];
              return <ArtTile key={`${copy.id}-${cellIndex}-${art.id}`} art={art} index={artIndex} priority={copyIndex === 0 && cellIndex < 5} arrival={copyIndex === 0 && cellIndex >= 18 && cellIndex <= 29} />;
            })}
          </div>
        ))}
      </div>
      <div className={styles.vignette} aria-hidden="true" />

      <div data-ui><SiteNav /></div>

      <div className={styles.hud} data-ui>
        <div><span>Illustration world</span><strong ref={coordinateRef}>0000 / 0000</strong></div>
        <button type="button" data-active={playMode} onClick={() => setPlayMode((value) => !value)}><i /> {playMode ? "Drift on" : "Drift off"}</button>
      </div>
      <p className={styles.controls} data-ui><span>Drag / Scroll</span><span>W A S D</span><span>Click to inspect</span></p>
      <div data-ui><FullscreenButton /></div>

      {selectedArt && <Preview art={selectedArt} index={selected!} total={illustrations.length} onClose={() => setSelected(null)} onSwitch={switchArt} />}
    </main>
  );
}

function ArtTile({ art, index, priority, arrival }: { art: Illustration; index: number; priority: boolean; arrival: boolean }) {
  const arrivalStyle = arrival ? {
    "--entry-scale": index % 3 === 0 ? 1.14 : index % 3 === 1 ? .86 : 1.08,
    "--entry-delay": `${((index * 7) % 12) * 52}ms`,
  } as CSSProperties : {};
  return (
    <button className={`${styles.tile} ${arrival ? styles.arrivingTile : ""}`} type="button" data-art-index={index} style={{ "--tile-accent": art.accent, ...arrivalStyle } as CSSProperties} tabIndex={-1}>
      <Image src={art.image} alt={art.title} fill sizes="(max-width: 700px) 42vw, 22vw" priority={priority} draggable="false" />
      <span><b>{String(index + 1).padStart(2, "0")}</b><strong>{art.title}</strong><i>{art.year}</i></span>
    </button>
  );
}

function Preview({ art, index, total, onClose, onSwitch }: { art: Illustration; index: number; total: number; onClose: () => void; onSwitch: (direction: number) => void }) {
  return (
    <section className={styles.preview} style={{ "--preview-accent": art.accent } as CSSProperties} data-ui aria-label={`${art.title} full preview`}>
      <div className={styles.previewImage} key={art.id}><Image src={art.image} alt={art.title} fill sizes="90vw" priority draggable="false" unoptimized /></div>
      <div className={styles.previewInfo}>
        <span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <h1>{art.title}</h1>
        <p>{art.medium} · {art.year}</p>
      </div>
      <button className={styles.closePreview} type="button" onClick={onClose}>Close <span>×</span></button>
      <div className={styles.previewControls}>
        <button type="button" onClick={() => onSwitch(-1)} aria-label="Previous illustration">←</button>
        <div><span style={{ transform: `scaleX(${(index + 1) / total})` }} /></div>
        <button type="button" onClick={() => onSwitch(1)} aria-label="Next illustration">→</button>
      </div>
    </section>
  );
}
