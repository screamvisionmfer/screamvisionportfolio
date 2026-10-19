"use client";

import { ViewerClose } from "@/components/viewer-controls/ViewerClose";

import dynamic from "next/dynamic";
import { CSSProperties, PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { PortfolioImage, mediaSource } from "@/components/portfolio-image/PortfolioImage";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { cardPacks, type CardPack, type CollectibleCard } from "@/data/card-packs";
import styles from "./cardArchive.module.css";

const BoosterScene = dynamic(() => import("./BoosterScene").then((m) => m.BoosterScene), { ssr: false });
const pad = (n: number) => String(n).padStart(2, "0");
type Mode = "sealed" | "opening" | "collection";

function MarketLink({ url }: { url?: string }) {
  return url ? <a className={styles.market} href={url} target="_blank" rel="noopener noreferrer">Buy on VibeMarket ↗</a>
    : <span className={styles.marketPending}>VibeMarket <i>Link soon ↗</i></span>;
}

export function CardArchive() {
  const [packIndex, setPackIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("sealed");
  const [view, setView] = useState<"rail" | "grid">("rail");
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [active, setActive] = useState(0);
  const [inspect, setInspect] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const [dealing, setDealing] = useState(false);
  const pack = cardPacks[packIndex];
  const gallery = useRef<HTMLDivElement>(null);
  const inspectTrigger = useRef<HTMLButtonElement | null>(null);
  const swipe = useRef({ x: 0, active: false, moved: false });
  const unlocked = mode === "collection";
  const reveal = useCallback(() => {
    setDealing(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setMode("collection"); setView("rail"); setActive(0);
    setSeen(new Set([pack.cards[0]?.id].filter(Boolean)));
  }, [pack]);
  useEffect(() => {
    if (!dealing) return;
    const timer = setTimeout(() => setDealing(false), 1350);
    return () => clearTimeout(timer);
  }, [dealing]);
  const unavailable = useCallback(() => { setFallback(true); setReady(true); }, []);
  useEffect(() => {
    if (mode !== "opening" || !fallback) return;
    const timer = setTimeout(reveal, 650);
    return () => clearTimeout(timer);
  }, [fallback, mode, reveal]);
  useEffect(() => {
    if (mode !== "opening" || ready) return;
    const watchdog = setTimeout(unavailable, 8000);
    return () => clearTimeout(watchdog);
  }, [mode, ready, unavailable]);
  useEffect(() => {
    if (unlocked) setSeen((old) => new Set([...old, pack.cards[active].id]));
  }, [active, pack, unlocked]);
  useEffect(() => { if (unlocked) gallery.current?.focus({ preventScroll: true }); }, [unlocked]);
  useEffect(() => { gallery.current?.scrollTo({ top: 0, left: 0 }); }, [view, unlocked]);
  const open = () => {
    if (mode !== "sealed") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) reveal();
    else setMode("opening");
  };
  const change = useCallback((direction: number) => {
    setActive((value) => (value + direction + pack.cards.length) % pack.cards.length);
  }, [pack.cards.length]);
  const reset = () => { setMode("sealed"); setInspect(null); setDealing(false); setReady(false); setFallback(false); setSeen(new Set()); swipe.current.moved = false; };
  const inspectCard = (index: number, trigger: HTMLButtonElement) => {
    if (swipe.current.moved) return;
    setActive(index); setInspect(index); inspectTrigger.current = trigger;
  };
  useEffect(() => {
    const node = gallery.current;
    if (!node || !unlocked || dealing || view !== "rail" || inspect !== null) return;
    let last = 0;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 8 || performance.now() - last < 330) return;
      last = performance.now(); change(delta > 0 ? 1 : -1);
    };
    node.addEventListener("wheel", wheel, { passive: false });
    return () => node.removeEventListener("wheel", wheel);
  }, [change, dealing, inspect, unlocked, view]);
  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (view !== "rail" || dealing || event.button !== 0) return;
    swipe.current = { x: event.clientX, active: true, moved: false };
  };
  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!swipe.current.active) return;
    if (Math.abs(event.clientX - swipe.current.x) > 10) {
      swipe.current.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.style.setProperty("--drag", `${(event.clientX - swipe.current.x) * .4}px`);
    }
  };
  const pointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!swipe.current.active) return;
    const dx = event.clientX - swipe.current.x;
    swipe.current.active = false;
    event.currentTarget.style.setProperty("--drag", "0px");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (Math.abs(dx) > 45) change(dx < 0 ? 1 : -1);
  };
  const cancelPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    swipe.current.active = false; swipe.current.moved = false;
    event.currentTarget.style.setProperty("--drag", "0px");
  };
  const slots = Array.from({ length: Math.min(pack.cards.length, 7) }, (_, i) => i - Math.floor(Math.min(pack.cards.length - 1, 6) / 2));
  const currentCard = pack.cards[active];
  return (
    <main className={styles.archive} data-mode={mode} data-view={view} style={{ "--pack-accent": pack.accent } as CSSProperties}>
      <div className={styles.atmosphere} aria-hidden="true" /><div className={styles.grain} aria-hidden="true" />
      <SiteNav />
      <div className={styles.topline}><span><i /> Collectibles / Vibechain</span><span>{pad(packIndex + 1)} — {pad(cardPacks.length)} <b>/{unlocked ? " Unsealed" : " Booster archive"}</b></span></div>
      <div className={styles.ghostTitle} aria-hidden="true">{pack.title}</div>
      {!unlocked && <section className={styles.packStage} aria-label={`${pack.title} booster`}>
        <div className={styles.halo} aria-hidden="true" />
        {!fallback && <BoosterScene key={pack.id} pack={pack} opening={mode === "opening"} onReady={() => setReady(true)} onComplete={reveal} onUnavailable={unavailable} />}
        <div className={styles.fallbackPack} data-visible={!ready || fallback} data-opening={mode === "opening" && fallback} aria-hidden="true"><span /><div><PortfolioImage src={pack.artwork} alt="" fill sizes="300px" priority /></div><span /></div>
        <button className={styles.packHit} aria-label={`Open ${pack.title} booster`} disabled={mode === "opening"} onClick={open} />
        <div className={styles.sealHint} aria-live="polite"><i /><span>{mode === "opening" ? ready ? "Breaking the seal. Your collection awaits." : "Preparing your pack…" : "A whole world. Under one seal."}</span></div>
        {mode === "opening" && <button className={styles.skipOpening} onClick={reveal}>Skip to collection ↗</button>}
      </section>}
      {unlocked && <>
        <aside className={styles.packDock}><button onClick={reset} aria-label="Repack collection"><PortfolioImage src={mediaSource(pack.artwork)} alt={`${pack.title} opened pack`} width={68} height={88} /><span>↶ Repack</span></button><span className={styles.dockLine} /><span>{pad(pack.cards.length)} ARTWORKS</span></aside>
        <div className={styles.viewSwitch} aria-label="Collection layout"><button aria-pressed={view === "rail"} onClick={() => setView("rail")}><span>▥</span> Showcase</button><button aria-pressed={view === "grid"} onClick={() => setView("grid")}><span>▦</span> All cards</button></div>
        <div ref={gallery} className={view === "rail" ? styles.rail : styles.grid} data-dealing={dealing} tabIndex={0} aria-label={view === "rail" ? "Card carousel" : "All cards"} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={cancelPointer} onKeyDown={(event) => {
          swipe.current.moved = false;
          if (dealing || view !== "rail") return;
          if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); change(event.key === "ArrowRight" ? 1 : -1); }
          if (event.key === "Enter" && event.target === event.currentTarget && view === "rail") setInspect(active);
        }}>
          {view === "rail" ? slots.map((offset) => {
            const index = (active + offset + pack.cards.length) % pack.cards.length;
            return <div key={pack.cards[index].id} className={styles.railSlot} data-active={offset === 0} style={{ "--offset": offset, "--distance": Math.abs(offset), "--arrival": `${(offset + Math.floor(slots.length / 2)) * 85}ms` } as CSSProperties}>
              <CardSlab card={pack.cards[index]} index={index} pack={pack} active={offset === 0} onSelect={(button) => { if (swipe.current.moved) return; if (offset !== 0) setActive(index); else inspectCard(index, button); }} />
            </div>;
          }) : pack.cards.map((card, index) => <div className={styles.gridSlot} key={card.id} style={{ "--arrival": `${Math.min(index, 20) * 22}ms` } as CSSProperties}>
            <CardSlab card={card} index={index} pack={pack} active={index === active} onSelect={(button) => { swipe.current.moved = false; inspectCard(index, button); }} />
          </div>)}
        </div>
        {view === "rail" && <div className={styles.railControls}><button disabled={dealing} onClick={() => change(-1)} aria-label="Previous card">←</button><div><span>{pad(active + 1)} <i>/ {pad(pack.cards.length)}</i></span><input disabled={dealing} type="range" min={0} max={pack.cards.length - 1} value={active} aria-label="Choose card" onChange={(event) => setActive(Number(event.target.value))} /></div><button disabled={dealing} onClick={() => change(1)} aria-label="Next card">→</button></div>}
      </>}
      <section className={styles.identity} aria-live="polite"><p>{unlocked ? `${pack.title} / ${view === "rail" ? "Selected card" : "Full collection"}` : pack.edition}</p><h1>{unlocked && view === "rail" ? currentCard.title : pack.title}</h1><span>{unlocked ? `${seen.size} / ${pack.cards.length} explored` : pack.subtitle}</span></section>
      <aside className={styles.actions}>
        {!unlocked ? <button className={styles.openButton} disabled={mode === "opening"} onClick={open}><span>{mode === "opening" ? "Unsealing" : "Break the seal"}</span><i>{mode === "opening" ? "···" : "↗"}</i></button> : <MarketLink url={currentCard.marketUrl ?? pack.marketUrl} />}
        {!unlocked && <span>{pack.cards.length} artworks inside / Click to unpack</span>}
      </aside>
      {cardPacks.length > 1 && !unlocked && <div className={styles.packSelector}>{cardPacks.map((item, index) => <button key={item.id} disabled={mode === "opening"} aria-pressed={index === packIndex} onClick={() => { reset(); setPackIndex(index); }}>{item.title}</button>)}</div>}
      <footer className={styles.footer}><span>SCREAM VISION × {pack.title}</span><span>{unlocked ? view === "rail" ? "Drag / Scroll to browse · Click to inspect" : "Hover to tilt · Click to inspect" : "Original art. Collectible worlds."}</span><span>Card archive / {pad(pack.cards.length)}</span></footer>
      {inspect !== null && <CardInspection pack={pack} index={inspect} onChange={(index) => { setInspect(index); setActive(index); }} onClose={() => { setInspect(null); (inspectTrigger.current?.isConnected ? inspectTrigger.current : gallery.current)?.focus({ preventScroll: true }); }} />}
    </main>
  );
}

