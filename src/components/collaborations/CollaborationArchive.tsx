"use client";

import { PortfolioImage as Image } from "@/components/portfolio-image/PortfolioImage";
import Link from "next/link";
import { CSSProperties, useEffect, useState } from "react";
import { collaborations, type Collaboration } from "@/data/collaborations";
import { CollaborationNav } from "./CollaborationNav";
import styles from "./collaborations.module.css";

export function CollaborationArchive() {
  return (
    <main className={styles.archive}>
      <CollaborationNav />
      <div className={styles.archiveIntro}>
        <span>Selected partnerships · {String(collaborations.length).padStart(2, "0")}</span>
        <h1><i>Creative</i> collaborations</h1>
      </div>
      <section className={styles.cards} aria-label="Collaboration projects">
        {collaborations.map((item, index) => (
          <Link href={`/collaborations/${item.slug}`} key={item.slug} className={styles.collabCard} style={{ "--card-accent": item.accent } as CSSProperties}>
            <div className={styles.cardMedia}><ProjectSlideshow item={item} priority={index === 0} offset={index} /><span className={styles.cardWash} /></div>
            <div className={styles.cardTop}><span>{String(index + 1).padStart(2, "0")}</span><span>{item.assets.length} artworks{item.year && ` · ${item.year}`}</span></div>
            <div className={styles.cardTitle}><p>SCREAM VISION × {item.partner}</p><h2>{item.title}</h2></div>
            <div className={styles.cardAction}><span>View project</span><i>↗</i></div>
          </Link>
        ))}
      </section>
      <p className={styles.archiveFooter}><span>Art direction</span><span>Illustration</span><span>Selected collaborations</span></p>
    </main>
  );
}

function ProjectSlideshow({ item, priority, offset }: { item: Collaboration; priority: boolean; offset: number }) {
  const slides = [item.hero, ...item.assets.filter(asset => asset.kind === "image" && asset.src !== item.hero).map(asset => asset.src)].slice(0, 5);
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setActive(value => loaded.has((value + 1) % slides.length) ? (value + 1) % slides.length : value);
    }, 3800 + offset * 230);
    return () => window.clearInterval(timer);
  }, [loaded, offset, slides.length]);
  return <div className={styles.slideshow} aria-hidden="true">{slides.map((src, index) => index <= active + 1 && <div className={styles.slide} data-active={index === active} key={src}>
    <Image src={src} alt="" fill sizes="(max-width: 760px) 90vw, 28vw" priority={priority && index === 0} draggable={false} onLoad={() => setLoaded(previous => new Set([...previous, index]))} />
  </div>)}<div className={styles.slideProgress}>{slides.map((_, index) => <i key={index} data-active={index === active} />)}</div></div>;
}
