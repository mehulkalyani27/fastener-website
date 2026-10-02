"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

/** Frames to wait for the first triangles before reporting ready anyway (an empty scene must not hang the UI). */
const MAX_FRAMES_BEFORE_READY = 60;

/**
 * Calls `onReady` once a frame has actually drawn triangles, a frame after it was rendered. It
 * keeps requesting frames until then, so it works in `frameloop="demand"` with nothing else
 * animating. The renderer's triangle count describes the previous frame, so the first callback only
 * guarantees a second one.
 */
export function FirstFrameSignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const signaled = useRef(false);

  useFrame((state) => {
    if (signaled.current) return;
    frames.current++;
    const drew = frames.current > 1 && state.gl.info.render.triangles > 0;
    if (drew || frames.current >= MAX_FRAMES_BEFORE_READY) {
      signaled.current = true;
      requestAnimationFrame(onReady);
    } else {
      state.invalidate();
    }
  });

  return null;
}
