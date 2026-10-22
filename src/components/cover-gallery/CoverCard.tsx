"use client";

import { PortfolioImage as Image } from "@/components/portfolio-image/PortfolioImage";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { CoverItem } from "@/data/covers";
import styles from "./coverGallery.module.css";

type CoverCardProps = {
  item: CoverItem;
  index: number;
  active: boolean;
  positionRef: (node: HTMLButtonElement | null) => void;
  onSelect: () => void;
  loading: boolean;
  progress: number;
  showProgress: boolean;
};

export function CoverCard({ item, index, active, positionRef, onSelect, loading, progress, showProgress }: CoverCardProps) {
  const [hasImage, setHasImage] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const sync = () => {
      if (active && !document.hidden) void video.play().catch(() => undefined);
      else video.pause();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => { document.removeEventListener("visibilitychange", sync); video.pause(); };
  }, [active]);
  const initialScale = index === 0 ? 1 : Math.max(0.44, 0.68 - (index - 1) * 0.12);
  const initialStyle = {
    transform: `translate3d(calc(-50% + ${index * 31}vw), calc(-50% + ${Math.min(index, 2.5) * 12}px), ${index === 0 ? 80 : Math.max(-150, -(index - 1) * 100)}px) rotateY(${index === 0 ? 0 : index === 1 ? -24 : Math.max(-46, -24 - (index - 1) * 11)}deg) rotateZ(${Math.min(index * 0.65, 1.35)}deg) scale(${initialScale})`,
    opacity: index < 2 ? 1 - index * 0.1 : Math.max(0.28, 0.9 - (index - 1) * 0.23),
    zIndex: 100 - index * 10,
    pointerEvents: index < 2 ? "auto" : "none",
  } as CSSProperties;

  return (
    <button ref={positionRef} type="button" className={styles.cardPosition} data-index={index} data-active={index === 0 ? "true" : "false"} data-side={index === 0 ? "active" : "right"} style={initialStyle} aria-label={`${item.title} by ${item.artist}${active ? ", active cover" : ""}`} aria-current={active ? "true" : undefined} onClick={onSelect}>
      <div className={styles.cardFloat} style={{ "--float-delay": `${index * -0.73}s`, "--float-time": `${5.2 + index * 0.37}s` } as CSSProperties}>
        <div className={styles.cardBody} data-cover-face>
          <div className={styles.sleeveBack} />
          <div className={styles.cardFace}>
            <Image className={`${styles.coverImage} ${hasImage ? styles.coverImageLoaded : ""}`} src={item.image} alt={`${item.title} — ${item.artist}`} fill sizes="(max-width: 679px) 74vw, (max-width: 1023px) 44vw, 34vw" priority={index < 2} draggable="false" onLoad={() => setHasImage(true)} onError={() => setHasImage(false)} />
            {active && item.motion && (
              <video ref={videoRef} className={`${styles.motionCover} ${motionReady ? styles.motionCoverReady : ""}`} src={item.motion} muted loop playsInline preload="metadata" onCanPlay={() => setMotionReady(true)} />
            )}
            <div className={styles.cardShade} />
            <div className={styles.cardShine} />
            <div className={styles.cardSweep} />
            <div className={styles.cardTexture} />
            {loading && (
              <div className={styles.cardLoading} style={{ "--card-progress": progress / 100 } as CSSProperties} aria-label={showProgress ? `Loading project ${progress}%` : "Opening project"}>
                <span className={styles.cardLoadingFill} />
                {showProgress && <strong>{String(progress).padStart(3, "0")}<i>%</i></strong>}
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
