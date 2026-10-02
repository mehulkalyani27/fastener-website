"use client";

import { type RefObject, useCallback, useEffect, useRef } from "react";
import {
  CHAPTER_SECONDS,
  initialPlayback,
  isAnimating,
  playbackChapter,
  playbackProgress,
  seekTo,
  stepPlayback,
} from "@/features/industries/lib/playback";
import type { RenderControl } from "@/features/industries/lib/render-control";

export type PlaybackFrame = { progress: number; veil: number; chapter: number };

type PlaybackOptions = {
  count: number;
  /** The clock advances: on screen, tab shown, and the first usable 3D frame has rendered. */
  running: boolean;
  /** The canvas exists and has rendered its first usable frame; the clock may animate (fade in, jump). */
  ready: boolean;
  /** Written with the story's progress (0 → 1) for the 3D scene to read each frame. */
  progress: RefObject<number>;
  control: RenderControl;
  onFrame: (frame: PlaybackFrame) => void;
};

/**
 * Drives the story with a clock instead of scroll. Frames are scheduled only while something is
 * animating, and each one also wakes the canvas, so a paused or off-screen story costs nothing.
 */
export function usePlayback(options: PlaybackOptions) {
  const { running, ready, control } = options;
  const state = useRef(initialPlayback());
  const latest = useRef(options);
  const start = useRef<() => void>(() => {});

  useEffect(() => {
    latest.current = options;
  });

  const publish = useCallback(() => {
    const { count, progress, onFrame } = latest.current;
    progress.current = playbackProgress(state.current, count);
    onFrame({ progress: progress.current, veil: state.current.veil, chapter: playbackChapter(state.current, count) });
  }, []);

  useEffect(() => {
    if (!ready) {
      // The next time the canvas is ready the scene fades in again rather than popping.
      state.current = { ...state.current, veil: 1, pending: null };
      start.current = () => {};
      return;
    }

    let id = 0;
    let last = 0;
    const tick = (now: number) => {
      id = 0;
      const dt = last ? (now - last) / 1000 : 0;
      last = now;
      const { count, running: advancing } = latest.current;
      state.current = stepPlayback(state.current, dt, advancing, count);
      const animating = isAnimating(state.current, advancing);
      publish();
      control.setAnimating(animating);
      control.wake();
      if (animating) id = requestAnimationFrame(tick);
    };
    start.current = () => {
      if (id) return;
      last = 0;
      id = requestAnimationFrame(tick);
    };
    start.current();
    return () => {
      cancelAnimationFrame(id);
      control.setAnimating(false);
    };
  }, [ready, control, publish]);

  useEffect(() => {
    start.current();
  }, [running]);

  const goTo = useCallback(
    (chapter: number) => {
      const { count, ready: canAnimate } = latest.current;
      const target = ((chapter % count) + count) % count;
      if (canAnimate) {
        state.current = seekTo(state.current, target);
        start.current();
      } else {
        state.current = { ...state.current, time: target * CHAPTER_SECONDS };
        publish();
      }
    },
    [publish],
  );

  return { goTo };
}
