"use client";

import { type RootState, useStore } from "@react-three/fiber";
import { type ComponentType, useEffect } from "react";
import { perfMark, type PerfScope, perfSetGpu } from "@/features/experience/lib/perf";
import { gpuName, instrumentRenderer, sceneStats } from "@/features/experience/three/perf-renderer";

/** Passed as the Canvas `onCreated`: the WebGL context and renderer exist. */
export const perfOnCreated = (scope: PerfScope) =>
  process.env.NODE_ENV === "development"
    ? ({ gl }: RootState) => {
        const gpu = gpuName(gl);
        perfSetGpu(gpu);
        perfMark(scope, "webgl-context-ready", {
          gpu,
          webgl2: gl.capabilities.isWebGL2,
          pixelRatio: gl.getPixelRatio(),
          canvas: `${gl.domElement.width}x${gl.domElement.height}`,
        });
      }
    : undefined;

/** Renders nothing: marks when the scene graph is built, then times the first frames. */
function PerfProbeImpl({ scope }: { scope: PerfScope }) {
  const store = useStore();

  useEffect(() => {
    const { gl, scene } = store.getState();
    perfMark(scope, "scene-graph-mounted", sceneStats(scene));
    return instrumentRenderer(gl, scope);
  }, [store, scope]);

  return null;
}

/** Place after the scene content, inside the Canvas. */
export const PerfProbe: ComponentType<{ scope: PerfScope }> =
  process.env.NODE_ENV === "development" ? PerfProbeImpl : () => null;
