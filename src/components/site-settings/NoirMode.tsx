"use client";

import { useEffect } from "react";

export function readNoirMode() {
  try { return localStorage.getItem("portfolio:noir") === "true"; }
  catch { return false; }
}

export function applyNoirMode(enabled: boolean) {
  document.documentElement.dataset.noir = String(enabled);
  try { localStorage.setItem("portfolio:noir", String(enabled)); } catch { /* Private storage may be unavailable. */ }
}

/** A site-wide preference survives section navigation and reloads. */
export function NoirMode() {
  useEffect(() => { applyNoirMode(readNoirMode()); }, []);
  return null;
}
