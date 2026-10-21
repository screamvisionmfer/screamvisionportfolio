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
    document.documentElement.dataset.navigationOpen = String(menuOpen);
    window.dispatchEvent(new Event("portfolio:navigation"));
  }, [menuOpen]);
  useEffect(() => () => {
    delete document.documentElement.dataset.navigationOpen;
    window.dispatchEvent(new Event("portfolio:navigation"));
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
      <Link className={styles.logo} href="/" aria-label="Return to room"><Image src="/scream-logo.png" alt="" width={90} height={44} priority unoptimized /><span><b>←</b> RETURN TO ROOM</span></Link>
      <span className={styles.location}><i/> {primary.find(item=>item.href===activeHref)?.label??(activeHref==="/about"?"About":"Contacts")} <small>/ SCREAM VISION</small></span>
      <button className={styles.menuButton} type="button" aria-expanded={menuOpen} aria-controls="site-world-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(value=>!value)}>
        <b className={styles.key}>Y</b><span>{menuOpen?"RESUME":"MENU"}</span><i>{menuOpen?"×":"☰"}</i>
      </button>
      <div id="site-world-menu" className={styles.panel} inert={!menuOpen} aria-hidden={!menuOpen}>
        <button className={styles.backdrop} aria-label="Dismiss menu" onClick={()=>setMenuOpen(false)} tabIndex={menuOpen?0:-1}/>
        <div className={styles.menuContent} role={menuOpen?"dialog":undefined} aria-modal={menuOpen?true:undefined} aria-label="World select">
          <div className={styles.menuHeading}><span><i/> PAUSED</span><h2>World select<span> /</span></h2><p>Where do you want to go?</p></div>
          <nav aria-label="Portfolio sections">
            {allLinks.map((item,index)=>{
              const active=activeHref===item.href;
              return <Link key={item.href} href={item.href} onClick={()=>setMenuOpen(false)} aria-current={active?"page":undefined} className={active?styles.active:undefined} tabIndex={menuOpen?0:-1}><small>{String(index+1).padStart(2,"0")}</small><span>{item.href==="/"?"The room":item.label}</span><em>{active?"YOU ARE HERE":""}</em><i>↗</i></Link>;
            })}
          </nav>
          <div className={styles.menuFooter}><a href="mailto:screamvisionmfer@gmail.com"><b className={styles.contactKey}>X</b> GET IN TOUCH <span>↗</span></a><div><a href="https://t.me/screamdesign" target="_blank" rel="noopener noreferrer">TELEGRAM ↗</a><a href="https://www.behance.net/jimmyscream" target="_blank" rel="noopener noreferrer">BEHANCE ↗</a></div><p><span><b>A</b> SELECT</span><span><b>B</b> ESC / CLOSE</span></p></div>
        </div>
      </div>
    </header>
  );
}
