"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { PortfolioImage, mediaSource } from "@/components/portfolio-image/PortfolioImage";
import { SiteNav } from "@/components/site-nav/SiteNav";
import { isPageActive } from "@/components/site-nav/pageActivity";
import { covers } from "@/data/covers";
import { illustrations } from "@/data/illustrations";
import { collaborations } from "@/data/collaborations";
import { cardPacks } from "@/data/card-packs";
import styles from "./portfolioHome.module.css";

const pack = cardPacks[0];
const worlds = [
  { title: "Covers", href: "/covers", count: covers.length, unit: "releases", accent: "#ed784a", caption: `${covers[0].title} / ${covers[0].artist}`, format: "square", images: [covers[0].image, covers[3].image, covers[1].image] },
  { title: "Illustrations", href: "/illustrations", count: illustrations.length, unit: "artworks", accent: "#badd63", caption: "Characters, scenes & visual worlds", format: "square", images: [illustrations[26].image, illustrations[37].image, illustrations[21].image] },
  { title: "Cards", href: "/cards", count: pack.cards.length, unit: "cards", accent: pack.accent, caption: `${pack.title} / ${pack.subtitle}`, format: "portrait", images: [pack.cards[0].image, pack.cards[5].image, pack.cards[6].image] },
  { title: "Collaborations", href: "/collaborations", count: collaborations.length, unit: "projects", accent: "#73cbd1", caption: "SCREAM VISION × Jungle Bay", format: "square", images: [collaborations[1].hero, collaborations[0].assets[4].src, collaborations[1].assets[3].src] },
];

export function PortfolioHome() {
  const [active, setActive] = useState(0);
  const composition = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const router = useRouter();
  const world = worlds[active];

  useEffect(() => {
    // Preserve links made before the homepage and Covers became separate pages.
    const cover = new URLSearchParams(window.location.search).get("cover");
    if (cover && covers.some((item) => item.id === cover)) router.replace(`/covers?cover=${encodeURIComponent(cover)}`);
    const timer = window.setTimeout(() => {
      worlds.slice(1).forEach((item) => { const image = new window.Image(); image.src = mediaSource(item.images[0]); });
    }, 900);
    return () => { window.clearTimeout(timer); cancelAnimationFrame(frame.current); };
  }, [router]);

  const move = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType !== "mouse" || !isPageActive() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      composition.current?.style.setProperty("--pointer-x", `${x * 14}px`);
      composition.current?.style.setProperty("--pointer-y", `${y * 12}px`);
      composition.current?.style.setProperty("--pointer-rotate", `${x * 3}deg`);
    });
  };
  const reset = () => {
    cancelAnimationFrame(frame.current);
    composition.current?.style.removeProperty("--pointer-x");
    composition.current?.style.removeProperty("--pointer-y");
    composition.current?.style.removeProperty("--pointer-rotate");
  };

  return <main className={styles.home} style={{ "--world-accent": world.accent } as CSSProperties}>
    <SiteNav />
    <div className={styles.texture} aria-hidden="true" />
    <div className={styles.content}>
      <section className={styles.feature} aria-label="Selected portfolio work">
        <div className={styles.intro}>
          <p className={styles.eyebrow}><i /> SCREAM VISION / Independent digital artist</p>
          <h1>One vision.<br /><span>Many<br className={styles.desktopBreak} /> worlds.</span></h1>
          <div className={styles.introBottom}>
            <p>Cover art. Characters.<br />Collectible worlds.</p>
            <Link className={styles.enter} href={world.href}>Explore {world.title}<span aria-hidden="true">↗</span></Link>
          </div>
        </div>

        <div className={styles.showcase} role="tabpanel" id="home-world" aria-labelledby={`world-${active}`}>
          <span className={styles.stageLabel}>Selected work <span>{String(active + 1).padStart(2, "0")} / 04</span></span>
          <Link className={styles.artLink} href={world.href} aria-label={`View ${world.title} collection`} onPointerMove={move} onPointerLeave={reset} onBlur={reset}>
            <div className={styles.composition} ref={composition}>
              <div className={styles.artworkSet} key={world.href} data-format={world.format}>
                <div className={`${styles.artwork} ${styles.backLeft}`}><PortfolioImage src={mediaSource(world.images[1])} alt="" fill sizes="180px" draggable={false} /></div>
                <div className={`${styles.artwork} ${styles.backRight}`}><PortfolioImage src={mediaSource(world.images[2])} alt="" fill sizes="180px" draggable={false} /></div>
                <div className={`${styles.artwork} ${styles.front}`}><PortfolioImage src={mediaSource(world.images[0])} alt={world.caption} fill sizes="400px" priority={active === 0} draggable={false} /></div>
              </div>
            </div>
            <span className={styles.openMark} aria-hidden="true">↗</span>
          </Link>
          <div className={styles.artCaption}><span>{world.caption}</span><span>{String(world.count).padStart(2, "0")} {world.unit}</span></div>
        </div>
      </section>

      <nav className={styles.worlds} role="tablist" aria-label="Explore portfolio worlds">
        {worlds.map((item, index) => <button type="button" role="tab" id={`world-${index}`} key={item.href} aria-controls="home-world" aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => { reset(); setActive(index); }} onPointerEnter={(event) => { if (event.pointerType === "mouse") { reset(); setActive(index); } }} onFocus={() => { reset(); setActive(index); }} onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const next = event.key === "Home" ? 0 : event.key === "End" ? worlds.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + worlds.length) % worlds.length;
          document.getElementById(`world-${next}`)?.focus();
        }}>
          <small>0{index + 1}</small><strong>{item.title}</strong><span>{String(item.count).padStart(2, "0")}</span><i aria-hidden="true">↗</i>
        </button>)}
      </nav>

      <footer className={styles.footer}><span>Art, in every form.</span><Link href="/contacts">Let’s work together <span aria-hidden="true">↗</span></Link><span>SCREAM VISION</span></footer>
    </div>
  </main>;
}
