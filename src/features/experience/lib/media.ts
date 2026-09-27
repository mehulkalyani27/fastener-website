export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

/** Must match the `split` custom variant in globals.css. */
export const SPLIT_QUERY = "(min-width: 64rem), (min-width: 40rem) and (orientation: landscape)";

export function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function readCssColor(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}
