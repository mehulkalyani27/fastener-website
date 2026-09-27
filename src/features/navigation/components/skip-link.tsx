"use client";

import type { MouseEvent } from "react";

/** Skip link that moves focus to the main content without writing a #fragment into the URL. */
export function SkipLink({ targetId, className }: { targetId: string; className?: string }) {
  const skip = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: "start" });
  };

  return (
    <a href={`#${targetId}`} onClick={skip} className={className}>
      Skip to content
    </a>
  );
}
