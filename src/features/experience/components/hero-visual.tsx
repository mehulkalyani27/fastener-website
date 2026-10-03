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
          <ScrewIllustration />
        </div>
      )}
    </div>
  );
}

/**
 * Flat self-drilling hex head screw for when WebGL is unavailable: hex head on its flange, a black
 * EPDM sealing washer under it, a threaded shank and a long, fluted Tek drill point.
 */
function ScrewIllustration() {
  return (
    <svg
      viewBox="0 0 200 320"
      className="h-full w-auto text-ink-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      {/* Hex head (side view: three faces) on its flange */}
      <path d="M77 20h46l3 4v19l-3 4H77l-3-4V24z" />
      <path d="M92 20v27M108 20v27" opacity="0.6" />
      <path d="M71 47h58a2 2 0 0 1 2 2v4H69v-4a2 2 0 0 1 2-2z" />
      {/* EPDM sealing washer directly under the flange */}
      <rect x="60" y="53" width="80" height="13" rx="3" fill="currentColor" fillOpacity="0.4" />
      {/* Threaded shank */}
      <path d="M86 66v129M114 66v129" />
      {Array.from({ length: 15 }, (_, index) => (
        <path key={index} d={`M86 ${76 + index * 8}l28 -5`} opacity="0.6" />
      ))}
      {/* Drill point: long twisted flutes ending in a chisel tip */}
      <path d="M86 195v70l14 15 14-15v-70" />
      <path d="M86 212l28 -9M86 232l28 -9M88 252l24 -8" opacity="0.7" />
    </svg>
  );
}
