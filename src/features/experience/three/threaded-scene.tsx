"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { type RefObject, useMemo, useRef } from "react";
import type { Group } from "three";
import { usePerfCanvas } from "@/features/experience/hooks/use-perf";
import { readCssColor } from "@/features/experience/lib/media";
import { perfSpan } from "@/features/experience/lib/perf";
import {
  type Assembly,
  assemblyPose,
  NUT_MID,
  nutRotation,
  nutTravel,
} from "@/features/experience/lib/thread-story";
import { getLongBoltGeometry, getNutGeometry } from "@/features/experience/three/geometry";
import { HEAT_TINTED_STEEL_MATERIAL, STEEL_MATERIAL } from "@/features/experience/three/materials";
import { NUT } from "@/features/experience/three/specs";
import { FirstFrameSignal } from "@/features/experience/three/first-frame";
import { perfOnCreated, PerfProbe } from "@/features/experience/three/perf-probe";
import { StudioEnvironment } from "@/features/experience/three/studio-environment";

type ThreadedSceneProps = {
  progress: RefObject<number>;
  assembly: Assembly;
  active: boolean;
  /** The first frame that drew the model has been rendered. */
  onReady: () => void;
};

/** Fixed turn about the fastener's own axis so the hex head shows two lit faces. */
const HEAD_FACING = 0.5;

/**
 * One fastener, one nut, one pose function. Each frame the whole assembly takes its pose from
 * assemblyPose(progress) — the same function the layout search validated against the titles —
 * and the nut, a child of the fastener, threads along the shank by the same progress.
 */
function FastenerAssembly({ progress, assembly }: Pick<ThreadedSceneProps, "progress" | "assembly">) {
  const fastener = useRef<Group>(null);
  const nut = useRef<Group>(null);
  const boltGeometry = useMemo(() => perfSpan("thread", "geometry:bolt", getLongBoltGeometry), []);
  const nutGeometry = useMemo(() => perfSpan("thread", "geometry:nut", getNutGeometry), []);
  const rimColor = useMemo(() => readCssColor("--color-ink-accent", "#a9b0c9"), []);

  useFrame((state) => {
    if (!fastener.current || !nut.current) return;
    const { width, height } = state.size;
    const worldPerPx = state.viewport.height / height;
    const p = progress.current;
    const { x, y, angle } = assemblyPose(assembly, p);
    const { pxPerUnit } = assembly;

    // The pose's reference point sits NUT_MID model units down the axis from the head's underside.
    const headX = x - Math.cos(angle) * NUT_MID * pxPerUnit;
    const headY = y - Math.sin(angle) * NUT_MID * pxPerUnit;
    fastener.current.position.set((headX - width / 2) * worldPerPx, (height / 2 - headY) * worldPerPx, 0);
    // Model points its shank down -y; rotate so it runs along the screen-space angle ("\\").
    fastener.current.rotation.z = Math.PI / 2 - angle;
    fastener.current.scale.setScalar(pxPerUnit * worldPerPx);

    nut.current.position.y = -(NUT_MID + nutTravel(p)) + NUT.height / 2;
    nut.current.rotation.y = nutRotation(p);
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[-3, 6, 8]} intensity={2.6} />
      <directionalLight position={[5, -2, -4]} intensity={2} color={rimColor} />
      <group ref={fastener} visible={assembly.pxPerUnit > 0}>
        <group rotation-y={HEAD_FACING}>
          <mesh geometry={boltGeometry}>
            <meshPhysicalMaterial {...STEEL_MATERIAL} />
          </mesh>
        </group>
        <group ref={nut}>
          <mesh geometry={nutGeometry}>
            <meshPhysicalMaterial {...HEAT_TINTED_STEEL_MATERIAL} />
          </mesh>
        </group>
      </group>
    </>
  );
}

// A long lens (small fov, distant camera) keeps perspective growth of near faces to ~3%, so the
// rendered silhouette matches the 2D clearance maths in computeAssembly.
export default function ThreadedScene({ progress, assembly, active, onReady }: ThreadedSceneProps) {
  usePerfCanvas("thread", active);
  return (
    <Canvas
      frameloop={active ? "always" : "demand"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 16], fov: 18 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={perfOnCreated("thread")}
    >
      <StudioEnvironment perfScope="thread" />
      <FastenerAssembly progress={progress} assembly={assembly} />
      <FirstFrameSignal onReady={onReady} />
      <PerfProbe scope="thread" />
    </Canvas>
  );
}
