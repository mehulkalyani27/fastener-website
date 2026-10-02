"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";
import { usePerfCanvas } from "@/features/experience/hooks/use-perf";
import { perfOnCreated, PerfProbe } from "@/features/experience/three/perf-probe";
import { StudioEnvironment } from "@/features/experience/three/studio-environment";
import type { RenderControl } from "@/features/industries/lib/render-control";
import { CAMERA_FOV } from "@/features/industries/lib/scene";
import type { Tier } from "@/features/industries/lib/story";
import { CameraRig } from "@/features/industries/three/camera-rig";
import { FrameDriver } from "@/features/industries/three/frame-driver";
import { HvacScene } from "@/features/industries/three/hvac-scene";
import { MachineryScene } from "@/features/industries/three/machinery-scene";
import { Chapter } from "@/features/industries/three/parts";
import { PebScene } from "@/features/industries/three/peb-scene";
import { RoofingScene } from "@/features/industries/three/roofing-scene";
import { SolarScene } from "@/features/industries/three/solar-scene";

/** Scene components in chapter order (matching INDUSTRY_SCENES). */
const SCENES = [RoofingScene, PebScene, HvacScene, SolarScene, MachineryScene];

type IndustryCanvasProps = {
  progress: RefObject<number>;
  tier: Tier;
  control: RenderControl;
  /** The playback clock is running (used for development timing marks only). */
  active: boolean;
  /** The first frame that drew the model has been rendered. */
  onReady: () => void;
};

/**
 * One canvas for the whole Industries story: every chapter's scene is mounted, only the current one
 * is drawn. Lights sit in the shared fixing frame so the head tops match across chapter cuts.
 * Frames are requested explicitly (see FrameDriver), never by switching `frameloop` over time.
 */
export default function IndustryCanvas({ progress, tier, control, active, onReady }: IndustryCanvasProps) {
  usePerfCanvas("industries", active);
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, tier === "mobile" ? 1.5 : 1.75]}
      camera={{ fov: CAMERA_FOV[tier], near: 2, far: 8000, position: [0, 400, 1500] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={perfOnCreated("industries")}
    >
      <StudioEnvironment perfScope="industries" />
      <ambientLight intensity={0.35} />
      <directionalLight position={[-500, 1100, 900]} intensity={2.2} />
      <directionalLight position={[700, 300, 500]} intensity={0.7} />
      <CameraRig progress={progress} tier={tier} />
      {SCENES.map((Scene, index) => (
        <Chapter key={index} progress={progress} index={index}>
          <Scene tier={tier} />
        </Chapter>
      ))}
      <FrameDriver control={control} onReady={onReady} />
      <PerfProbe scope="industries" />
    </Canvas>
  );
}
