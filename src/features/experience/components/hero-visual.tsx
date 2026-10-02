"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useCanRender3D } from "@/features/experience/hooks/use-can-render-3d";
import { useInView } from "@/features/experience/hooks/use-in-view";
import { useMediaQuery } from "@/features/experience/hooks/use-media-query";
import { useScrollProgress } from "@/features/experience/hooks/use-scroll-progress";
import { SPLIT_QUERY } from "@/features/experience/lib/media";

const HeroScene = dynamic(() => import("@/features/experience/three/hero-scene"), { ssr: false });

/** Stacked: a band of height --hero-visual at the top. Split: the whole hero. */
export function HeroVisual() {
  const container = useRef<HTMLDivElement>(null);
  const section = useRef<Element | null>(null);
  const canRender = useCanRender3D();
  const split = useMediaQuery(SPLIT_QUERY);
  const inView = useInView(container);
  // Unmounted (freeing its WebGL context) when more than a screen away; paused when off screen.
  const near = useInView(container, "100% 0px");
  const progress = useScrollProgress(section, canRender);

  return (
    <div
      ref={(node) => {
        container.current = node;
        section.current = node?.closest("section") ?? null;
      }}
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-[var(--hero-visual)] split:inset-y-0 split:h-auto"
    >
      {canRender ? (
        near && <HeroScene progress={progress} active={inView} layout={split ? "split" : "stacked"} />
      ) : (
        <div className="flex h-full items-center justify-center py-8 split:ml-auto split:w-1/2 split:py-16">
          <BoltIllustration />
        </div>
      )}
    </div>
  );
}

function BoltIllustration() {
  return (
    <svg
      viewBox="0 0 200 320"
      className="h-full w-auto text-ink-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M50 20h100l12 20v40l-12 20H50L38 80V40z" />
      <path d="M72 100v200l28 16 28-16V100" />
      {Array.from({ length: 14 }, (_, index) => (
        <path key={index} d={`M72 ${170 + index * 9}l56 -6`} opacity="0.6" />
      ))}
    </svg>
  );
}
