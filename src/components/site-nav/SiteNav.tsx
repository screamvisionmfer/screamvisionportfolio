"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./siteNav.module.css";

const primary = [
  { label: "Main", href: "/" },
  { label: "Covers", href: "/covers" },
  { label: "Illustrations", href: "/illustrations" },
  { label: "Collaborations", href: "/collaborations" },
];

export function SiteNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const activeHref = pathname.startsWith("/projects") ? "/covers" : primary.find((item) => item.href !== "/" && pathname.startsWith(item.href))?.href ?? "/";
  return (
    <header className={`${styles.header} ${className}`}>
      <nav className={styles.primary} aria-label="Portfolio sections">
        {primary.map((item) => <Link key={item.href} className={activeHref === item.href ? styles.active : undefined} href={item.href}>{item.label}</Link>)}
      </nav>
      <Link className={styles.logo} href="/" aria-label="SCREAM VISION home"><Image src="/scream-logo.png" alt="" width={180} height={88} priority unoptimized /></Link>
      <nav className={styles.secondary} aria-label="Information"><Link className={pathname.startsWith("/about") ? styles.active : undefined} href="/about">About</Link><Link className={pathname.startsWith("/contacts") ? styles.active : undefined} href="/contacts">Contacts</Link></nav>
    </header>
  );
}
