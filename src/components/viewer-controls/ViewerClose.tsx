"use client";

import styles from "./viewerControls.module.css";

export function ViewerClose({ onClose }: { onClose: () => void }) {
  return <button className={styles.close} type="button" aria-label="Close artwork" onClick={(event) => { event.stopPropagation(); onClose(); }}>
    <span>Close</span><span aria-hidden="true">×</span>
  </button>;
}
