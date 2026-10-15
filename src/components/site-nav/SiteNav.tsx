"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./siteNav.module.css";
import { useModalFocus } from "@/components/viewer-controls/useModalFocus";

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
  const menuFocus = useModalFocus<HTMLElement>(menuOpen);
  const activeHref = pathname.startsWith("/projects") ? "/covers" : pathname === "/" ? "/" : ["/about", "/contacts", ...primary.map((item) => item.href).filter((href) => href !== "/")].find((href) => pathname.startsWith(href));

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1001px)");
    const resize = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener("change", resize);
    return () => desktop.removeEventListener("change", resize);
  }, []);
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
    <header ref={menuFocus} className={`${styles.header} ${className}`} data-menu-open={menuOpen} onKeyDown={(event) => { if (menuOpen) { event.stopPropagation(); if (event.key === "Escape") setMenuOpen(false); } }}>
      <nav className={styles.primary} aria-label="Portfolio sections">
        {primary.map((item) => <Link key={item.href} aria-current={activeHref === item.href ? "page" : undefined} className={activeHref === item.href ? styles.active : undefined} href={item.href}>{item.label}</Link>)}
      </nav>
      <Link className={styles.logo} href="/" aria-label="SCREAM VISION home"><Image src="/scream-logo.png" alt="" width={180} height={88} priority unoptimized /></Link>
      <nav className={styles.secondary} aria-label="Information"><Link aria-current={activeHref === "/about" ? "page" : undefined} className={activeHref === "/about" ? styles.active : undefined} href="/about">About</Link><Link aria-current={activeHref === "/contacts" ? "page" : undefined} className={activeHref === "/contacts" ? styles.active : undefined} href="/contacts">Contacts</Link></nav>
      <button className={styles.menuButton} type="button" aria-expanded={menuOpen} aria-controls="mobile-site-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((value) => !value)}>
        <span /><span /><b>{menuOpen ? "Close" : "Menu"}</b>
      </button>
      <div id="mobile-site-menu" className={styles.mobilePanel} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          {allLinks.map((item, index) => {
            const active = item.href === "/about" ? pathname.startsWith("/about") : item.href === "/contacts" ? pathname.startsWith("/contacts") : activeHref === item.href;
            return <Link key={item.href} onClick={() => setMenuOpen(false)} aria-current={active ? "page" : undefined} className={active ? styles.mobileActive : undefined} href={item.href} tabIndex={menuOpen ? 0 : -1}><small>{String(index + 1).padStart(2, "0")}</small><span>{item.label}</span><i>↗</i></Link>;
          })}
        </nav>
        <p><span>Digital art direction</span><span>Selected works · 2022—2026</span></p>
      </div>
    </header>
  );
}
