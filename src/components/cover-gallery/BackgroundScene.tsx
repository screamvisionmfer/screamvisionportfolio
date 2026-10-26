"use client";

import { useEffect, useState } from "react";
import { type CoverItem } from "@/data/covers";
import { mediaSource } from "@/components/portfolio-image/PortfolioImage";
import styles from "./coverGallery.module.css";

type BackdropLayers = { front: number; back: number };

export function BackgroundScene({ activeIndex, items: covers }: { activeIndex: number;items:CoverItem[] }) {
  const [layers, setLayers] = useState<BackdropLayers>({ front: activeIndex, back: activeIndex });

  useEffect(() => {
    let cancelled = false;
    const image = new window.Image();
    image.src = mediaSource(covers[activeIndex].image);
    // Retain the visible backdrop until its replacement is decoded.
    image.decode().then(() => {
      if (!cancelled) setLayers((current) => current.front === activeIndex
        ? current
        : { back: current.front, front: activeIndex });
    }).catch(() => { /* Keep the last successfully loaded background. */ });
    return () => { cancelled = true; };
  }, [activeIndex,covers]);

  return (
    <div className={styles.background} aria-hidden="true">
      <div
        className={`${styles.coverBackdrop} ${styles.backdropBack}`}
        style={{ backgroundImage: `url("${mediaSource(covers[layers.back].image)}")` }}
      />
      <div
        key={layers.front}
        className={`${styles.coverBackdrop} ${styles.backdropFront}`}
        style={{ backgroundImage: `url("${mediaSource(covers[layers.front].image)}")` }}
      />
      <div className={styles.backdropShade} />
      <div className={styles.cardGlow} />
      <div className={styles.grain} />
    </div>
  );
}
