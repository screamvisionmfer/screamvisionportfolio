/** Shared lifecycle for media and animation behind the mobile navigation. */
export const isPageActive = () => !document.hidden && document.documentElement.dataset.navigationOpen !== "true";

export function observePageActivity(sync: () => void) {
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("portfolio:navigation", sync);
  return () => {
    document.removeEventListener("visibilitychange", sync);
    window.removeEventListener("portfolio:navigation", sync);
  };
}
