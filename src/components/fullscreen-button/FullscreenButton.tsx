"use client";

import { useEffect, useState } from "react";
import styles from "./fullscreenButton.module.css";

export function FullscreenButton() {
  const [active, setActive] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(Boolean(document.fullscreenEnabled && document.documentElement.requestFullscreen));
    const sync = () => setActive(Boolean(document.fullscreenElement));
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggle = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { /* The browser may deny fullscreen after a device or window change. */ }
  };

  if (!supported) return null;

  return (
    <button className={styles.button} type="button" onClick={toggle} aria-label={active ? "Exit fullscreen" : "Enter fullscreen"}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={active ? "M9 9H4V4M15 9h5V4M15 15h5v5M9 15H4v5" : "M9 4H4v5M15 4h5v5M20 15v5h-5M9 20H4v-5"} />
      </svg>
    </button>
  );
}
