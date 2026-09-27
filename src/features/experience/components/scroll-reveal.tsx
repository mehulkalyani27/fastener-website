"use client";

import { gsap } from "gsap";
import { useEffect } from "react";
import { prefersReducedMotion } from "@/features/experience/lib/media";

/**
 * Fades in [data-reveal] elements as they scroll into view. Only elements still below the
 * viewport at mount are hidden, and visibility is driven by IntersectionObserver (not cached
 * scroll positions), so content already on screen, scrolled past, or shifted by late layout
 * is never left invisible. Without JS everything is simply visible.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const pending = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
      (element) => element.getBoundingClientRect().top > window.innerHeight,
    );
    if (!pending.length) return;

    gsap.set(pending, { autoAlpha: 0, y: 24 });

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
        if (!visible.length) return;
        visible.forEach((element) => observer.unobserve(element));
        gsap.to(visible, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    pending.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      gsap.killTweensOf(pending);
      gsap.set(pending, { clearProps: "opacity,visibility,transform" });
    };
  }, []);

  return null;
}
