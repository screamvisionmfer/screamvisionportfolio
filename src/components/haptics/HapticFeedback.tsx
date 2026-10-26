"use client";
import { useEffect } from "react";
import { haptic, noteHapticTouch, stopHaptics } from "./haptics";
export function HapticFeedback() {
  useEffect(() => {
    const touch = (event: PointerEvent) => { if (event.pointerType === "touch") noteHapticTouch(); };
    const click = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("button,a,input[type='checkbox'],input[type='radio'],[role='button']") : null;
      if (!event.isTrusted || !target || target.closest("[data-haptic='off'],[disabled],[aria-disabled='true']")) return;
      haptic("tap");
    };
    const hide = () => { if (document.hidden) stopHaptics(); };
    document.addEventListener("pointerdown", touch, { passive:true, capture:true });
    document.addEventListener("pointermove", touch, { passive:true, capture:true });
    document.addEventListener("pointerup", touch, { passive:true, capture:true });
    document.addEventListener("click", click);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", stopHaptics);
    return () => {
      document.removeEventListener("pointermove", touch, true);document.removeEventListener("pointerdown", touch, true);document.removeEventListener("pointerup", touch, true);
      document.removeEventListener("click", click);document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pagehide", stopHaptics);stopHaptics();
    };
  }, []);
  return null;
}
