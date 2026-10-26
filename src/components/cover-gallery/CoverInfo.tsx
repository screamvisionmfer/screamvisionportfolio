import { CoverItem } from "@/data/covers";
import { projectBySlug } from "@/data/projects";
import styles from "./coverGallery.module.css";

export function CoverInfo({ item, total, onOpen }: { item: CoverItem; total: number; onOpen: () => void }) {
  const project = projectBySlug(item.id);
  return (
    <div className={styles.info} key={item.id} aria-live="polite">
      <span className={styles.infoNumber}>{item.number} / {String(total).padStart(2, "0")}</span>
      <div className={styles.infoTitle}>
        <strong>{item.title}</strong>
        <span>{item.artist}{item.year && ` · ${item.year}`}</span>
        <small>{project?.services.join(" / ")}</small>
      </div>
      <button type="button" className={styles.viewProject} aria-label={`View ${item.title}`} onClick={onOpen}>View project <span>+</span></button>
    </div>
  );
}