function CardSlab({ card, index, pack, active, onSelect }: { card: CollectibleCard; index: number; pack: CardPack; active: boolean; onSelect: (button: HTMLButtonElement) => void }) {
  const tilt = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const move = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.buttons || event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      tilt.current?.style.setProperty("--rx", `${-y * 7}deg`); tilt.current?.style.setProperty("--ry", `${x * 9}deg`);
      tilt.current?.style.setProperty("--shine-x", `${50 + x * 45}%`); tilt.current?.style.setProperty("--shine-y", `${50 + y * 45}%`);
    });
  };
  const reset = () => { cancelAnimationFrame(frame.current); tilt.current?.style.setProperty("--rx", "0deg"); tilt.current?.style.setProperty("--ry", "0deg"); };
  return <button className={styles.cardButton} aria-label={`Inspect ${card.title}`} aria-current={active ? "true" : undefined} onPointerMove={move} onPointerLeave={reset} onBlur={reset} onClick={(event) => onSelect(event.currentTarget)}>
    <span className={styles.slab} ref={tilt}><span className={styles.slabEdge} /><span className={styles.slabFace}>
      <span className={styles.slabLabel}><span><b>SV</b> SCREAM VISION<small>{pack.title} / VIBECHAIN</small></span><strong>#{pad(index + 1)}</strong></span>
      <span className={styles.slabArt}><PortfolioImage src={mediaSource(card.image)} alt={card.title} fill sizes="220px" draggable={false} /></span>
      <span className={styles.slabFoot}><i /><span>ORIGINAL ARTWORK</span><b>✳</b></span><span className={styles.slabShine} /><span className={styles.slabPrism} />
    </span></span>
  </button>;
}

