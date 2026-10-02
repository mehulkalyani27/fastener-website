import type { Material, Mesh, Object3D, WebGLRenderer } from "three";
import { perfGpuSync, perfMark, type PerfScope } from "@/features/experience/lib/perf";

const FRAMES_TRACKED = 5;
const SLOW_FRAME_MS = 50;

export function gpuName(renderer: WebGLRenderer) {
  const context = renderer.getContext();
  const info = context.getExtension("WEBGL_debug_renderer_info");
  return info ? String(context.getParameter(info.UNMASKED_RENDERER_WEBGL)) : undefined;
}

export function sceneStats(root: Object3D) {
  const materials = new Set<Material>();
  let meshes = 0;
  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    meshes++;
    [mesh.material].flat().forEach((material) => materials.add(material));
  });
  return { meshes, materials: materials.size };
}

export const rendererStats = (renderer: WebGLRenderer) => ({
  programs: renderer.info.programs?.length ?? 0,
  drawCalls: renderer.info.render.calls,
  triangles: renderer.info.render.triangles,
  geometries: renderer.info.memory.geometries,
  textures: renderer.info.memory.textures,
});

/**
 * Wraps `renderer.render` to time the first frames: the first call includes three.js's lazy shader
 * compilation and buffer upload. "usable-frame" is the first frame after one that drew triangles.
 * Returns a function that restores the original.
 */
export function instrumentRenderer(renderer: WebGLRenderer, scope: PerfScope) {
  const original = renderer.render;
  let frames = 0;
  let drawn = false;
  renderer.render = (target, camera) => {
    frames++;
    const first = frames === 1;
    const start = performance.now();
    if (first) perfMark(scope, "first-render-start");
    original.call(renderer, target, camera);
    const ms = performance.now() - start;

    if (first) {
      perfMark(scope, "first-render-end", { ms, ...rendererStats(renderer) });
      requestAnimationFrame(() => perfMark(scope, "first-frame-painted"));
      if (perfGpuSync()) {
        const gpuStart = performance.now();
        renderer.getContext().finish();
        perfMark(scope, "first-render-gpu-end", { gpuWaitMs: performance.now() - gpuStart });
      }
    }
    if (frames <= FRAMES_TRACKED) perfMark(scope, `frame-${frames}`, { ms });
    else if (ms > SLOW_FRAME_MS && frames < 240) perfMark(scope, `slow-frame-${frames}`, { ms });

    if (!drawn && renderer.info.render.triangles > 0) {
      drawn = true;
      perfMark(scope, "model-drawn", rendererStats(renderer));
      requestAnimationFrame(() => perfMark(scope, "usable-frame"));
    }
  };
  return () => {
    renderer.render = original;
  };
}
