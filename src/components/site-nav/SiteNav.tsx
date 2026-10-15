"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./siteNav.module.css";

const primary = [
  { label: "Main", href: "/" },
  { label: "Covers", href: "/covers" },
  { label: "Illustrations", href: "/illustrations" },
  { label: "Cards", href: "/cards" },
  { label: "Collaborations", href: "/collaborations" },
];

export function SiteNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeHref = pathname.startsWith("/projects") ? "/covers" : primary.find((item) => item.href !== "/" && pathname.startsWith(item.href))?.href ?? "/";

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", close);
    };
  }, [menuOpen]);

  const allLinks = [...primary, { label: "About", href: "/about" }, { label: "Contacts", href: "/contacts" }];
  return (
    <header className={`${styles.header} ${className}`} data-menu-open={menuOpen}>
      <nav className={styles.primary} aria-label="Portfolio sections">
        {primary.map((item) => <Link key={item.href} className={activeHref === item.href ? styles.active : undefined} href={item.href}>{item.label}</Link>)}
      </nav>
      <Link className={styles.logo} href="/" aria-label="SCREAM VISION home"><Image src="/scream-logo.png" alt="" width={180} height={88} priority unoptimized /></Link>
      <nav className={styles.secondary} aria-label="Information"><Link className={pathname.startsWith("/about") ? styles.active : undefined} href="/about">About</Link><Link className={pathname.startsWith("/contacts") ? styles.active : undefined} href="/contacts">Contacts</Link></nav>
      <button className={styles.menuButton} type="button" aria-expanded={menuOpen} aria-controls="mobile-site-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((value) => !value)}>
        <span /><span /><b>{menuOpen ? "Close" : "Menu"}</b>
      </button>
      <div id="mobile-site-menu" className={styles.mobilePanel} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          {allLinks.map((item, index) => {
            const active = item.href === "/about" ? pathname.startsWith("/about") : item.href === "/contacts" ? pathname.startsWith("/contacts") : activeHref === item.href;
            return <Link key={item.href} className={active ? styles.mobileActive : undefined} href={item.href} tabIndex={menuOpen ? 0 : -1}><small>{String(index + 1).padStart(2, "0")}</small><span>{item.label}</span><i>↗</i></Link>;
          })}
        </nav>
        <p><span>Digital art direction</span><span>Selected works · 2022—2026</span></p>
      </div>
    </header>
  );
}
