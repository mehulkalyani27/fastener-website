"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/container";
import { useCanRender3D } from "@/features/experience/hooks/use-can-render-3d";
import { useCanvasMount } from "@/features/experience/hooks/use-canvas-mount";
import { useHydrated } from "@/features/experience/hooks/use-hydrated";
import { useInView } from "@/features/experience/hooks/use-in-view";
import { useMediaQuery } from "@/features/experience/hooks/use-media-query";
import { usePerfCycle, usePerfMount, usePerfSection } from "@/features/experience/hooks/use-perf";
import { perfImport, perfMark } from "@/features/experience/lib/perf";
import { REDUCED_MOTION_QUERY, SPLIT_QUERY } from "@/features/experience/lib/media";
import {
  type Assembly,
  assemblyPose,
  computeAssembly,
  HALF,
  REACH,
  type Rect,
  entryDistance,
  THREAD_STORY,
  titleState,
} from "@/features/experience/lib/thread-story";
import { formatIndex } from "@/lib/format";
import type { ThreadPanel } from "@/types/content";

const ThreadedScene = dynamic(() => perfImport("thread", import("@/features/experience/three/threaded-scene")), {
  ssr: false,
});

// Each title sits where the rising diagonal ("\\") leaves space at its moment: side sets the
// alignment and entry direction, row the vertical anchor.
const SLOT_SIDE = { right: "right-0 items-end text-right", left: "left-0 items-start text-left" };
const SLOT_ROW = { top: "top-[8%] short:top-[6%]", bottom: "bottom-[8%] short:bottom-[6%]" };
// Starts hidden; the scroll-driven render sets each title's opacity and slide on its first pass.
const slotClass = (panel: ThreadPanel) => `absolute opacity-0 ${SLOT_SIDE[panel.side]} ${SLOT_ROW[panel.row]}`;

function ThreadTitle({ panel, index, className }: { panel: ThreadPanel; index: number; className: string }) {
  return (
    <article data-thread-state data-side={panel.side} className={`flex w-max max-w-full flex-col ${className}`}>
      <p className="eyebrow text-ink-accent">
        {formatIndex(index)} — {panel.label}
      </p>
      <h4
        className={`thread-title mt-4 leading-[0.9] font-black tracking-[-0.01em] whitespace-nowrap uppercase short:mt-2 ${
          index % 2 ? "text-ink-accent" : "text-ink-foreground"
        }`}
      >
        {panel.word}
      </h4>
      <p className="mt-5 max-w-xs text-base leading-relaxed text-ink-muted short:mt-3 short:text-sm sm:max-w-sm sm:text-lg">
        {panel.line}
      </p>
    </article>
  );
}

/** Layout-box rect of each title in stage coordinates, in story order (offset* ignores GSAP transforms). */
function measureTitles(stage: HTMLElement): Rect[] | null {
  const blocks = Array.from(stage.querySelectorAll<HTMLElement>("[data-thread-state]"));
  const parent = blocks[0]?.offsetParent;
  if (!parent) return null;
  const origin = parent.getBoundingClientRect();
  const stageBox = stage.getBoundingClientRect();
  return blocks.map((block) => {
    const left = origin.left - stageBox.left + block.offsetLeft;
    const top = origin.top - stageBox.top + block.offsetTop;
    return { left, top, right: left + block.offsetWidth, bottom: top + block.offsetHeight };
  });
}

/** Flat stand-in for the self-drilling screw, drawn at the assembly's mid-sequence pose when WebGL is unavailable. */
function FlatFastener({ assembly }: { assembly: Assembly }) {
  const k = assembly.pxPerUnit;
  const pose = assemblyPose(assembly, 0.5);
  const style: CSSProperties = {
    left: pose.x,
    top: pose.y,
    transform: `rotate(${pose.angle}rad)`,
  };
  const bar = (from: number, to: number, half: number, className: string) => (
    <span
      className={`absolute ${className}`}
      style={{ left: from * k, width: (to - from) * k, top: -half * k, height: half * 2 * k }}
    />
  );
  return (
    <div aria-hidden="true" className="absolute size-0" style={style}>
      {bar(-REACH.headUnderside, REACH.tip, HALF.shank, "rounded-sm bg-ink-accent/35")}
      {bar(-REACH.headUnderside, -REACH.headUnderside + REACH.washer, HALF.head, "rounded-sm bg-ink-border")}
      {bar(-REACH.flangeTop, -REACH.headUnderside, HALF.flange, "rounded-sm bg-ink-accent/60")}
    </div>
  );
}

