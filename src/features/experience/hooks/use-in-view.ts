"use client";

import { type RefObject, useEffect, useState } from "react";

export function useInView(ref: RefObject<Element | null>, rootMargin = "200px", threshold = 0) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // `isIntersecting` is true for any overlap, so a threshold also needs the ratio checked.
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= threshold),
      { rootMargin, threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold]);

  return inView;
}
