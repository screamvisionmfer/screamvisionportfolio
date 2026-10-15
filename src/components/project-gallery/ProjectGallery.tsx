"use client";

import { PortfolioImage as Image, mediaSource } from "@/components/portfolio-image/PortfolioImage";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { CSSProperties, PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { CoverProject, ProjectAsset, projects } from "@/data/projects";
import { SiteNav } from "@/components/site-nav/SiteNav";
import styles from "./projectGallery.module.css";

const formatTime = (value: number) => {
  if (!Number.isFinite(value)) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

function VideoAsset({ asset, active, poster }: { asset: ProjectAsset; active: boolean; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasAudio, setHasAudio] = useState(asset.hasAudio !== false);

  const detectAudio = (video: HTMLVideoElement) => {
    if (asset.hasAudio === false) {
      setHasAudio(false);
      return;
    }
    const media = video as HTMLVideoElement & { mozHasAudio?: boolean; audioTracks?: { length: number } };
    if (typeof media.mozHasAudio === "boolean") setHasAudio(media.mozHasAudio);
    else if (media.audioTracks) setHasAudio(media.audioTracks.length > 0);
    else setHasAudio(true);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Number.isFinite(video.duration)) setDuration(video.duration);
    const sync = () => {
      if (active && !document.hidden) void video.play().catch(() => undefined);
      else video.pause();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => { document.removeEventListener("visibilitychange", sync); video.pause(); };
  }, [active]);

  const seek = (value: number) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = value;
    setCurrent(value);
  };

  return (
    <>
      <video
        ref={videoRef}
        src={asset.src}
        poster={mediaSource(poster)}
        muted={muted}
        loop
        playsInline
        preload={active ? "auto" : "none"}
        onLoadedMetadata={(event) => { setDuration(event.currentTarget.duration); detectAudio(event.currentTarget); }}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
      />
      <div className={styles.videoControls} data-visible={active} data-has-audio={hasAudio} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
        {hasAudio && (
          <button className={styles.soundToggle} type="button" data-muted={muted} onClick={() => setMuted((value) => !value)} aria-label={muted ? "Turn sound on" : "Mute video"}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16 9.3c1.4 1.5 1.4 3.9 0 5.4M18.5 7c2.8 2.8 2.8 7.2 0 10" /></svg>
          </button>
        )}
        <input aria-label="Video timeline" type="range" min="0" max={duration || 1} step="0.01" value={Math.min(current, duration || 1)} onChange={(event) => seek(Number(event.target.value))} style={{ "--video-progress": `${duration ? current / duration * 100 : 0}%` } as CSSProperties} />
        <span>{formatTime(current)} / {formatTime(duration)}</span>
      </div>
    </>
  );
}

