"use client";

import dynamic from "next/dynamic";
import { type FocusEvent, type PointerEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/container";
import { useCanRender3D } from "@/features/experience/hooks/use-can-render-3d";
import { useCanvasMount } from "@/features/experience/hooks/use-canvas-mount";
import { useHydrated } from "@/features/experience/hooks/use-hydrated";
import { useInView } from "@/features/experience/hooks/use-in-view";
import { useMediaQuery } from "@/features/experience/hooks/use-media-query";
import { usePageVisible } from "@/features/experience/hooks/use-page-visible";
import { usePerfCycle, usePerfMount, usePerfSection } from "@/features/experience/hooks/use-perf";
import { SPLIT_QUERY } from "@/features/experience/lib/media";
import { perfImport, perfMark } from "@/features/experience/lib/perf";
import { StoryControls } from "@/features/industries/components/story-controls";
import { type PlaybackFrame, usePlayback } from "@/features/industries/hooks/use-playback";
import { createRenderControl } from "@/features/industries/lib/render-control";
import { chapterAt, chapterProgress, fade, smoothstep, type Tier, windowProgress } from "@/features/industries/lib/story";
import { CHAPTER_COUNT, INDUSTRY_SCENES } from "@/features/industries/scenes";
import type { IndustryStoryChapter } from "@/types/content";

const IndustryCanvas = dynamic(() => perfImport("industries", import("@/features/industries/three/industry-canvas")), {
  ssr: false,
});

const TABLET_QUERY = "(min-width: 40rem)";
const DESKTOP_QUERY = "(min-width: 80rem)";
/** Share of the stage that must be on screen for the story to play. */
const PLAY_VISIBILITY = 0.35;

export type IndustryStoryText = IndustryStoryChapter & { industry: string };

type IndustryStoryProps = {
  /** One per scene in INDUSTRY_SCENES, matched by slug. */
  chapters: readonly IndustryStoryText[];
  /** Shown instead of the story without 3D (no WebGL, reduced motion, data saver) and before hydration. */
  fallback: ReactNode;
};

/** Chapter text dips out and in around each cut, while the canvas passes through the screw head. */
function chapterTextOpacity(index: number, t: number) {
  const enter = index === 0 ? 1 : smoothstep(windowProgress(t, [0, 0.05]));
  const exit = index === CHAPTER_COUNT - 1 ? 1 : 1 - smoothstep(windowProgress(t, [0.95, 1]));
  return Math.min(enter, exit);
}

/**
 * Auto-playing application story, one chapter per industry. A clock (usePlayback) advances the
 * story's progress 0..1; the HTML text is written from it here and the 3D scene reads the same
 * value each frame, so both always agree. Nothing starts until the canvas has rendered its first
 * frame that drew the model; the clock then runs only while the story is on screen and the tab is
 * visible. Reduced motion, no WebGL and data saver get the plain cards.
 */
export function IndustryStory({ chapters, fallback }: IndustryStoryProps) {
  const track = useRef<HTMLDivElement>(null);
  const textLayer = useRef<HTMLDivElement>(null);
  const canvasBox = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [control] = useState(createRenderControl);
  const hydrated = useHydrated();
  const canRender = useCanRender3D();
  const split = useMediaQuery(SPLIT_QUERY);
  const tablet = useMediaQuery(TABLET_QUERY);
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const pageVisible = usePageVisible();
  const story = hydrated && canRender;
  const tier: Tier = desktop && split ? "desktop" : tablet ? "tablet" : "mobile";
  const texts = INDUSTRY_SCENES.map((scene) => chapters.find((chapter) => chapter.slug === scene.slug)!);

  // The canvas is prepared before the story is on screen (while the page is idle, or at the latest
  // within a screen of it) and kept, so it has already rendered its first frame on arrival. The track
  // element is rendered in both modes so these observers attach on the first render.
  const near = useInView(track, "100% 0px");
  const onScreen = useInView(track, "0px", PLAY_VISIBILITY);

  const [chapter, setChapter] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [ready, setReady] = useState(false);
  const mounted = useCanvasMount("industries", { near, ready, skip: hydrated && !canRender });
  const onReady = useCallback(() => setReady(true), []);
  // The story holds still while the pointer is over it or keyboard focus is inside it (WCAG 2.2.2).
  const running = story && onScreen && pageVisible && ready && !hovered && !focused;

  useEffect(() => {
    if (!ready && canvasBox.current) canvasBox.current.style.opacity = "0";
  }, [ready]);

  usePerfMount("industries");
  usePerfSection(track, "industries");
  usePerfCycle("industries", story && mounted);

  const render = useCallback(({ progress: value, veil, chapter: index }: PlaybackFrame) => {
    perfMark("industries", "scroll-driver-ready");
    if (canvasBox.current) canvasBox.current.style.opacity = String(1 - veil);
    setChapter(index);
    const layer = textLayer.current;
    if (!layer) return;
    const { index: current, t } = chapterAt(value, CHAPTER_COUNT);
    const set = (selector: string, apply: (element: HTMLElement) => void) => {
      const element = layer.querySelector<HTMLElement>(selector);
      if (element) apply(element);
    };

    INDUSTRY_SCENES.forEach((scene, chapterIndex) => {
      const isCurrent = chapterIndex === current;
      const shown = isCurrent ? chapterTextOpacity(chapterIndex, t) * (1 - veil) : 0;
      set(`[data-chapter-title="${chapterIndex}"]`, (element) => {
        element.style.opacity = String(shown);
      });
      set(`[data-chapter-why="${chapterIndex}"]`, (element) => {
        const opacity = Math.min(shown, fade(t, scene.why));
        element.style.opacity = String(opacity);
        element.style.transform = `translate3d(0, ${(1 - opacity) * 12}px, 0)`;
      });
      scene.captions.forEach(({ key, window }) => {
        set(`[data-caption="${chapterIndex}:${key}"]`, (element) => {
          element.style.opacity = isCurrent && t >= window[0] && t < window[1] ? "1" : "0";
        });
      });
      set(`[data-chapter-bar="${chapterIndex}"]`, (element) => {
        element.style.transform = `scaleX(${chapterProgress(value, chapterIndex, CHAPTER_COUNT)})`;
      });
    });
  }, []);

  const { goTo } = usePlayback({ count: CHAPTER_COUNT, running, ready, progress, control, onFrame: render });

  // Mouse only: a touch tap must not leave the story held. Focus counts only when it comes from the
  // keyboard (`:focus-visible`), so clicking a step does not freeze playback until focus moves away.
  const onPointerEnter = (event: PointerEvent) => setHovered(event.pointerType === "mouse");
  const onPointerLeave = () => setHovered(false);
  const onFocus = (event: FocusEvent) => setFocused(event.target.matches(":focus-visible"));
  const onBlur = (event: FocusEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  // Announced only when the user picks an industry, not on every automatic change.
  const showIndustry = (index: number) => {
    goTo(index);
    setAnnouncement(`Showing industry ${index + 1} of ${CHAPTER_COUNT}: ${texts[index].industry}`);
  };

  // One wrapper element in both modes (same position, same type), so React keeps the same DOM node
  // when the story takes over and the observers above keep watching it.
  return (
    <div ref={track}>
      {story ? (
        <div
          className="h-[calc(100svh-var(--spacing-header))]"
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          <Container className="grid h-full grid-rows-[minmax(0,1fr)_auto] gap-4 py-4 sm:gap-6 sm:py-6 split:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] split:grid-rows-1 split:items-center split:gap-12 split:py-10 short:py-4">
            <div aria-hidden="true" className="relative min-h-0 split:order-2 split:h-full">
              {/* Invisible until the first usable frame, then faded in by the playback clock. */}
              <div ref={canvasBox} className="absolute inset-0 opacity-0">
                {mounted && (
                  <IndustryCanvas
                    progress={progress}
                    tier={tier}
                    control={control}
                    active={running}
                    onReady={onReady}
                  />
                )}
              </div>
              <p className="pointer-events-none absolute bottom-2 left-2 text-xs text-muted">
                Illustrative visualization — not to scale
              </p>
            </div>

            <div ref={textLayer} className="min-w-0 split:order-1">
              <div className="grid">
                {texts.map((text, index) => (
                  <div
                    key={text.slug}
                    data-chapter-title={index}
                    className={`col-start-1 row-start-1 ${index ? "opacity-0" : ""}`}
                  >
                    <h3 className="text-2xl leading-tight font-semibold tracking-[-0.02em] sm:text-heading short:text-2xl">
                      {text.industry}
                    </h3>
                    <p className="mt-3 text-lg text-muted max-sm:sr-only short:mt-1.5 short:text-base">{text.application}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 sm:mt-6 short:mt-2">
                <StoryControls
                  names={texts.map((text) => text.industry)}
                  chapter={chapter}
                  onGo={showIndustry}
                />
                <p className="sr-only" aria-live="polite">
                  {announcement}
                </p>
              </div>

              <div aria-hidden="true" className="mt-2 grid sm:mt-3 short:hidden">
                {texts.flatMap((text, index) =>
                  INDUSTRY_SCENES[index].captions.map(({ key }) => (
                    <p
                      key={`${index}:${key}`}
                      data-caption={`${index}:${key}`}
                      className="eyebrow col-start-1 row-start-1 text-muted opacity-0 transition-opacity duration-200"
                    >
                      {text.captions[key]}
                    </p>
                  )),
                )}
              </div>

              <div className="mt-3 grid sm:mt-5 short:mt-3">
                {texts.map((text, index) => (
                  <p
                    key={text.slug}
                    data-chapter-why={index}
                    className="col-start-1 row-start-1 max-w-md text-sm leading-relaxed opacity-0 sm:text-base split:text-lg short:text-sm"
                  >
                    {text.why}
                  </p>
                ))}
              </div>
            </div>
          </Container>
        </div>
      ) : (
        fallback
      )}
    </div>
  );
}
