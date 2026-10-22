"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { isPageActive, observePageActivity } from "@/components/site-nav/pageActivity";

gsap.registerPlugin(Observer);

type FrameCallback = (progress: number, velocity: number) => void;

export function useGalleryController(
  rootRef: RefObject<HTMLElement | null>,
  count: number,
  onFrame: FrameCallback,
) {
  const progress = useRef(0);
  const target = useRef(0);
  const velocity = useRef(0);
  const dragging = useRef(false);
  const frameCallback = useRef(onFrame);
  const wake = useRef<() => void>(() => {});
  const [activeIndex, setActiveIndex] = useState(0);

  frameCallback.current = onFrame;

  const clamp = useCallback((value: number) => Math.max(0, Math.min(count - 1, value)), [count]);

  const goTo = useCallback((index: number) => {
    const next = clamp(index);
    target.current = next;
    velocity.current = 0;
    wake.current();
  }, [clamp]);

  const nudge = useCallback((direction: number) => {
    goTo(Math.round(target.current) + direction);
  }, [goTo]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let raf = 0;
    let lastActive = 0;
    let lastRendered = Number.NaN;
    let lastTime = 0;
    let motionVelocity = 0;
    let interactionMoved = false;
    let lastRipple = 0;
    let pointerX = 0;
    let dragStartX = 0;
    let dragStartTarget = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const getPointerX = (event: Event, fallback: number) => {
      if ("clientX" in event && typeof event.clientX === "number") return event.clientX;
      if ("touches" in event) {
        const touchEvent = event as TouchEvent;
        return touchEvent.touches[0]?.clientX ?? touchEvent.changedTouches[0]?.clientX ?? fallback;
      }
      return fallback;
    };
    const emitRipple = () => {
      const now = Date.now();
      if (interactionMoved && now - lastRipple > 220) {
        root.dispatchEvent(new CustomEvent("gallery:release"));
        lastRipple = now;
      }
      interactionMoved = false;
    };

    const observer = Observer.create({
      target: root,
      type: "wheel,touch,pointer",
      preventDefault: true,
      dragMinimum: 3,
      wheelSpeed: 0.7,
      tolerance: 2,
      onPress: (self) => {
        if(root.dataset.loading==="true")return;
        wake.current();
        if (self.event.type !== "wheel") {
          dragging.current = true;
          velocity.current = 0;
          interactionMoved = false;
          pointerX = getPointerX(self.event, self.x ?? 0);
          dragStartX = pointerX;
          dragStartTarget = target.current;
          root.dataset.dragging = "true";
        }
      },
      onChange: (self) => {
        if(root.dataset.loading==="true")return;
        wake.current();
        const isWheel = self.event.type === "wheel";
        const raw = Math.abs(self.deltaX) > Math.abs(self.deltaY) ? self.deltaX : self.deltaY;
        if (isWheel) {
          const amount = gsap.utils.clamp(-80, 80, raw) / 260;
          target.current = clamp(target.current + amount);
          velocity.current = 0;
          interactionMoved = interactionMoved || Math.abs(amount) > 0.01;
        } else if (dragging.current) {
          const width = Math.max(280, Math.min(window.innerWidth * 0.4, 620));
          const currentX = getPointerX(self.event, self.x ?? pointerX);
          const movement = currentX - pointerX;
          pointerX = currentX;
          const amount = -movement / width;
          target.current = clamp(dragStartTarget - (currentX - dragStartX) / width);
          velocity.current = amount * 0.5;
          interactionMoved = interactionMoved || Math.abs(movement) > 1;
        }
      },
      onRelease: () => {
        if(root.dataset.loading==="true")return;
        wake.current();
        dragging.current = false;
        const displacement = dragStartX - pointerX;
        target.current = Math.abs(displacement) > 60
          ? clamp(Math.round(dragStartTarget) + Math.sign(displacement))
          : clamp(Math.round(target.current));
        velocity.current = 0;
        root.dataset.dragging = "false";
        emitRipple();
      },
      onStop: () => {
        wake.current();
        if (!dragging.current) {
          velocity.current = 0;
          target.current = clamp(Math.round(target.current));
          emitRipple();
        }
      },
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isPageActive()||root.dataset.loading==="true") return;
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        event.preventDefault();
        nudge(1);
      }
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        event.preventDefault();
        nudge(-1);
      }
      if (event.key === "Enter") {
        root.dispatchEvent(new CustomEvent("gallery:open", { detail: lastActive }));
      }
    };
    window.addEventListener("keydown", onKeyDown);

    const tick = (now: number) => {
      raf = 0;
      if (!isPageActive()||root.dataset.loading==="true") return;
      const delta = lastTime ? Math.min(2, Math.max(0.5, (now - lastTime) / 16.667)) : 1;
      lastTime = now;
      if (!dragging.current) {
        target.current = clamp(target.current + velocity.current);
        velocity.current *= Math.pow(reduced ? 0.48 : 0.82, delta);
        if (Math.abs(velocity.current) < 0.0008) {
          velocity.current = 0;
          const snapFollow = 1 - Math.pow(1 - (reduced ? 0.36 : 0.09), delta);
          target.current += (Math.round(target.current) - target.current) * snapFollow;
        }
      }

      if (dragging.current || reduced) {
        const baseFollow = reduced ? 0.34 : 0.42;
        const follow = 1 - Math.pow(1 - baseFollow, delta);
        progress.current += (target.current - progress.current) * follow;
        motionVelocity = 0;
      } else {
        motionVelocity += (target.current - progress.current) * 0.085 * delta;
        motionVelocity *= Math.pow(0.72, delta);
        progress.current += motionVelocity * delta;
      }
      if (Math.abs(target.current - progress.current) < 0.00035 && Math.abs(motionVelocity) < 0.00035) {
        progress.current = target.current;
        motionVelocity = 0;
      }

      if (!Number.isFinite(lastRendered) || Math.abs(progress.current - lastRendered) > 0.00005 || Math.abs(velocity.current) > 0.0008) {
        frameCallback.current(progress.current, velocity.current);
        lastRendered = progress.current;
      }
      const nearest = Math.round(progress.current);
      if (nearest !== lastActive && Math.abs(progress.current - nearest) < 0.42) {
        lastActive = nearest;
        setActiveIndex(nearest);
      }
      const moving = dragging.current || Math.abs(target.current - progress.current) > .00005 || Math.abs(motionVelocity) > .00005 || Math.abs(target.current - Math.round(target.current)) > .00005;
      root.dataset.animationActive = String(moving);
      if (moving) raf = requestAnimationFrame(tick);
    };
    wake.current = () => {
      if (!raf && isPageActive()) { lastTime = 0; raf = requestAnimationFrame(tick); }
    };
    const syncVisibility = () => {
      root.dataset.hidden = String(!isPageActive());
      if (!isPageActive()) {
        cancelAnimationFrame(raf); raf = 0; root.dataset.animationActive = "false";
        dragging.current = false; root.dataset.dragging = "false"; velocity.current = 0;
        observer.disable();
      } else { observer.enable(); wake.current(); }
    };
    const resize = () => { lastRendered = Number.NaN; wake.current(); };
    const stopObservingActivity = observePageActivity(syncVisibility);
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);

    return () => {
      observer.kill();
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      stopObservingActivity();
      window.removeEventListener("resize", resize);
      wake.current = () => {};
    };
  }, [clamp, count, nudge, rootRef]);

  return { activeIndex, goTo, nudge };
}
