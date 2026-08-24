"use client";

import { useEffect, useState } from "react";
import { covers } from "@/data/covers";
import styles from "./coverGallery.module.css";

type BackdropLayers = { front: number; back: number };

export function BackgroundScene({ activeIndex }: { activeIndex: number }) {
  const [layers, setLayers] = useState<BackdropLayers>({ front: activeIndex, back: activeIndex });

  useEffect(() => {
    setLayers((current) => current.front === activeIndex
      ? current
      : { back: current.front, front: activeIndex });
  }, [activeIndex]);

  return (
    <div className={styles.background} aria-hidden="true">
      <div
        className={`${styles.coverBackdrop} ${styles.backdropBack}`}
        style={{ backgroundImage: `url("${covers[layers.back].image}")` }}
      />
      <div
        key={layers.front}
        className={`${styles.coverBackdrop} ${styles.backdropFront}`}
        style={{ backgroundImage: `url("${covers[layers.front].image}")` }}
      />
      <div className={styles.backdropShade} />
      <div className={styles.cardGlow} />
      <div className={styles.grain} />
    </div>
  );
}
