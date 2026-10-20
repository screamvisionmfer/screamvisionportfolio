"use client";

import { useRef, type CSSProperties } from "react";
import { PortfolioImage } from "@/components/portfolio-image/PortfolioImage";
import { cardPacks } from "@/data/card-packs";
import styles from "./cardArchive.module.css";

export function BoosterShelf({ selected, onSelect, onOpen }: { selected: number; onSelect: (index: number) => void; onOpen: () => void }) {
  const drag = useRef({ x: 0, moved: false });
  return <section className={styles.boosterShelf} aria-label="Choose a booster" onPointerDown={(event) => { drag.current = { x: event.clientX, moved: false }; }} onPointerMove={(event) => { if (event.buttons && Math.abs(event.clientX - drag.current.x) > 16) drag.current.moved = true; }} onPointerUp={(event) => {
    const delta = event.clientX - drag.current.x;
    if (drag.current.moved && Math.abs(delta) > 45) onSelect(Math.max(0, Math.min(cardPacks.length - 1, selected + (delta < 0 ? 1 : -1))));
  }}>
    <div className={styles.shelfTrack}>
      {cardPacks.map((pack, index) => <button key={pack.id} className={styles.shelfPack} data-selected={selected === index} aria-label={selected === index ? `Open ${pack.title} booster` : `Select ${pack.title} booster`} aria-pressed={selected === index}
        style={{ "--offset": index - selected, "--slot": index - (cardPacks.length - 1) / 2, "--foil-accent": pack.accent } as CSSProperties}
        onClick={(event) => { if (event.detail && drag.current.moved) return; if (selected === index) onOpen(); else onSelect(index); }}
        onPointerMove={(event) => {
          if (event.buttons || event.pointerType === "touch") return;
          const rect = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty("--tilt", `${(event.clientX - rect.left) / rect.width * 12 - 6}deg`);
        }} onPointerLeave={(event) => event.currentTarget.style.setProperty("--tilt", "0deg")}>
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
