"use client";

import { useRef, type CSSProperties } from "react";
import { PortfolioImage } from "@/components/portfolio-image/PortfolioImage";
import { cardPacks } from "@/data/card-packs";
import { haptic } from "@/components/haptics/haptics";
import styles from "./cardArchive.module.css";

export function BoosterShelf({ selected, onSelect, onOpen }: { selected: number; onSelect: (index: number) => void; onOpen: () => void }) {
  const drag = useRef({ x: 0, time: 0, moved: false });
  return <section className={styles.boosterShelf} aria-label="Choose a booster" onPointerDown={(event) => { drag.current = { x: event.clientX, time: event.timeStamp, moved: false }; }} onPointerMove={(event) => { if (event.buttons && Math.abs(event.clientX - drag.current.x) > 16) drag.current.moved = true; }} onPointerUp={(event) => {
    const delta = event.clientX - drag.current.x;
    if (drag.current.moved && Math.abs(delta) > 45) {
      const next = Math.max(0, Math.min(cardPacks.length - 1, selected + (delta < 0 ? 1 : -1)));
      if (next !== selected) { haptic("tick", Math.abs(delta) / Math.max(16,event.timeStamp-drag.current.time));onSelect(next); }
    }
  }}>
    <div className={styles.shelfTrack}>
      {cardPacks.map((pack, index) => <button key={pack.id} className={styles.shelfPack} data-selected={selected === index} aria-label={selected === index ? `Open ${pack.title} booster` : `Select ${pack.title} booster`} aria-pressed={selected === index}
        style={{ "--offset": index - selected, "--slot": index - (cardPacks.length - 1) / 2, "--foil-accent": pack.accent } as CSSProperties}
        onClick={(event) => { if (event.detail && drag.current.moved) return; if (selected === index) onOpen(); else onSelect(index); }}
        onPointerMove={(event) => {
          if (event.buttons || event.pointerType === "touch") return;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
          const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
          const style = event.currentTarget.style;
          style.setProperty("--tilt-x", `${-y * 13}deg`);
          style.setProperty("--tilt-y", `${x * 17}deg`);
          style.setProperty("--shine-x", `${50 + x * 45}%`);
          style.setProperty("--shine-y", `${50 + y * 45}%`);
          event.currentTarget.dataset.hovered = "true";
        }} onPointerLeave={(event) => {
          event.currentTarget.style.setProperty("--tilt-x", "0deg");
          event.currentTarget.style.setProperty("--tilt-y", "0deg");
          event.currentTarget.dataset.hovered = "false";
        }}>
        <span className={styles.wrapper}>
          <span className={styles.wrapperArt}><PortfolioImage src={pack.artwork} alt={`${pack.subtitle} booster artwork`} fill sizes="(max-width: 600px) 220px, 340px" priority /></span>
          <span className={styles.wrapperTop} /><span className={styles.wrapperBottom} />
          <span className={styles.wrapperReflection} /><span className={styles.wrapperSpine} />
        </span>
        <span className={styles.shelfCaption}><b>{pack.title}</b><span>{pack.cards.length} cards <i>↗</i></span></span>
      </button>)}
    </div>
    <div className={styles.shelfHint}><span>Choose your world</span><i /> Drag to select · Click to unseal</div>
  </section>;
}
