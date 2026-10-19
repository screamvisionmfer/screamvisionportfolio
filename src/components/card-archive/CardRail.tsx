"use client";

import { Children, type ReactNode, type RefObject, useEffect, useRef } from "react";
import styles from "./cardArchive.module.css";
import { isPageActive, observePageActivity } from "@/components/site-nav/pageActivity";

type Props = { rootRef: RefObject<HTMLDivElement | null>; index: number; count: number; onActiveChange: (index: number) => void; children: ReactNode };

/** Native touch scrolling, direct mouse dragging, and one animation only while settling. */
export function CardRail({ rootRef, index, count, onActiveChange, children }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const nearest = useRef(index);
  const desired = useRef(index);
  const select = useRef(onActiveChange);
  const navigate = useRef<(index: number) => void>(() => {});
  desired.current = index;
  select.current = onActiveChange;

  useEffect(() => {
    const viewport = viewportRef.current;
    const root = rootRef.current;
    if (!viewport || !root) return;
    const items = Array.from(viewport.querySelectorAll<HTMLElement>("[data-rail-item]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let step = 1, base = 0, frame = 0, motion = 0, wheelTimer = 0;
    let down = false, dragged = false, dragX = 0, dragScroll = 0, lastX = 0, lastTime = 0, speed = 0;
    const clamp = (n: number) => Math.max(0, Math.min(count - 1, n));
    const paint = () => {
      frame = 0;
      const progress = (viewport.scrollLeft - base) / step;
      items.forEach((item, i) => {
        const relative = i - progress, distance = Math.abs(relative);
        if (distance > 5 && item.style.visibility === "hidden") return;
        item.style.visibility = distance < 5 ? "visible" : "hidden";
        item.inert = distance >= 3.5;
        const scale = distance <= 1 ? 1.1 - distance * .23 : .87 - Math.min(distance - 1, 2.5) * .07;
        item.style.transform = `perspective(1000px) translateY(${Math.min(distance, 3) * 7}px) rotateY(${Math.max(-25, Math.min(25, -relative * 12))}deg) scale(${scale})`;
        item.style.opacity = String(Math.max(.25, 1 - distance * .13));
      });
      const next = clamp(Math.round(progress));
      if (next !== nearest.current) { nearest.current = next; select.current(next); }
      root.dataset.animationActive = String(down || Boolean(motion));
    };
    const requestPaint = () => { if (!frame && isPageActive()) frame = requestAnimationFrame(paint); };
    const stop = () => { cancelAnimationFrame(motion); motion = 0; };
    const goTo = (target: number) => {
      stop();
      const start = viewport.scrollLeft, end = base + clamp(target) * step;
      if (reduced.matches || Math.abs(end - start) < .5) { viewport.scrollLeft = end; requestPaint(); return; }
      const duration = Math.min(700, 380 + Math.abs(end - start) * .18);
      let began = 0;
      const tick = (now: number) => {
        if (!isPageActive()) { motion = 0; return; }
        if (!began) began = now;
        const p = Math.min(1, (now - began) / duration);
        viewport.scrollLeft = start + (end - start) * (1 - Math.pow(1 - p, 4));
        motion = p < 1 ? requestAnimationFrame(tick) : 0;
        requestPaint();
      };
      motion = requestAnimationFrame(tick);
    };
    navigate.current = goTo;
    const measure = () => {
      stop();
      const first = items[0];
      if (!first) return;
      step = items[1] ? items[1].offsetLeft - first.offsetLeft : first.offsetWidth;
      base = first.offsetLeft + first.offsetWidth / 2 - viewport.clientWidth / 2;
      viewport.scrollLeft = base + desired.current * step;
      requestPaint();
    };
    const press = (event: PointerEvent) => {
      if (event.button !== 0) return;
      dragged = false;
      stop(); window.clearTimeout(wheelTimer);
      if (event.pointerType === "touch") return;
      down = true; speed = 0;
      dragX = lastX = event.clientX; dragScroll = viewport.scrollLeft; lastTime = event.timeStamp;
    };
    const move = (event: PointerEvent) => {
      if (!down) return;
      if (!(event.buttons & 1)) { down = false; root.dataset.dragging = "false"; requestPaint(); return; }
      const dx = event.clientX - dragX;
      if (!dragged && Math.abs(dx) < 5) return;
      dragged = true;
      viewport.setPointerCapture(event.pointerId);
      event.preventDefault();
      root.dataset.dragging = "true";
      speed = speed * .35 + (lastX - event.clientX) / Math.max(8, event.timeStamp - lastTime) * .65;
      lastX = event.clientX; lastTime = event.timeStamp;
      viewport.scrollLeft = dragScroll - dx;
      requestPaint();
    };
    const release = (event: PointerEvent) => {
      if (!down) return;
      down = false; root.dataset.dragging = "false";
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      if (!dragged) { requestPaint(); return; }
      const momentum = event.type === "pointercancel" || event.timeStamp - lastTime > 90 ? 0 : Math.max(-step * 3, Math.min(step * 3, speed * 180));
      goTo(Math.round((viewport.scrollLeft - base + momentum) / step));
    };
    const click = (event: MouseEvent) => { if (dragged && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); } };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      event.preventDefault(); stop();
      const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1);
      viewport.scrollLeft += delta * .85;
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => goTo(Math.round((viewport.scrollLeft - base) / step)), 150);
      requestPaint();
    };
    const visibility = () => {
      stop();
      if (!isPageActive()) { cancelAnimationFrame(frame); frame = 0; window.clearTimeout(wheelTimer); down = false; root.dataset.dragging = "false"; root.dataset.animationActive = "false"; }
      else goTo(desired.current);
    };
    const resize = new ResizeObserver(measure); resize.observe(viewport);
    viewport.addEventListener("scroll", requestPaint, { passive: true });
    viewport.addEventListener("pointerdown", press);
    viewport.addEventListener("pointermove", move);
    viewport.addEventListener("pointerup", release);
    viewport.addEventListener("pointercancel", release);
    viewport.addEventListener("click", click, true);
    viewport.addEventListener("wheel", wheel, { passive: false });
    const stopObservingActivity = observePageActivity(visibility);
    measure();
    return () => {
      stop(); cancelAnimationFrame(frame); window.clearTimeout(wheelTimer); resize.disconnect(); navigate.current = () => {};
      viewport.removeEventListener("scroll", requestPaint);
      viewport.removeEventListener("pointerdown", press); viewport.removeEventListener("pointermove", move);
      viewport.removeEventListener("pointerup", release); viewport.removeEventListener("pointercancel", release);
      viewport.removeEventListener("click", click, true); viewport.removeEventListener("wheel", wheel);
      stopObservingActivity();
    };
  }, [count, rootRef]);

  useEffect(() => { if (index !== nearest.current) navigate.current(index); }, [index]);

  return <div ref={rootRef} className={styles.ribbon} tabIndex={0} aria-label="Card carousel" data-dragging="false" onKeyDown={(event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); navigate.current(nearest.current + (event.key === "ArrowRight" ? 1 : -1)); }
    if (event.key === "Enter" && event.target === event.currentTarget) viewportRef.current?.querySelector<HTMLButtonElement>(`[data-rail-item="${nearest.current}"] button`)?.click();
  }}>
    <div ref={viewportRef} className={styles.ribbonViewport}><div className={styles.ribbonTrack}>
      {Children.map(children, (child, i) => <div className={styles.ribbonItem} data-rail-item={i}>{child}</div>)}
    </div></div>
  </div>;
}
