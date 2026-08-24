"use client";

import Link from "next/link";
import { SiteNav } from "@/components/site-nav/SiteNav";
import styles from "./collaborations.module.css";

export function CollaborationNav({ detail = false }: { detail?: boolean }) {
  return (
    <><SiteNav />{detail && <Link className={styles.backToArchive} href="/collaborations">← Archive</Link>}</>
  );
}
