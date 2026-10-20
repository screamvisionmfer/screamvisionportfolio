"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { isPageActive, observePageActivity } from "@/components/site-nav/pageActivity";

const wrap = (n: number, count: number) => (n % count + count) % count;

export function useArtScene(stageRef: RefObject<HTMLDivElement | null>, count: number) {
  const [active, setActive] = useState(0);
  const current = useRef(0);
  const target = useRef(0);
  const wake = useRef<() => void>(() => {});
  const goTo = useCallback((index: number) => {
    let distance = wrap(index - current.current, count);
    if (distance > count / 2) distance -= count;
    target.current = current.current + distance;
    wake.current();
  }, [count]);
  const nudge = useCallback((direction: number) => { target.current = Math.round(target.current) + direction; wake.current(); }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const panels = Array.from(stage.querySelectorAll<HTMLElement>("[data-art-panel]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, lastTime = 0, selected = 0, wheelTimer = 0, panelSize = 360;
    let down = false, moved = false, startX = 0, startY = 0, startProgress = 0, lastX = 0, lastPointerTime = 0, speed = 0;
    let lookX = 0, lookY = 0, aimX = 0, aimY = 0;
    const render = (now: number) => {
      frame = 0;
      if (!isPageActive()) { stage.dataset.animationActive = "false"; return; }
      const dt = lastTime ? Math.min(40, now - lastTime) : 16.667;
      lastTime = now;
      const follow = reduced.matches ? 1 : 1 - Math.exp(-dt / (down ? 35 : 110));
      current.current += (target.current - current.current) * follow;
      if (Math.abs(target.current - current.current) < .0002) current.current = target.current;
      lookX += (aimX - lookX) * (1 - Math.exp(-dt / 90));
      lookY += (aimY - lookY) * (1 - Math.exp(-dt / 90));
      if (Math.abs(aimX - lookX) < .01) lookX = aimX;
      if (Math.abs(aimY - lookY) < .01) lookY = aimY;
      stage.style.setProperty("--look-x", `${lookX}px`);
      stage.style.setProperty("--look-y", `${lookY}px`);
      panels.forEach((panel, index) => {
        const relative = wrap(index - current.current + count / 2, count) - count / 2;
        const distance = Math.abs(relative), sign = Math.sign(relative);
        if (distance > 3.7 && panel.style.visibility === "hidden") return;
        panel.style.visibility = distance < 3.7 ? "visible" : "hidden";
        panel.inert = distance >= 3.2;
        panel.tabIndex = distance < .5 ? 0 : -1;
        const scale = distance <= 1 ? 1 - distance * .23 : Math.max(.38, .77 - (distance - 1) * .17);
        const x = sign * panelSize * (Math.min(distance, 1) * .9 + Math.min(Math.max(distance - 1, 0), 1) * .73 + Math.max(distance - 2, 0) * .47);
        const y = Math.min(distance, 2.5) * 12 + Math.sin(Math.min(distance, 1) * Math.PI / 2) * ([0, -25, 30, -18][index % 4]);
        const ry = -sign * Math.min(distance * 28, 57);
        const z = 65 - Math.min(distance, 3.7) * 120;
        panel.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateY(${ry}deg) rotateZ(${sign * Math.min(distance * 4.5, 10)}deg) scale(${scale})`;
        panel.style.opacity = String(Math.max(.08, 1 - distance * .24));
        panel.style.zIndex = String(100 - Math.round(distance * 20));
        panel.dataset.focused = String(distance < .5);
      });
      const next = wrap(Math.round(current.current), count);
      if (next !== selected) { selected = next; setActive(next); }
      if (!down && Math.abs(current.current) > count * 4) {
        const shift = Math.round(current.current / count) * count;
        current.current -= shift; target.current -= shift;
      }
      const moving = Math.abs(current.current - target.current) > .0001 || Math.abs(lookX - aimX) > .01 || Math.abs(lookY - aimY) > .01;
      stage.dataset.animationActive = String(moving);
      if (moving) frame = requestAnimationFrame(render);
    };
    wake.current = () => { if (!frame && isPageActive()) { lastTime = 0; frame = requestAnimationFrame(render); } };
    const resize = () => {
      const bounds = stage.getBoundingClientRect();
      const mobile = bounds.width <= 700;
      panelSize = Math.max(90, Math.min(bounds.width * (mobile ? .7 : .34), bounds.height * .83, mobile ? 320 : 450));
      stage.style.setProperty("--panel-size", `${panelSize}px`);
      wake.current();
    };
    const press = (event: PointerEvent) => {
      if (event.button !== 0 || !isPageActive()) return;
      window.clearTimeout(wheelTimer);
      down = true; moved = false; speed = 0;
      startX = lastX = event.clientX; startY = event.clientY; lastPointerTime = event.timeStamp;
      startProgress = current.current; target.current = current.current;
    };
    const move = (event: PointerEvent) => {
      if (!isPageActive()) return;
      if (!down) {
        if (event.pointerType !== "mouse" || reduced.matches) return;
        const rect = stage.getBoundingClientRect();
        aimX = ((event.clientX - rect.left) / rect.width - .5) * 18;
        aimY = ((event.clientY - rect.top) / rect.height - .5) * 12;
        wake.current(); return;
      }
      if (!(event.buttons & 1) && event.pointerType !== "touch") { down = false; target.current = Math.round(target.current); stage.dataset.dragging = "false"; wake.current(); return; }
      const dx = event.clientX - startX, dy = event.clientY - startY;
      if (!moved && Math.abs(dx) < 6) return;
      if (!moved && event.pointerType === "touch" && Math.abs(dy) > Math.abs(dx) * 1.3) { down = false; target.current = Math.round(target.current); wake.current(); return; }
      moved = true; stage.dataset.dragging = "true";
      stage.setPointerCapture(event.pointerId);
      event.preventDefault();
      const step = panelSize * .9;
      speed = speed * .4 + (lastX - event.clientX) / (Math.max(8, event.timeStamp - lastPointerTime) * step) * .6;
      lastX = event.clientX; lastPointerTime = event.timeStamp;
      target.current = startProgress - dx / step;
      aimX = 0; aimY = 0; wake.current();
    };
    const release = (event: PointerEvent) => {
      if (!down) return;
      down = false; stage.dataset.dragging = "false";
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      if (moved) {
        const momentum = event.type === "pointercancel" || event.timeStamp - lastPointerTime > 90 ? 0 : Math.max(-2.5, Math.min(2.5, speed * 160));
        target.current = Math.round(target.current + momentum);
      } else target.current = Math.round(target.current);
      wake.current();
    };
    const leave = () => { aimX = 0; aimY = 0; wake.current(); };
    const click = (event: MouseEvent) => { if (moved && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); } };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || !isPageActive()) return;
      event.preventDefault(); moved = false;
      const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const delta = raw * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? panelSize : 1);
      target.current += Math.max(-1, Math.min(1, delta / (panelSize * 1.4)));
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => { target.current = Math.round(target.current); wake.current(); }, 160);
      wake.current();
    };
    const key = (event: KeyboardEvent) => {
      if (!isPageActive() || event.altKey || event.ctrlKey || event.metaKey) return;
      const element = event.target as HTMLElement;
      if (element.closest("input, textarea, select") || (element.closest("a, button") && !stage.contains(element))) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); nudge(event.key === "ArrowRight" ? 1 : -1); }
    };
    const activity = () => {
      if (!isPageActive()) {
        cancelAnimationFrame(frame); frame = 0; window.clearTimeout(wheelTimer);
        down = false; moved = false; target.current = Math.round(target.current);
        stage.dataset.dragging = "false"; stage.dataset.animationActive = "false";
      } else wake.current();
    };
    const observer = new ResizeObserver(resize); observer.observe(stage);
    const stopObserving = observePageActivity(activity);
    stage.addEventListener("pointerdown", press); stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", release); stage.addEventListener("pointercancel", release);
    stage.addEventListener("pointerleave", leave); stage.addEventListener("click", click, true);
    stage.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    resize();
    return () => {
      cancelAnimationFrame(frame); window.clearTimeout(wheelTimer); observer.disconnect(); stopObserving(); wake.current = () => {};
      stage.removeEventListener("pointerdown", press); stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", release); stage.removeEventListener("pointercancel", release);
      stage.removeEventListener("pointerleave", leave); stage.removeEventListener("click", click, true);
      stage.removeEventListener("wheel", wheel); window.removeEventListener("keydown", key);
    };
  }, [count, nudge, stageRef]);

  return { active, goTo, nudge };
}
