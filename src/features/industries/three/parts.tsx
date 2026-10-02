"use client";

import { type ThreeElements, useFrame } from "@react-three/fiber";
import { createContext, type ReactNode, type RefObject, use, useEffect, useMemo, useRef } from "react";
import { type BufferGeometry, Color, type Group, type Mesh, type MeshBasicMaterial, type MeshStandardMaterial } from "three";
import { perfSpan } from "@/features/experience/lib/perf";
import { GALVANIZED_STEEL_MATERIAL, SECTION_FACE_MATERIAL } from "@/features/experience/three/materials";
import { epdmPose, SdsScrew } from "@/features/experience/three/sds-screw";
import {
  breakthrough,
  type DriveStage,
  type ScrewDrive,
  screwPoseAt,
  seatedHeadY,
  stageAmount,
} from "@/features/industries/lib/drive";
import { contextDim, highlightOpacity } from "@/features/industries/lib/scene";
import { chapterAt, chapterProgress, type Tier } from "@/features/industries/lib/story";
import { CHAPTER_COUNT } from "@/features/industries/scenes";

type Finish = ThreeElements["meshPhysicalMaterial"];
type ChapterValue = { progress: RefObject<number>; index: number };

const ChapterContext = createContext<ChapterValue | null>(null);

/** Background the context parts ease toward while the screw works (the section's surface tone). */
const BACKDROP = new Color("#f3f4f8");
export const ACCENT = "#1f2440";
/** Cut-face strips sit this far in front of the section plane so they never flicker. */
export const FACE_OFFSET = 0.03;

/** One chapter's scene: drawn only while its chapter is showing; its parts read the chapter's progress. */
export function Chapter({ progress, index, children }: ChapterValue & { children: ReactNode }) {
  const group = useRef<Group>(null);
  const value = useMemo(() => ({ progress, index }), [progress, index]);
  useFrame(() => {
    if (group.current) group.current.visible = chapterAt(progress.current, CHAPTER_COUNT).index === index;
  });
  return (
    <ChapterContext value={value}>
      <group ref={group}>{children}</group>
    </ChapterContext>
  );
}

/** Reader for the enclosing chapter's progress (0 → 1), for use inside useFrame. */
export function useChapterTime() {
  const { progress: progressRef, index } = use(ChapterContext)!;
  return () => chapterProgress(progressRef.current, index, CHAPTER_COUNT);
}

/** Builds a scene's geometry once per tier and disposes it when replaced. */
export function useTierGeometry<T extends Record<string, BufferGeometry | null>>(build: (tier: Tier) => T, tier: Tier) {
  const { index } = use(ChapterContext)!;
  const geometry = useMemo(() => perfSpan("industries", `geometry:scene-${index}`, () => build(tier)), [build, tier, index]);
  useEffect(() => () => Object.values(geometry).forEach((part) => part?.dispose()), [geometry]);
  return geometry;
}

/** Matte material for context parts: eases toward the background while the screw works. */
export function ContextMaterial({ color, ...props }: ThreeElements["meshStandardMaterial"] & { color: string }) {
  const time = useChapterTime();
  const material = useRef<MeshStandardMaterial>(null);
  const base = useMemo(() => new Color(color), [color]);
  useFrame(() => {
    material.current?.color.copy(base).lerp(BACKDROP, contextDim(time()));
  });
  return <meshStandardMaterial ref={material} color={color} {...props} />;
}

/** Cut face of a part whose section is not an extrusion end cap (parts extruded along x). */
export function SectionFace({ x = 0, y, width, height }: { x?: number; y: number; width: number; height: number }) {
  return (
    <mesh position={[x, y, FACE_OFFSET]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial {...SECTION_FACE_MATERIAL} />
    </mesh>
  );
}

type DrivenScrewProps = { drive: ScrewDrive; finish?: Finish; pointFinish?: Finish };

/** The chapter's hero screw, posed from the drive every frame — the only polished part. */
export function DrivenScrew({ drive, finish, pointFinish }: DrivenScrewProps) {
  const time = useChapterTime();
  const screw = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const epdm = useRef<Mesh>(null);

  useFrame(() => {
    const pose = screwPoseAt(time(), drive);
    if (screw.current) {
      screw.current.position.set(pose.x, pose.headY, 0);
      screw.current.rotation.z = pose.tilt;
    }
    if (spin.current) spin.current.rotation.y = pose.spin;
    if (epdm.current && drive.spec.washer) {
      const { y, scale } = epdmPose(drive.spec, pose.epdmThickness);
      epdm.current.position.y = y;
      epdm.current.scale.set(...scale);
    }
  });

  return <SdsScrew ref={screw} spec={drive.spec} finish={finish} pointFinish={pointFinish} spinRef={spin} epdmRef={epdm} />;
}

type InstalledScrewProps = { drive: ScrewDrive; x?: number; z: number; spin: number; finish?: Finish; pointFinish?: Finish };

/** A screw already fixed elsewhere in the assembly (context), seated like the hero ends up. */
export function InstalledScrew({ drive, x = 0, z, spin, finish, pointFinish }: InstalledScrewProps) {
  return (
    <SdsScrew
      spec={drive.spec}
      finish={finish}
      pointFinish={pointFinish}
      position={[x, seatedHeadY(drive), z]}
      spin={spin}
      epdmThickness={drive.spec.washer?.epdmMinThickness}
    />
  );
}

type BurrProps = {
  drive: ScrewDrive;
  /** Depth of the layer's underside below the fixing surface when it is drilled. */
  layerBottom: number;
  y: number;
  /** Clamping stage that presses the burr flat as the gap under the layer closes. */
  flattenedBy?: DriveStage;
};

/** Exit burr where the drill point breaks out of a layer's underside. */
export function Burr({ drive, layerBottom, y, flattenedBy }: BurrProps) {
  const time = useChapterTime();
  const ring = useRef<Mesh>(null);
  useFrame(() => {
    if (!ring.current) return;
    const t = time();
    const pressed = flattenedBy ? 1 - stageAmount(t, flattenedBy) : 1;
    const amount = breakthrough(screwPoseAt(t, drive).depth, layerBottom, drive.spec) * pressed;
    ring.current.visible = amount > 0;
    ring.current.scale.setScalar(Math.max(amount, 0.001));
  });
  return (
    <mesh ref={ring} position-y={y} rotation-x={Math.PI / 2} visible={false}>
      <torusGeometry args={[drive.spec.diameter / 2 + 0.6, 0.45, 8, 32]} />
      <meshStandardMaterial {...GALVANIZED_STEEL_MATERIAL} color="#b8bdc7" />
    </mesh>
  );
}

/** Thin accent ring on the fixing surface around the seated screw. */
export function HighlightRing({ y, radius, hold = false }: { y: number; radius: number; hold?: boolean }) {
  const time = useChapterTime();
  const material = useRef<MeshBasicMaterial>(null);
  useFrame(() => {
    if (material.current) material.current.opacity = highlightOpacity(time(), hold);
  });
  return (
    <mesh position-y={y} rotation-x={Math.PI / 2}>
      <torusGeometry args={[radius, 0.3, 8, 64]} />
      <meshBasicMaterial ref={material} color={ACCENT} transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
