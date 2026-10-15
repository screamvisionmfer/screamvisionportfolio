"use client";

import { PortfolioImage as Image } from "@/components/portfolio-image/PortfolioImage";
import { createPortal } from "react-dom";
import { CSSProperties, PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState, WheelEvent as ReactWheelEvent } from "react";
import type { Collaboration } from "@/data/collaborations";
import { FullscreenButton } from "@/components/fullscreen-button/FullscreenButton";
import { CollaborationNav } from "./CollaborationNav";
import styles from "./collaborations.module.css";

type CollabAsset = Collaboration["assets"][number];

function CollabMedia({ asset, priority = false, preview = false, suspended = false }: { asset: CollabAsset; priority?: boolean; preview?: boolean; suspended?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let visible = preview;
    const sync = () => {
      if (visible && !suspended && !document.hidden) void video.play().catch(() => undefined);
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: .12 });
    observer.observe(video);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); video.pause(); };
  }, [preview, suspended]);

  if (asset.kind === "video") return <video ref={videoRef} src={asset.src} muted loop playsInline preload="metadata" />;
  return <Image src={asset.src} alt={asset.label} fill sizes={preview ? "92vw" : "(max-width: 760px) 84vw, 36vw"} priority={priority} draggable="false" unoptimized />;
}

export function CollaborationCase({ collaboration }: { collaboration: Collaboration }) {
  const viewportRef = useRef<HTMLElement>(null);
  const wheelLockRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const gesture = useRef({ x: 0, y: 0, moved: false, active: false });
  const galleryGesture = useRef({ x: 0, scroll: 0, moved: false, active: false });
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);
  const [previewClosing, setPreviewClosing] = useState(false);

  const switchPreview = useCallback((direction: number) => {
    setPreview((value) => value === null ? 0 : (value + direction + collaboration.assets.length) % collaboration.assets.length);
  }, [collaboration.assets.length]);

  const closePreview = useCallback(() => {
    if (preview === null || previewClosing) return;
    setPreviewClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setPreview(null);
      setPreviewClosing(false);
      closeTimerRef.current = null;
    }, 480);
  }, [preview, previewClosing]);

  const move = useCallback((direction: number) => {
    const next = Math.max(0, Math.min(collaboration.assets.length - 1, active + direction));
    viewportRef.current?.querySelector<HTMLElement>(`[data-asset-index="${next}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    setActive(next);
  }, [active, collaboration.assets.length]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let locked = false;
    let timer = 0;
    const onWheel = (event: WheelEvent) => {
      if (window.matchMedia("(max-width: 760px)").matches || preview !== null) return;
      event.preventDefault();
      if (locked) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 8) return;
      locked = true;
      move(delta > 0 ? 1 : -1);
      timer = window.setTimeout(() => { locked = false; }, 620);
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      viewport.removeEventListener("wheel", onWheel);
      window.clearTimeout(timer);
    };
  }, [move, preview]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreview();
      if (event.key === "ArrowLeft") {
        if (preview === null) move(-1);
        else switchPreview(-1);
      }
      if (event.key === "ArrowRight") {
        if (preview === null) move(1);
        else switchPreview(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [closePreview, move, preview, switchPreview]);

  useEffect(() => () => {
    if (wheelLockRef.current !== null) window.clearTimeout(wheelLockRef.current);
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
  }, []);

  const syncActive = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const bounds = viewport.getBoundingClientRect();
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const center = mobile ? bounds.top + bounds.height / 2 : bounds.left + bounds.width / 2;
    let closest = active;
    let distance = Number.POSITIVE_INFINITY;
    Array.from(viewport.querySelectorAll<HTMLElement>("[data-asset-index]")).forEach((asset, index) => {
      const rect = asset.getBoundingClientRect();
      const nextDistance = Math.abs((mobile ? rect.top + rect.height / 2 : rect.left + rect.width / 2) - center);
      if (nextDistance < distance) { distance = nextDistance; closest = index; }
    });
    if (closest !== active) setActive(closest);
  };

  const galleryPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (window.matchMedia("(max-width: 760px)").matches) return;
    const viewport = event.currentTarget;
    galleryGesture.current = { x: event.clientX, scroll: viewport.scrollLeft, moved: false, active: true };
  };
  const galleryPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!galleryGesture.current.active) return;
    const dx = event.clientX - galleryGesture.current.x;
    if (Math.abs(dx) > 6 && !galleryGesture.current.moved) {
      galleryGesture.current.moved = true;
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = "true";
    }
    if (!galleryGesture.current.moved) return;
    event.currentTarget.scrollLeft = galleryGesture.current.scroll - dx;
  };
  const galleryPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (!galleryGesture.current.active) return;
    galleryGesture.current.active = false;
    event.currentTarget.dataset.dragging = "false";
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    syncActive();
  };

  const previewWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (previewClosing) return;
    if (wheelLockRef.current !== null) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(delta) < 12) return;
    switchPreview(delta > 0 ? 1 : -1);
    wheelLockRef.current = window.setTimeout(() => { wheelLockRef.current = null; }, 430);
  };

  const previewPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (previewClosing) return;
    if ((event.target as HTMLElement).closest("button")) return;
    event.preventDefault();
    gesture.current = { x: event.clientX, y: event.clientY, moved: false, active: true };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = "true";
  };
  const previewPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!gesture.current.active) return;
    const dx = event.clientX - gesture.current.x;
    const dy = event.clientY - gesture.current.y;
    if (Math.hypot(dx, dy) > 7) gesture.current.moved = true;
    event.currentTarget.style.setProperty("--preview-drag-x", `${dx}px`);
  };
  const previewPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!gesture.current.active) return;
    const dx = event.clientX - gesture.current.x;
    gesture.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = "false";
    event.currentTarget.style.setProperty("--preview-drag-x", "0px");
    if (Math.abs(dx) > 55) switchPreview(dx < 0 ? 1 : -1);
  };

  return (
    <main className={styles.casePage} style={{ "--case-accent": collaboration.accent } as CSSProperties}>
      <CollaborationNav detail />
      <aside className={styles.caseInfo}>
        <span className={styles.eyebrow}>SCREAM VISION × {collaboration.partner}</span>
        <h1>{collaboration.title}</h1>
        <dl><div><dt>Year</dt><dd>{collaboration.year}</dd></div><div><dt>Role</dt><dd>{collaboration.role.join(" / ")}</dd></div><div><dt>Archive</dt><dd>{String(collaboration.assets.length).padStart(2, "0")} artworks</dd></div></dl>
        {collaboration.externalUrl && <a className={styles.magicButton} href={collaboration.externalUrl} target="_blank" rel="noreferrer"><span>View on Magic Eden</span><i>↗</i></a>}
      </aside>

      <section ref={viewportRef} className={styles.caseViewport} onScroll={syncActive} onPointerDown={galleryPointerDown} onPointerMove={galleryPointerMove} onPointerUp={galleryPointerUp} onPointerCancel={galleryPointerUp} aria-label={`${collaboration.title} artwork gallery`}>
        <div className={styles.assetGrid}>
          {collaboration.assets.map((asset, index) => (
            <article key={asset.src} className={`${styles.asset} ${asset.kind === "video" ? styles.motionAsset : ""}`} data-asset-index={index} data-active={index === active}>
              <button type="button" onClick={() => { if (galleryGesture.current.moved) return; setActive(index); setPreview(index); }} aria-label={`Open ${asset.label}`}><CollabMedia asset={asset} priority={index < 2} suspended={preview !== null} /></button>
              <p><span>{String(index + 1).padStart(2, "0")}</span><strong>{asset.label}</strong><span>{asset.kind}</span></p>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.caseFooter}>
        <div><span style={{ transform: `scaleX(${(active + 1) / collaboration.assets.length})` }} /></div>
        <p>{String(active + 1).padStart(2, "0")} / {String(collaboration.assets.length).padStart(2, "0")}</p>
        <button onClick={() => move(-1)} disabled={active === 0}>←</button><button onClick={() => move(1)} disabled={active === collaboration.assets.length - 1}>→</button>
      </footer>
      <FullscreenButton />

      {preview !== null && createPortal(
        <div className={styles.assetPreview} data-closing={previewClosing} onWheel={previewWheel} onPointerDown={previewPointerDown} onPointerMove={previewPointerMove} onPointerUp={previewPointerUp} onPointerCancel={previewPointerUp} onClick={() => { if (!gesture.current.moved) closePreview(); }}>
          <button className={styles.previewClose} type="button" onClick={(event) => { event.stopPropagation(); closePreview(); }}>Close ×</button>
          <div className={styles.previewAsset} key={collaboration.assets[preview].src} onClick={(event) => event.stopPropagation()}><CollabMedia asset={collaboration.assets[preview]} preview /></div>
          <div className={styles.previewMeta}><span>{collaboration.assets[preview].label}</span><span>{String(preview + 1).padStart(2, "0")} / {String(collaboration.assets.length).padStart(2, "0")} · Scroll or drag to browse</span></div>
        </div>,
        document.body,
      )}
    </main>
  );
}
