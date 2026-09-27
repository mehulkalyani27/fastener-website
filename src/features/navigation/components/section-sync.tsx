"use client";

import { useEffect } from "react";
import { sectionFromPath, sectionPath } from "@/data/sections";
import { activeSection, isProgrammaticScroll, scrollToSection } from "@/features/navigation/lib/section-scroll";

/** How long a direct load keeps re-aligning to its section while late layout settles. */
const ALIGN_WINDOW_MS = 2500;

/**
 * Keeps the clean URL and the scroll position in step on the single-page home:
 * - direct loads (/about, /thread, …) are positioned at their section, re-aligning while fonts,
 *   3D and the pinned Thread track settle, until the reader scrolls themselves;
 * - scrolling replaces the URL with the section in view — only when it changes, never adding
 *   history entries and never while a programmatic scroll is running;
 * - Back/Forward scroll to the section of the restored URL.
 */
export function SectionSync() {
  useEffect(() => {
    window.history.scrollRestoration = "manual";

    // Direct load: align to the URL's section, and keep aligning as late layout shifts it.
    const initial = sectionFromPath(window.location.pathname);
    let aligning = initial !== null && initial !== "home";
    const align = () => {
      if (aligning && initial) scrollToSection(initial, "instant");
    };
    const resizeObserver = new ResizeObserver(align);
    const stopAligning = () => {
      aligning = false;
      resizeObserver.disconnect();
    };
    if (aligning) {
      resizeObserver.observe(document.body);
      requestAnimationFrame(() => requestAnimationFrame(align));
    }
    const alignLimit = window.setTimeout(stopAligning, ALIGN_WINDOW_MS);
    const userIntent = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    userIntent.forEach((type) => window.addEventListener(type, stopAligning, { passive: true }));

    // Scroll → URL, only when the active section changes.
    let frame = 0;
    const sync = () => {
      frame = 0;
      if (isProgrammaticScroll()) return;
      const path = sectionPath(activeSection());
      if (path !== window.location.pathname) window.history.replaceState(null, "", path);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };

    // Back/Forward: go to the restored URL's section.
    const onPopState = () => {
      stopAligning();
      const target = sectionFromPath(window.location.pathname);
      if (target) scrollToSection(target);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPopState);

    return () => {
      stopAligning();
      window.clearTimeout(alignLimit);
      cancelAnimationFrame(frame);
      userIntent.forEach((type) => window.removeEventListener(type, stopAligning));
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPopState);
      window.history.scrollRestoration = "auto";
    };
  }, []);

  return null;
}