/**
 * Pinned storytelling stage for the Thread section. One ScrollTrigger maps the track's scroll
 * position to progress 0..1. From that single value: titles take their opacity and slide from
 * titleState, the scene lifts the whole screw up the stage (assemblyPose) and turns it about its
 * axis. The assembly's scale, angle and anchor are fitted to the measured titles on resize.
 * Reduced motion (and the server render) gets a plain list.
 */
export function ThreadedStory({ panels }: { panels: ThreadPanel[] }) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [assembly, setAssembly] = useState<Assembly | null>(null);
  const hydrated = useHydrated();
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const split = useMediaQuery(SPLIT_QUERY);
  const canRender = useCanRender3D();
  const inView = useInView(track);
  // The canvas is prepared before the section is reached (while the page is idle, or at the latest
  // within a screen of it) and kept, so its first frame is already drawn on arrival; it is paused
  // when off screen.
  const near = useInView(track, "100% 0px");
  const story = hydrated && !reducedMotion;
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const mounted = useCanvasMount("thread", { near, ready, skip: hydrated && (reducedMotion || !canRender) });

  usePerfMount("thread");
  usePerfSection(track, "thread");
  usePerfCycle("thread", story && canRender && mounted && assembly !== null);

  useEffect(() => {
    const element = stage.current;
    if (!story || !element) return;

    let frame = 0;
    const directions = panels.map((panel) => (panel.side === "left" ? -1 : 1));
    const measure = () => {
      const titles = measureTitles(element);
      if (!titles || titles.length < 2) return;
      setAssembly(
        computeAssembly(element.clientWidth, element.clientHeight, titles, directions, split ? "split" : "stacked"),
      );
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    element.querySelectorAll("[data-thread-state]").forEach((block) => observer.observe(block));
    document.fonts?.ready.then(schedule);
    schedule();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [story, split, panels]);

  useEffect(() => {
    const root = track.current;
    const element = stage.current;
    if (!story || !root || !element) return;
    gsap.registerPlugin(ScrollTrigger);

    const blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-thread-state]"));
    // Titles are written straight from titleState(progress) — the same function the layout search
    // checks — so what is on screen is exactly what was validated, forward or backward.
    const render = (value: number) => {
      progress.current = value;
      const distance = entryDistance(element.clientWidth);
      blocks.forEach((block, index) => {
        const { opacity, shift } = titleState(index, value);
        const direction = block.dataset.side === "left" ? -1 : 1;
        block.style.opacity = String(opacity);
        block.style.transform = `translate3d(${shift * distance * direction}px, 0, 0)`;
      });
    };

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top 75%",
      end: "bottom bottom",
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => render(self.progress),
    });
    render(trigger.progress);
    perfMark("thread", "scroll-driver-ready");

    return () => {
      trigger.kill();
      blocks.forEach((block) => {
        block.style.opacity = "";
        block.style.transform = "";
      });
    };
  }, [story]);

  return (
    <div ref={track} className="relative" style={story ? { height: THREAD_STORY.trackHeight } : undefined}>
      {story ? (
        <div
          ref={stage}
          className="sticky top-[var(--spacing-header)] h-[calc(100svh-var(--spacing-header))] overflow-hidden"
        >
          {assembly && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              {canRender ? (
                mounted && <ThreadedScene progress={progress} assembly={assembly} active={inView} onReady={onReady} />
              ) : (
                <FlatFastener assembly={assembly} />
              )}
            </div>
          )}
          <Container className="relative h-full">
            <div className="relative h-full">
              {panels.map((panel, index) => (
                <ThreadTitle key={panel.word} panel={panel} index={index} className={slotClass(panel)} />
              ))}
            </div>
          </Container>
        </div>
      ) : (
        <Container className="flex flex-col gap-block py-section">
          {panels.map((panel, index) => (
            <ThreadTitle
              key={panel.word}
              panel={panel}
              index={index}
              className={panel.side === "right" ? "self-end items-end text-right" : "items-start"}
            />
          ))}
        </Container>
      )}
    </div>
  );
}
