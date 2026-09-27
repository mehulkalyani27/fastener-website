import { sectionRoutes, type SectionTarget } from "@/data/sections";
import { prefersReducedMotion } from "@/features/experience/lib/media";

/** Share of the viewport below the sticky header at which a section counts as the active one. */
const ACTIVE_LINE = 0.3;
/** A programmatic scroll is over once no scroll event has fired for this long. */
const SETTLE_MS = 150;
const MAX_PROGRAMMATIC_MS = 2500;

let programmatic = false;
let cancelProgrammatic: (() => void) | undefined;

/** Height of the sticky header, measured (not hard-coded), so it adapts to any breakpoint. */
export function headerHeight() {
  return document.querySelector<HTMLElement>("[data-site-header]")?.offsetHeight ?? 0;
}

export function sectionElement(target: SectionTarget) {
  return target === "home" ? null : document.getElementById(target);
}

/** Whether a scroll is in flight because we started it (clicks, direct loads, back/forward). */
export function isProgrammaticScroll() {
  return programmatic;
}

/**
 * Scrolls so the section starts just below the sticky header (the Thread stage pins exactly there).
 * While it runs, scroll-driven URL sync is paused so passing sections don't rewrite the URL.
 * Returns false if the section is not on this page.
 */
export function scrollToSection(target: SectionTarget, behavior: ScrollBehavior = "smooth") {
  const element = sectionElement(target);
  if (target !== "home" && !element) return false;
  const top = element ? element.getBoundingClientRect().top + window.scrollY - headerHeight() : 0;

  cancelProgrammatic?.();
  programmatic = true;
  let idle = 0;
  const finish = () => {
    programmatic = false;
    window.clearTimeout(idle);
    window.clearTimeout(limit);
    window.removeEventListener("scroll", onScroll);
    cancelProgrammatic = undefined;
  };
  const onScroll = () => {
    window.clearTimeout(idle);
    idle = window.setTimeout(finish, SETTLE_MS);
  };
  const limit = window.setTimeout(finish, MAX_PROGRAMMATIC_MS);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  cancelProgrammatic = finish;

  window.scrollTo({ top, behavior: behavior === "smooth" && prefersReducedMotion() ? "instant" : behavior });
  return true;
}

/**
 * The section the reader is in: the last listed section whose top has passed a line 30% down the
 * area below the header (so a heading scrolled just under the header already counts, but a
 * section merely peeking in at the bottom does not). At the very bottom of the page the last
 * section wins, since it may be too short to reach the line.
 */
export function activeSection(): SectionTarget {
  const header = headerHeight();
  const line = header + (window.innerHeight - header) * ACTIVE_LINE;
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  let active: SectionTarget = "home";
  for (const { slug } of sectionRoutes) {
    const element = document.getElementById(slug);
    if (element && (element.getBoundingClientRect().top <= line || atBottom)) active = slug;
  }
  return active;
}
