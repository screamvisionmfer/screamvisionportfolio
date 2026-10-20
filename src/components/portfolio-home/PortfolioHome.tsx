"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PortfolioImage, mediaSource } from "@/components/portfolio-image/PortfolioImage";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { covers } from "@/data/covers";
import { illustrations } from "@/data/illustrations";
import { collaborations } from "@/data/collaborations";
import { cardPacks } from "@/data/card-packs";
import { useArtScene } from "./useArtScene";
import styles from "./portfolioHome.module.css";

const pack = cardPacks[0];
const worlds = [
  { title: "Covers", href: "/covers", count: covers.length, unit: "releases", accent: "#ed784a", format: "square", images: [covers[0].image, covers[3].image, covers[1].image], titles: [covers[0].title, covers[3].title, covers[1].title] },
  { title: "Illustrations", href: "/illustrations", count: illustrations.length, unit: "artworks", accent: "#badd63", format: "square", images: [illustrations[26].image, illustrations[37].image, illustrations[21].image], titles: [illustrations[26].title, illustrations[37].title, illustrations[21].title] },
  { title: "Cards", href: "/cards", count: pack.cards.length, unit: "cards", accent: pack.accent, format: "portrait", images: [pack.cards[0].image, pack.cards[5].image, pack.cards[6].image], titles: [pack.cards[0].title, pack.cards[5].title, pack.cards[6].title] },
  { title: "Collaborations", href: "/collaborations", count: collaborations.length, unit: "projects", accent: "#73cbd1", format: "square", images: [collaborations[1].hero, collaborations[0].assets[4].src, collaborations[1].assets[3].src], titles: [collaborations[1].title, "Brick by brick", "Amigo"] },
];
const artworks = [0, 1, 2].flatMap((imageIndex) => [1, 0, 2, 3].map((worldIndex) => ({
  worldIndex, image: worlds[worldIndex].images[imageIndex], title: worlds[worldIndex].titles[imageIndex],
})));

export function PortfolioHome() {
  const stage = useRef<HTMLDivElement>(null);
  const { active, goTo, nudge } = useArtScene(stage, artworks.length);
  const [leaving, setLeaving] = useState(false);
  const navigation = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const artwork = artworks[active];
  const world = worlds[artwork.worldIndex];

  useEffect(() => {
    const cover = new URLSearchParams(window.location.search).get("cover");
    if (cover && covers.some((item) => item.id === cover)) router.replace(`/covers?cover=${encodeURIComponent(cover)}`);
    return () => { if (navigation.current) clearTimeout(navigation.current); };
  }, [router]);

  const enter = (index: number) => {
    if (leaving) return;
    if (index !== active) { goTo(index); return; }
    const href = worlds[artworks[index].worldIndex].href;
    setLeaving(true); router.prefetch(href);
    navigation.current = setTimeout(() => router.push(href), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 320);
  };
  const chooseWorld = (worldIndex: number) => {
    const closest = artworks.reduce((best, item, index) => {
      if (item.worldIndex !== worldIndex) return best;
      const distance = Math.min(Math.abs(index - active), artworks.length - Math.abs(index - active));
      return distance < best.distance ? { index, distance } : best;
    }, { index: active, distance: Infinity });
    goTo(closest.index);
  };

  return <main className={styles.home} data-leaving={leaving} style={{ "--world-accent": world.accent } as CSSProperties}>
    <h1 className={styles.srOnly}>SCREAM VISION — Digital art, cover artwork and collectible worlds</h1>
    <SiteNav />
    <div className={styles.atmosphere} aria-hidden="true" />
    <div className={styles.wordmark} aria-hidden="true"><span>SCREAM</span><span>VISION</span></div>
    <div className={styles.floor} aria-hidden="true" />
    <div className={styles.texture} aria-hidden="true" />
    <div className={styles.hud}>
      <span><i /> Selected works</span>
      <span className={styles.desktopHint}>Drag / Scroll to explore</span><span className={styles.mobileHint}>Swipe to explore</span>
      <span className={styles.counter}>{String(active + 1).padStart(2, "0")} <small>/ {artworks.length}</small></span>
    </div>
    <div className={styles.stage} ref={stage} tabIndex={0} role="region" aria-label="Interactive portfolio gallery" data-dragging="false" data-animation-active="false">
      <div className={styles.camera}>
        {artworks.map((item, index) => {
          const section = worlds[item.worldIndex];
          return <button key={item.image} type="button" className={styles.panel} data-art-panel={index} data-format={section.format} data-focused={index === 0} aria-current={active === index ? "true" : undefined} aria-label={`${active === index ? "Enter" : "Focus"} ${section.title}: ${item.title}`} onClick={() => enter(index)}>
            <span className={styles.artFace}>
              <span className={styles.edge} />
              <span className={styles.picture}><PortfolioImage src={mediaSource(item.image)} alt={item.title} fill sizes="450px" priority={index === 0} draggable={false} /><span className={styles.reflection} /></span>
              <span className={styles.artIndex}>{String(index + 1).padStart(2, "0")} / {section.title}</span>
            </span>
          </button>;
        })}
      </div>
    </div>
    <div className={styles.vignette} aria-hidden="true" />
    <div className={styles.focusInfo} aria-live="polite">
      <p>{artwork.title}</p>
      <Link href={world.href} className={styles.focusTitle} data-long={world.title.length > 10}>{world.title}<span aria-hidden="true">↗</span></Link>
      <span>{String(world.count).padStart(2, "0")} {world.unit} <i /> Enter collection</span>
    </div>
    <div className={styles.controls}><button type="button" onClick={() => nudge(-1)} aria-label="Previous artwork">←</button><button type="button" onClick={() => nudge(1)} aria-label="Next artwork">→</button></div>
    <nav className={styles.worlds} aria-label="Portfolio worlds">
      {worlds.map((item, index) => <button key={item.href} type="button" aria-label={`Show ${item.title}`} aria-pressed={artwork.worldIndex === index} onClick={() => chooseWorld(index)}><small>0{index + 1}</small><span>{item.title}</span></button>)}
    </nav>
    <Link href="/contacts" className={styles.contact}>Let’s work together <span aria-hidden="true">↗</span></Link>
  </main>;
}
