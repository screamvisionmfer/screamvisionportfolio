"use client";

import { RefObject, useEffect } from "react";
import gsap from "gsap";

export function useGalleryTilt(
  rootRef: RefObject<HTMLElement | null>,
  cardRefs: RefObject<Array<HTMLButtonElement | null>>,
) {
  useEffect(() => {
    const root = rootRef.current;
    const canTilt = window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!root || !canTilt) return;

    let face: HTMLElement | null = null;
    let frame = 0;
    let hovering = false;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let hoverScale = 1;
    let hoveredCard: HTMLButtonElement | null = null;

    const resetFace = (element: HTMLElement | null) => {
      if (!element) return;
      gsap.to(element, {
        rotationX: 0,
        rotationY: 0,
        z: 0,
        scale: 1,
        duration: 0.58,
        ease: "back.out(1.45)",
        overwrite: true,
        onUpdate: () => {
          element.style.setProperty("--shine-x", "50%");
          element.style.setProperty("--shine-y", "40%");
          element.style.setProperty("--tilt-shade", "0");
        },
      });
    };

    const render = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      const pressure = Math.min(1, Math.hypot(currentX, currentY));
      if (face) {
        gsap.set(face, {
          rotationX: currentY * -10,
          rotationY: currentX * 14,
          transformPerspective: 720,
          transformOrigin: "50% 50%",
          z: pressure * 24,
          scale: hoverScale + pressure * 0.009,
        });
        face.style.setProperty("--shine-x", `${50 + currentX * 36}%`);
        face.style.setProperty("--shine-y", `${45 + currentY * 32}%`);
        face.style.setProperty("--tilt-shade", `${Math.abs(currentX) * 0.14}`);
      }
      if (hovering && (Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002)) frame = requestAnimationFrame(render);
      else frame = 0;
    };

    const move = (event: PointerEvent) => {
      if (root.dataset.morphing === "true" || root.dataset.loading === "true") { leave();return; }
      let card = (event.target as Element | null)?.closest?.("[data-index]") as HTMLButtonElement | null;
      if (!card) {
        let closestDistance = Number.POSITIVE_INFINITY;
        cardRefs.current.forEach((candidate) => {
          if (!candidate || candidate.style.visibility === "hidden" || candidate.style.pointerEvents === "none") return;
          const rect = candidate.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
          const distance = Math.hypot(event.clientX - (rect.left + rect.width / 2), event.clientY - (rect.top + rect.height / 2));
          if (distance < closestDistance) {
            closestDistance = distance;
            card = candidate;
          }
        });
      }

      const nextFace = card?.querySelector<HTMLElement>("[data-cover-face]") ?? null;
      if (!card || !nextFace) {
        leave();
        return;
      }
      if (nextFace !== face) {
        resetFace(face);
        if (hoveredCard) hoveredCard.dataset.hovered = "false";
        card.dataset.hovered = "true";
        hoveredCard = card;
        face = nextFace;
        currentX = 0;
        currentY = 0;
      }
      hoverScale = root.dataset.view === "grid" ? 1.07 : card.dataset.active === "true" ? 1.024 : 1.012;
      const rect = card.getBoundingClientRect();
      targetX = gsap.utils.clamp(-1, 1, ((event.clientX - rect.left) / rect.width) * 2 - 1);
      targetY = gsap.utils.clamp(-1, 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
      hovering = true;
      if (!frame) frame = requestAnimationFrame(render);
    };

    const leave = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      hovering = false;
      targetX = 0;
      targetY = 0;
      resetFace(face);
      if (hoveredCard) hoveredCard.dataset.hovered = "false";
      hoveredCard = null;
      face = null;
    };

    root.addEventListener("pointermove", move);
    root.addEventListener("pointerleave", leave);
    const visibility = () => { if (document.hidden) leave(); };
    document.addEventListener("visibilitychange", visibility);
    const faces = cardRefs.current.map((card) => card?.querySelector("[data-cover-face]")).filter(Boolean);
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      faces.forEach((element) => { if (element) gsap.killTweensOf(element); });
      if (hoveredCard) hoveredCard.dataset.hovered = "false";
    };
  }, [cardRefs, rootRef]);
}
