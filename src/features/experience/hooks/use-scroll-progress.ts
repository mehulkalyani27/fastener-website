"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type RefObject, useEffect, useRef } from "react";

export function useScrollProgress(
  ref: RefObject<Element | null>,
  enabled: boolean,
  options: { start?: string; end?: string } = {},
) {
  const progress = useRef(0);
  const { start = "top top", end = "bottom top" } = options;

  useEffect(() => {
    const trigger = ref.current;
    if (!enabled || !trigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const instance = ScrollTrigger.create({
      trigger,
      start,
      end,
      onUpdate: (self) => {
        progress.current = self.progress;
      },
    });
    return () => instance.kill();
  }, [ref, enabled, start, end]);

  return progress;
}
