import { SiteNav } from "@/components/site-nav/SiteNav";
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
      <section>
        <h1>{title}</h1>
        <p>{copy}</p>
      </section>
      <p className={styles.note}>{note}</p>
    </main>
  );
}
