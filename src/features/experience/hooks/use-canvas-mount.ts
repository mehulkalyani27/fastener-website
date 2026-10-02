"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { isWarmTurn, type QueuedCanvas, settleCanvas, subscribeQueue } from "@/features/experience/lib/canvas-queue";

type CanvasMountOptions = {
  /** The section is within a screen of the viewport. */
  near: boolean;
  /** The canvas has rendered its first frame that drew the model. */
  ready: boolean;
  /** The canvas will never be used here (no WebGL, reduced motion): do not hold up the queue. */
  skip: boolean;
};

/**
 * True once the canvas should exist, and stays true: from when the section is near, or earlier when
 * it is this canvas's turn while the page is idle. A canvas is kept after it was created, because
 * tearing one down and creating another is what stalled the next context creation.
 */
export function useCanvasMount(id: QueuedCanvas, { near, ready, skip }: CanvasMountOptions) {
  const turn = useSyncExternalStore(
    subscribeQueue,
    () => isWarmTurn(id),
    () => false,
  );
  const [mounted, setMounted] = useState(false);
  if (!mounted && !skip && (near || turn)) setMounted(true);

  useEffect(() => {
    if (skip || ready) settleCanvas(id);
  }, [id, skip, ready]);

  return mounted;
}
