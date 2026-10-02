"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { FirstFrameSignal } from "@/features/experience/three/first-frame";
import type { RenderControl } from "@/features/industries/lib/render-control";

type FrameDriverProps = {
  control: RenderControl;
  onReady: () => void;
};

/**
 * Owns the canvas's frame loop. The canvas runs in `frameloop="demand"`, so a frame is always
 * requested explicitly: on mount (FirstFrameSignal), on every frame while the clock animates, and
 * through `wake` when the clock starts again after being idle.
 */
export function FrameDriver({ control, onReady }: FrameDriverProps) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    control.setWake(() => invalidate());
    return () => control.setWake(null);
  }, [control, invalidate]);

  useFrame((state) => {
    if (control.animating) state.invalidate();
  });

  return <FirstFrameSignal onReady={onReady} />;
}
