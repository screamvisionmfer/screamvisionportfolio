"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CSSProperties, useState } from "react";
import { collaborations } from "@/data/collaborations";
import { CollaborationNav } from "./CollaborationNav";
import styles from "./collaborations.module.css";

export function CollaborationArchive() {
  const router = useRouter();
  const [opening, setOpening] = useState<string | null>(null);

  const open = (slug: string) => {
    if (opening) return;
    setOpening(slug);
    router.prefetch(`/collaborations/${slug}`);
    window.setTimeout(() => router.push(`/collaborations/${slug}`), 920);
  };

  return (
    <main className={styles.archive} data-opening={Boolean(opening)}>
      <CollaborationNav />
      <div className={styles.archiveIntro}>
        <span>Selected partnerships · {String(collaborations.length).padStart(2, "0")}</span>
        <h1><i>Creative</i> collaborations</h1>
      </div>
      <section className={styles.cards} aria-label="Collaboration projects">
        {collaborations.map((item, index) => (
          <button key={item.slug} className={styles.collabCard} style={{ "--card-accent": item.accent } as CSSProperties} type="button" data-opening={opening === item.slug} onClick={() => open(item.slug)}>
            <div className={styles.cardMedia}><Image src={item.hero} alt={item.title} fill sizes="(max-width: 760px) 92vw, 36vw" priority={index === 0} draggable="false" unoptimized /><span className={styles.cardWash} /></div>
            <div className={styles.cardTop}><span>{String(index + 1).padStart(2, "0")}</span><span>{item.year}</span></div>
            <div className={styles.cardTitle}><p>SCREAM VISION × {item.partner}</p><h2>{item.title}</h2></div>
            <div className={styles.cardAction}><span>Open collaboration</span><i>↗</i></div>
          </button>
        ))}
      </section>
      <p className={styles.archiveFooter}><span>Art direction</span><span>Illustration</span><span>Selected collaborations</span></p>
    </main>
  );
}
