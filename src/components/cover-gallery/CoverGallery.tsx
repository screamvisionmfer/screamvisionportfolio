"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { covers } from "@/data/covers";

import { BackgroundScene } from "./BackgroundScene";
import { CoverCard } from "./CoverCard";
import { CoverInfo } from "./CoverInfo";
import { GalleryNavigation } from "./GalleryNavigation";
import { useGalleryController } from "./useGalleryController";
import { useGalleryTilt } from "./useGalleryTilt";
import styles from "./coverGallery.module.css";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function CoverGallery() {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const paletteIndexRef = useRef(-1);
  const lastProgressRef = useRef(0);
  const movementLeanRef = useRef(0);
  const [openingIndex, setOpeningIndex] = useState<number | null>(null);
  const [openingProgress, setOpeningProgress] = useState(0);
  const [showPreloader, setShowPreloader] = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const [arriving, setArriving] = useState(false);
  useGalleryTilt(rootRef, cardRefs);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { (entry.target as HTMLElement).dataset.inView = String(entry.isIntersecting); });
    });
    cardRefs.current.forEach((card) => { if (card) observer.observe(card); });
    return () => observer.disconnect();
  }, []);

  const renderFrame = useCallback((progress: number) => {
    const root = rootRef.current;
    if (!root) return;

    const paletteIndex = Math.max(0, Math.min(covers.length - 1, Math.round(progress)));
    if (paletteIndex !== paletteIndexRef.current) {
      const palette = covers[paletteIndex];
      root.style.setProperty("--bg-from", palette.backgroundFrom);
      root.style.setProperty("--bg-to", palette.backgroundTo);
      root.style.setProperty("--blob", palette.blobColor);
      root.style.setProperty("--accent", palette.accentColor);
      root.style.setProperty("--ink", "#f5f2ed");
      paletteIndexRef.current = paletteIndex;
    }

    const mobile = window.innerWidth < 680;
    const tablet = window.innerWidth < 1024;
    const size = Math.min(window.innerWidth * (mobile ? 0.59 : tablet ? 0.44 : 0.34), mobile ? 348 : tablet ? 435 : 544);
    const frameDelta = progress - lastProgressRef.current;
    movementLeanRef.current += (Math.max(-5.5, Math.min(5.5, -frameDelta * 105)) - movementLeanRef.current) * 0.22;
    lastProgressRef.current = progress;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const relative = index - progress;
      const distance = Math.abs(relative);
      const sign = Math.sign(relative);
      card.style.visibility = distance < 3.25 ? "visible" : "hidden";
      card.dataset.offscreen = String(distance >= 3.25);
      card.style.willChange = distance < 2.6 ? "transform, opacity" : "auto";
      const nearScale = mobile ? 0.73 : tablet ? 0.69 : 0.66;
      const scale = distance <= 1 ? lerp(1, nearScale, distance) : Math.max(0.28, nearScale - (distance - 1) * 0.2);
      const arcHeight = mobile ? 9 : tablet ? 17 : 23;
      const y = distance <= 2
        ? Math.sin(distance * Math.PI / 2) * arcHeight
        : -(distance - 2) * (mobile ? 3 : 6);
      const z = distance <= 1 ? lerp(80, 0, distance) : Math.max(-150, -(distance - 1) * 100);
      const nearAngle = mobile ? 16 : tablet ? 24 : 28;
      const farAngle = mobile
        ? Math.min(42, nearAngle + (distance - 1) * 13)
        : Math.min(58, nearAngle + (distance - 1) * 20);
      const baseRotateY = sign * (distance <= 1 ? lerp(0, -nearAngle, distance) : -farAngle);
      const rotateY = baseRotateY + movementLeanRef.current * (distance < 0.5 ? 0.35 : 1);
      const rotateZ = sign * Math.min(distance * (mobile ? 2.6 : 4.2), mobile ? 5.2 : 8);
      const spacingSteps = mobile
        ? [0.84, 0.68, 0.39, 0.29]
        : tablet
          ? [0.88, 0.715, 0.41, 0.3]
          : [0.91, 0.755, 0.42, 0.31];
      let horizontalDistance = 0;
      let traversed = 0;
      while (traversed < distance) {
        const segment = Math.min(1, distance - traversed);
        horizontalDistance += segment * size * spacingSteps[Math.min(Math.floor(traversed), spacingSteps.length - 1)];
        traversed += segment;
      }
      const x = sign * horizontalDistance;
      const opacity = distance <= 1 ? lerp(1, 0.9, distance) : Math.max(0.16, 0.9 - (distance - 1) * 0.2);
      card.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
      card.style.opacity = `${opacity}`;
      card.style.zIndex = `${100 - Math.round(distance * 10)}`;
      card.style.pointerEvents = distance < 3.25 ? "auto" : "none";
      card.dataset.active = distance < 0.5 ? "true" : "false";
      card.dataset.side = distance < 0.5 ? "active" : relative < 0 ? "left" : "right";
      card.style.setProperty("--edge-shade", `${Math.min(0.22, Math.abs(rotateY) / 150)}`);
    });
  }, []);

  const { activeIndex, goTo, nudge } = useGalleryController(rootRef, covers.length, renderFrame);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("cover");
    const index = covers.findIndex((cover) => cover.id === slug);
    if (index >= 0) {
      goTo(index);
      setArriving(true);
      const timer = window.setTimeout(() => setArriving(false), 1050);
      return () => window.clearTimeout(timer);
    }
  }, [goTo]);

  const openProject = useCallback((index: number) => {
    if (openingIndex !== null) return;
    if (index !== activeIndex) { goTo(index); return; }
    setOpeningIndex(index);
    setOpeningProgress(100);
    setShowPreloader(false);
    setCollapsing(true);
    const href = `/projects/${covers[index].id}`;
    router.prefetch(href);
    window.dispatchEvent(new CustomEvent("portfolio:navigate",{detail:href}));
  }, [activeIndex, goTo, openingIndex, router]);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const open = (event: Event) => {
      const index = (event as CustomEvent<number>).detail;
      openProject(index);
    };
    root.addEventListener("gallery:open", open);
    return () => {
      root.removeEventListener("gallery:open", open);
    };
  }, [openProject]);

  return (
    <main ref={rootRef} id="gallery" className={styles.gallery} data-dragging="false" data-opening={collapsing ? "true" : "false"} data-arriving={arriving ? "true" : "false"}>
      <BackgroundScene activeIndex={activeIndex} />
      <GalleryNavigation />
      <div className={styles.scene} aria-label="Cover art gallery">
        {covers.map((item, index) => (
          <CoverCard key={item.id} item={item} index={index} active={index === activeIndex} positionRef={(node) => { cardRefs.current[index] = node; }} onSelect={() => openProject(index)} loading={openingIndex === index} progress={openingProgress} showProgress={showPreloader} />
        ))}
      </div>
      <CoverInfo item={covers[activeIndex]} total={covers.length} onOpen={() => openProject(activeIndex)} />
      <div className={styles.controls}>
        <button type="button" onClick={() => nudge(-1)} aria-label="Previous cover">←</button>
        <div className={styles.progress} aria-hidden="true"><span style={{ transform: `scaleX(${(activeIndex + 1) / covers.length})` }} /></div>
        <button type="button" onClick={() => nudge(1)} aria-label="Next cover">→</button>
      </div>
    </main>
  );
}
