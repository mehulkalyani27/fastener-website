"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { prefersReducedMotion } from "@/features/experience/lib/media";

/** Lenis smooth scrolling driven by the GSAP ticker so ScrollTrigger stays in sync. */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ autoRaf: false });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