export function ProjectGallery({ project }: { project: CoverProject }) {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const infoRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const dragStart = useRef(0);
  const dragStartY = useRef(0);
  const dragActive = useRef(false);
  const dragMoved = useRef(false);
  const pendingAsset = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [trackX, setTrackX] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<"default" | "next" | "previous" | "back">("default");
  const [arrivalDirection, setArrivalDirection] = useState<"default" | "next" | "previous">("default");
  const [zoomed, setZoomed] = useState<number | null>(null);
  const [zoomClosing, setZoomClosing] = useState(false);
  const count = project.assets.length;
  const projectIndex = projects.findIndex((item) => item.slug === project.slug);
  const previousProject = projects[(projectIndex - 1 + projects.length) % projects.length];
  const nextProject = projects[(projectIndex + 1) % projects.length];
  const zoomedAsset = zoomed === null ? null : project.assets[zoomed];

  const closeZoom = useCallback(() => {
    if (zoomed === null || zoomClosing) return;
    setZoomClosing(true);
    window.setTimeout(() => {
      setZoomed(null);
      setZoomClosing(false);
    }, 480);
  }, [zoomClosing, zoomed]);

  const measure = useCallback(() => {
    const slide = slideRefs.current[active];
    const viewport = viewportRef.current;
    if (!slide || !viewport) return;
    setTrackX(viewport.clientWidth / 2 - (slide.offsetLeft + slide.offsetWidth / 2));
  }, [active]);

  useEffect(() => {
    setActive(0);
    setLeaving(false);
    setTransitionDirection("default");
    setZoomed(null);
    const storedDirection = window.sessionStorage.getItem("project-slide-direction");
    setArrivalDirection(storedDirection === "next" || storedDirection === "previous" ? storedDirection : "default");
    window.sessionStorage.removeItem("project-slide-direction");
    window.sessionStorage.setItem(`project-ready:${project.slug}`, "true");
  }, [project.slug]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeZoom();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [closeZoom]);

  useEffect(() => {
    measure();
    const timer = window.setTimeout(measure, 180);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const move = useCallback((direction: number) => {
    setActive((value) => Math.max(0, Math.min(count - 1, value + direction)));
  }, [count]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let wheelLock = false;
    const onWheel = (event: WheelEvent) => {
      if (window.innerWidth <= 820 && Math.abs(event.deltaY) >= Math.abs(event.deltaX)) return;
      event.preventDefault();
      if (wheelLock) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 8) return;
      wheelLock = true;
      move(delta > 0 ? 1 : -1);
      window.setTimeout(() => { wheelLock = false; }, 620);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") move(1);
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") move(-1);
    };
    const wheelGalleryEnabled = window.innerWidth > 820;
    if (wheelGalleryEnabled) viewport.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      if (wheelGalleryEnabled) viewport.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [move]);

  const navigate = (href: string, direction: "next" | "previous" | "back") => {
    if (leaving) return;
    setTransitionDirection(direction);
    setLeaving(true);
    if (direction === "next" || direction === "previous") window.sessionStorage.setItem("project-slide-direction", direction);
    window.setTimeout(() => router.push(href), direction === "back" ? 920 : 820);
  };

  const openAsset = (index: number) => {
    if (dragMoved.current) {
      dragMoved.current = false;
      return;
    }
    setActive(index);
    setZoomClosing(false);
    setZoomed(index);
  };

  const pointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button, input, a")) return;
    const media = (event.target as HTMLElement).closest<HTMLElement>("[data-asset-index]");
    pendingAsset.current = media ? Number(media.dataset.assetIndex) : null;
    dragStart.current = event.clientX;
    dragStartY.current = event.clientY;
    dragMoved.current = false;
    dragActive.current = true;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragActive.current) return;
    const distanceX = event.clientX - dragStart.current;
    const distanceY = event.clientY - dragStartY.current;
    if (Math.abs(distanceY) > Math.abs(distanceX) && Math.abs(distanceY) > 8) return;
    if (Math.abs(distanceX) > 7) dragMoved.current = true;
    setDragX(distanceX);
  };
  const pointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragActive.current) return;
    const distance = event.clientX - dragStart.current;
    dragActive.current = false;
    setDragging(false);
    setDragX(0);
    if (Math.abs(distance) > 55) move(distance < 0 ? 1 : -1);
    else if (Math.abs(distance) < 9 && pendingAsset.current !== null) {
      if (pendingAsset.current === active) openAsset(pendingAsset.current);
      else setActive(pendingAsset.current);
    }
    pendingAsset.current = null;
  };

  const pointerCancel = () => {
    dragActive.current = false;
    setDragging(false);
    setDragX(0);
    pendingAsset.current = null;
    dragMoved.current = false;
  };

  const tiltInfo = (event: ReactPointerEvent<HTMLElement>) => {
    const panel = infoRef.current;
    if (!panel || window.matchMedia("(pointer: coarse)").matches) return;
    const bounds = panel.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    panel.style.setProperty("--info-rx", `${-y * 3.5}deg`);
    panel.style.setProperty("--info-ry", `${x * 5}deg`);
  };

  const resetInfoTilt = () => {
    infoRef.current?.style.setProperty("--info-rx", "0deg");
    infoRef.current?.style.setProperty("--info-ry", "0deg");
  };

  return (
    <main ref={rootRef} className={styles.project} style={{ "--accent": project.accent, "--cover": `url("${mediaSource(project.cover)}")` } as CSSProperties} data-dragging={dragging} data-leaving={leaving} data-direction={transitionDirection} data-arrival={arrivalDirection}>
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <button type="button" className={styles.back} onClick={() => navigate(`/?cover=${project.slug}`, "back")}>← Back to covers</button>

      <aside ref={infoRef} className={styles.infoPanel} onPointerMove={tiltInfo} onPointerLeave={resetInfoTilt}>
        <div className={styles.identity}>
          <p>Selected project · {String(projectIndex + 1).padStart(2, "0")}</p>
          <span className={styles.artistLabel}>Artist</span>
          <strong className={styles.artist}>{project.artist}</strong>
          <h1>{project.title}</h1>
        </div>
        <dl className={styles.meta}>
          <div><dt>Year</dt><dd>{project.year}</dd></div>
          <div><dt>Services</dt><dd>{project.services.join(" / ")}</dd></div>
          <div><dt>Tools</dt><dd>{project.tools.join(" / ")}</dd></div>
          <div><dt>Materials</dt><dd>{String(project.assets.length).padStart(2, "0")}</dd></div>
        </dl>
      </aside>

      <SiteNav />
      <span className={styles.assetCounter}>{String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>

      <section ref={viewportRef} className={styles.viewport} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerCancel}>
        <div className={styles.track} style={{ transform: `translate3d(${trackX + dragX}px, 0, 0)` }}>
          {project.assets.map((asset, index) => (
            <article key={`${asset.type}-${asset.src}`} ref={(node) => { slideRefs.current[index] = node; }} className={`${styles.slide} ${asset.type === "canvas" ? styles.canvasSlide : ""}`} data-active={index === active}>
              <div className={styles.media} data-asset-index={index} role="button" tabIndex={0} aria-label={`Open ${asset.label}`} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") openAsset(index); }}>
                {asset.type === "motion" || asset.type === "canvas"
                  ? <VideoAsset asset={asset} active={index === active && zoomed === null} poster={project.cover} />
                  : <Image src={asset.src} alt={`${project.title} — ${asset.label}`} fill sizes="(max-width: 700px) 78vw, 52vw" priority={index === 0} draggable="false" unoptimized />}
              </div>
              <div className={styles.caption}><span>{String(index + 1).padStart(2, "0")}</span><strong>{asset.label}</strong><span>{asset.type}</span></div>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.progress}><span style={{ transform: `scaleX(${(active + 1) / count})` }} /></div>
        <div className={styles.actions}><button onClick={() => move(-1)} disabled={active === 0}>←</button><button onClick={() => move(1)} disabled={active === count - 1}>→</button></div>
      </footer>

      <div className={styles.projectSwitchers}>
        <button type="button" className={styles.previousProject} onClick={() => navigate(`/projects/${previousProject.slug}`, "previous")}>
          <i>←</i><span>Previous project</span><strong>{previousProject.title}</strong>
        </button>
        <button type="button" className={styles.nextProject} onClick={() => navigate(`/projects/${nextProject.slug}`, "next")}>
          <span>Next project</span><strong>{nextProject.title}</strong><i>→</i>
        </button>
      </div>

      {zoomedAsset && createPortal(
        <div className={styles.zoomOverlay} data-closing={zoomClosing} onPointerDown={(event) => event.stopPropagation()} onClick={closeZoom}>
          <button type="button" className={styles.zoomClose} onClick={(event) => { event.stopPropagation(); closeZoom(); }}>Close ×</button>
          <div className={`${styles.zoomMedia} ${zoomedAsset.type === "canvas" ? styles.zoomCanvas : ""}`} onClick={(event) => event.stopPropagation()}>
            {zoomedAsset.type === "motion" || zoomedAsset.type === "canvas"
              ? <VideoAsset asset={zoomedAsset} active poster={project.cover} />
              : <Image src={zoomedAsset.src} alt={`${project.title} — ${zoomedAsset.label}`} fill sizes="94vw" draggable="false" unoptimized />}
          </div>
          <div className={styles.zoomCaption}><span>{zoomedAsset.label}</span><span>Click outside or press Esc to close</span></div>
        </div>,
        document.body,
      )}
    </main>
  );
}
