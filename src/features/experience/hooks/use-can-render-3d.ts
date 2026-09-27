"use client";

import { useSyncExternalStore } from "react";
import { REDUCED_MOTION_QUERY } from "@/features/experience/lib/media";

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

let webglSupported: boolean | undefined;

function supportsWebGL() {
  if (webglSupported === undefined) {
    try {
      const context = document.createElement("canvas").getContext("webgl2");
      webglSupported = Boolean(context);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webglSupported = false;
    }
  }
  return webglSupported;
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  const saveData = (navigator as NavigatorWithConnection).connection?.saveData;
  return !window.matchMedia(REDUCED_MOTION_QUERY).matches && !saveData && supportsWebGL();
}

export function useCanRender3D() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
