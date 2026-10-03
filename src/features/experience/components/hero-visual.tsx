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

/** Flat self-drilling hex head screw (hex head on a flange, threaded shank, fluted drill point) for when WebGL is unavailable. */
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
      <path d="M66 14h68l6 12v26l-6 8H66l-6-8V26z" />
      <path d="M92 14v46M108 14v46" opacity="0.6" />
      <path d="M52 60h96a4 4 0 0 1 4 4v6H48v-6a4 4 0 0 1 4-4z" />
      {/* Threaded shank */}
      <path d="M76 70v178M124 70v178" />
      {Array.from({ length: 16 }, (_, index) => (
        <path key={index} d={`M76 ${88 + index * 10}l48 -6`} opacity="0.6" />
      ))}
      {/* Fluted drill point */}
      <path d="M76 248l24 66 24-66" />
      <path d="M86 262l28 -8M92 280l16 -5" opacity="0.6" />
    </svg>
  );
}
