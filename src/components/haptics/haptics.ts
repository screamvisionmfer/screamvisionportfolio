type Feedback = "tap" | "tick" | "select" | "unseal" | "reveal";
const key = "portfolio:haptics";
let enabled: boolean | undefined;
let busyUntil = 0, priority = 0, touchedAt = -Infinity;
export function supportsHaptics() {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function" &&
    (navigator.maxTouchPoints > 0 || window.matchMedia("(any-pointer: coarse)").matches);
}
export function readHaptics() {
  if (enabled === undefined) {
    try { enabled = localStorage.getItem(key) !== "false"; } catch { enabled = true; }
  }
  return enabled;
}
export function stopHaptics() {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try { navigator.vibrate(0); } catch { /* Optional hardware feedback. */ }
  }
  busyUntil = 0; priority = 0;
}
export function setHaptics(value: boolean) {
  enabled = value;
  try { localStorage.setItem(key, String(value)); } catch { /* Storage is optional. */ }
  if (!value) stopHaptics();
}
export function noteHapticTouch() { touchedAt = performance.now(); }
/** Timing controls perceived strength; motor amplitude is not exposed by the web API. */
export function haptic(kind: Feedback, speed = 0) {
  if (!supportsHaptics() || !readHaptics() || document.visibilityState !== "visible" ||
    (navigator.userActivation && !navigator.userActivation.hasBeenActive)) return;
  const now = performance.now();
  if (kind === "tick" && now - touchedAt > 1800) return;
  const level = kind === "unseal" || kind === "reveal" ? 2 : kind === "select" ? 1 : 0;
  if (now < busyUntil && level <= priority) return;
  const pulse = Math.round(6 + Math.min(1, Math.abs(speed) / 1.8) * 19);
  const pattern = kind === "unseal" ? [10,45,16,65,28] : kind === "reveal" ? [18,45,32] : kind === "select" ? 14 : kind === "tick" ? pulse : 8;
  try {
    if (navigator.vibrate(pattern)) {
      priority = level;
      busyUntil = now + (Array.isArray(pattern) ? pattern.reduce((a,b) => a+b,0) + 80 : 90);
    }
  } catch { /* Blocked vibration must never interrupt navigation. */ }
}
