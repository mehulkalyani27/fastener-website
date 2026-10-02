"use client";

import { type RefObject, useEffect } from "react";
import {
  perfBeginCycle,
  perfEndCycle,
  perfMark,
  type PerfScope,
  perfSection,
} from "@/features/experience/lib/perf";

/*
 * Development-only hooks for the 3D timing marks. In production each is a plain no-op function
 * that calls no React hooks. The environment check is inline (not an imported constant) so the
 * bundler can drop the development code from production builds.
 */
const noop = () => {};

function useMountMark(scope: PerfScope) {
  useEffect(() => perfMark(scope, "component-mount"), [scope]);
}

/** Marks when the section's element enters and leaves the viewport (no root margin). */
function useSectionMarks(ref: RefObject<Element | null>, scope: PerfScope) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver((entries) => {
      perfSection(scope, entries[entries.length - 1].isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, scope]);
}

/** One measurement cycle per time the canvas is wanted (requested → released). */
function useCanvasCycle(scope: PerfScope, wanted: boolean) {
  useEffect(() => {
    if (!wanted) return;
    perfBeginCycle(scope);
    // Taps and key presses, to show whether a frame renders only after one (a "tap to appear" bug).
    const onInput = (event: Event) => perfMark(scope, "user-input", { type: event.type });
    const types = ["pointerdown", "touchstart", "keydown"];
    types.forEach((type) => window.addEventListener(type, onInput, { capture: true, passive: true }));
    return () => {
      types.forEach((type) => window.removeEventListener(type, onInput, { capture: true }));
      perfEndCycle(scope);
    };
  }, [scope, wanted]);
}

/** Inside the canvas wrapper: its mount, and the moment the frame loop is allowed to run. */
function useCanvasMarks(scope: PerfScope, active: boolean) {
  useEffect(() => perfMark(scope, "canvas-mount"), [scope]);
  useEffect(() => {
    if (active) perfMark(scope, "frameloop-active");
  }, [scope, active]);
}

export const usePerfMount: (scope: PerfScope) => void = process.env.NODE_ENV === "development" ? useMountMark : noop;
export const usePerfSection: (ref: RefObject<Element | null>, scope: PerfScope) => void =
  process.env.NODE_ENV === "development" ? useSectionMarks : noop;
export const usePerfCycle: (scope: PerfScope, wanted: boolean) => void = process.env.NODE_ENV === "development" ? useCanvasCycle : noop;
export const usePerfCanvas: (scope: PerfScope, active: boolean) => void = process.env.NODE_ENV === "development" ? useCanvasMarks : noop;
