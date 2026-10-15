"use client";

import { useEffect, useRef } from "react";

/** Keep keyboard interaction inside an open overlay and restore its trigger. */
export function useModalFocus<T extends HTMLElement>(open: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!open || !root) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const siblings = new Map<HTMLElement, boolean>();
    let branch: HTMLElement = root;
    while (branch.parentElement) {
      for (const sibling of Array.from(branch.parentElement.children)) {
        if (sibling instanceof HTMLElement && sibling !== branch) { siblings.set(sibling, sibling.inert); sibling.inert = true; }
      }
      if (branch.parentElement === document.body) break;
      branch = branch.parentElement;
    }
    const focusable = () => Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]')).filter((node) => node.getClientRects().length && !node.closest('[inert]'));
    (focusable()[0] ?? root).focus({ preventScroll: true });
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0] ?? root, last = items[items.length - 1] ?? root;
      if (!items.length || (event.shiftKey && (document.activeElement === first || document.activeElement === root)) || (!event.shiftKey && document.activeElement === last)) {
        event.preventDefault(); (event.shiftKey ? last : first).focus();
      }
    };
    root.addEventListener("keydown", trap);
    return () => {
      root.removeEventListener("keydown", trap);
      siblings.forEach((inert, node) => { node.inert = inert; });
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open]);
  return ref;
}
