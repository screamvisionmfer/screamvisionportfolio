"use client";

import { PortfolioImage as Image } from "@/components/portfolio-image/PortfolioImage";
import Link from "next/link";
import { CSSProperties } from "react";
import { collaborations } from "@/data/collaborations";
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
            <div className={styles.cardMedia}><Image src={item.hero} alt={item.title} fill sizes="(max-width: 760px) 92vw, 36vw" priority={index === 0} draggable="false" unoptimized /><span className={styles.cardWash} /></div>
            <div className={styles.cardTop}><span>{String(index + 1).padStart(2, "0")}</span><span>{item.assets.length} artworks · {item.year}</span></div>
            <div className={styles.cardTitle}><p>SCREAM VISION × {item.partner}</p><h2>{item.title}</h2></div>
            <div className={styles.cardAction}><span>View project</span><i>↗</i></div>
          </Link>
        ))}
      </section>
      <p className={styles.archiveFooter}><span>Art direction</span><span>Illustration</span><span>Selected collaborations</span></p>
    </main>
  );
}