function CardInspection({ pack, index, onChange, onClose }: { pack: CardPack; index: number; onChange: (index: number) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => node?.close(); }, []);
  const card = pack.cards[index];
  const move = (direction: number) => onChange((index + direction + pack.cards.length) % pack.cards.length);
  return <dialog ref={dialog} className={styles.inspection} aria-label={card.title} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={(event) => {
    if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); }
  }}>
    <ViewerClose onClose={onClose} />
    <div className={styles.inspectionArt} key={card.id} onPointerDown={(event) => { if (event.button !== 0) return; gesture.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerUp={(event) => { const start = gesture.current; gesture.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); if (start && Math.abs(event.clientX - start.x) > 45 && Math.abs(event.clientX - start.x) > Math.abs(event.clientY - start.y)) move(event.clientX < start.x ? 1 : -1); }} onPointerCancel={() => { gesture.current = null; }}><PortfolioImage src={card.image} alt={card.title} fill sizes="(max-width: 760px) 94vw, 76vh" priority draggable={false} /></div>
    <div className={styles.inspectionControls}><button aria-label="Previous artwork" onClick={() => move(-1)}>←</button><span aria-live="polite">{card.title}<small>{pad(index + 1)} / {pad(pack.cards.length)}</small></span><button aria-label="Next artwork" onClick={() => move(1)}>→</button></div>
    <div className={styles.inspectionMarket}><MarketLink url={card.marketUrl ?? pack.marketUrl} /></div>
  </dialog>;
}
