import { SiteNav } from "@/components/site-nav/SiteNav";
import Link from "next/link";
import styles from "./infoPage.module.css";

type InfoPageProps = {
  chapter: string;
  title: string;
  copy: string;
  note: string;
};

export function InfoPage({ chapter, title, copy, note }: InfoPageProps) {
  return (
    <main className={styles.page}>
      <SiteNav />
      <span className={styles.chapter}>{chapter}</span>
      <section className={styles.intro}>
        <h1>{title}</h1>
        <div className={styles.description}><p>{copy}</p><Link href="/contacts">Let’s work together <span aria-hidden="true">↗</span></Link></div>
      </section>
      <section className={styles.work} aria-labelledby="practice-title">
        <h2 id="practice-title">One practice.<br />Different worlds.</h2>
        <div className={styles.disciplines}>
          {[
            { href: "/covers", title: "Cover art & motion", copy: "Release artwork, animated covers and visual loops." },
            { href: "/illustrations", title: "Illustration", copy: "Characters, scenes and standalone artworks." },
            { href: "/cards", title: "Collectible cards", copy: "Art packs and collectible character series." },
            { href: "/collaborations", title: "Collaborations", copy: "Shared projects and character-led collections." },
          ].map((item, index) => <Link key={item.href} href={item.href}><small>0{index + 1}</small><div><h3>{item.title}</h3><p>{item.copy}</p></div><span aria-hidden="true">↗</span></Link>)}
        </div>
      </section>
      <p className={styles.note}>{note}</p>
    </main>
  );
}
