"use client";

import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import type { PerspectiveCamera } from "three";
import { CAMERA_FOV } from "@/features/industries/lib/scene";
import { cameraAt, chapterAt, type Tier } from "@/features/industries/lib/story";
import { CHAPTER_COUNT, INDUSTRY_SCENES } from "@/features/industries/scenes";

type CameraRigProps = {
  progress: RefObject<number>;
  tier: Tier;
};

/** Places the default camera from scroll progress each frame, in the current chapter's frame. */
export function CameraRig({ progress, tier }: CameraRigProps) {
  useFrame((state) => {
    const camera = state.camera as PerspectiveCamera;
    const fov = CAMERA_FOV[tier];
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    const { index, t } = chapterAt(progress.current, CHAPTER_COUNT);
    const scene = INDUSTRY_SCENES[index];
    const { position, target } = cameraAt(scene.camera[tier], t, { fov, aspect: state.size.width / state.size.height });
    camera.up.set(...scene.up);
    camera.position.set(...position);
    camera.lookAt(...target);
  });
  return null;
}
