"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import {
  GALVANIZED_STEEL_MATERIAL,
  PAINTED_SHEET_MATERIAL,
  SECTION_FACE_MATERIAL,
} from "@/features/experience/three/materials";
import { cPurlinShapes, extrudeAlongX, extrudeAlongZ, trapezoidalSheetShape } from "@/features/experience/three/profiles";
import type { Tier } from "@/features/industries/lib/story";
import {
  INNER_BASE_Y,
  INNER_BOTTOM_DEPTH,
  LAP_TOP,
  OUTER_BASE_Y,
  PEB_CLAMP,
  PEB_DRIVE,
  PEB_GIRT,
  PEB_LAYOUT,
  PEB_SCREW,
  PEB_SHEET,
  pebLapClosure,
} from "@/features/industries/scenes/peb";
import {
  Burr,
  ContextMaterial,
  DrivenScrew,
  HighlightRing,
  InstalledScrew,
  useChapterTime,
  useTierGeometry,
} from "@/features/industries/three/parts";

/** The sheet underneath the lap, a shade darker so the two sheets read apart in the section. */
const INNER_SHEET_COLOR = "#5b6479";

function buildGeometry(tier: Tier) {
  const layout = PEB_LAYOUT[tier];
  const sheet = (range: readonly [number, number], base: number) =>
    extrudeAlongZ(trapezoidalSheetShape(PEB_SHEET, range[0], range[1], base), layout.backFrom, 0);
  return {
    outer: sheet(layout.outer, OUTER_BASE_Y),
    inner: sheet(layout.inner, INNER_BASE_Y),
    girt: layout.girt ? extrudeAlongX(cPurlinShapes(PEB_GIRT, "full"), layout.girt.length) : null,
  };
}

/** Scene 2: side lap of two cladding sheets stitched through the lapped crest, then pulled tight. */
export function PebScene({ tier }: { tier: Tier }) {
  const layout = PEB_LAYOUT[tier];
  const geometry = useTierGeometry(buildGeometry, tier);
  const time = useChapterTime();
  const inner = useRef<Group>(null);

  useFrame(() => {
    if (inner.current) inner.current.position.y = pebLapClosure(time());
  });

  const { thickness, ribHeight } = PEB_SHEET;

  return (
    <>
      <mesh geometry={geometry.outer}>
        <meshStandardMaterial attach="material-0" {...SECTION_FACE_MATERIAL} />
        <ContextMaterial attach="material-1" {...PAINTED_SHEET_MATERIAL} />
      </mesh>
      <Burr drive={PEB_DRIVE} layerBottom={thickness} y={LAP_TOP - thickness - 0.2} flattenedBy={PEB_CLAMP} />

      {/* The inner sheet is pulled up against the outer one as the screw clamps the lap. */}
      <group ref={inner}>
        <mesh geometry={geometry.inner}>
          <meshStandardMaterial attach="material-0" {...SECTION_FACE_MATERIAL} />
          <ContextMaterial attach="material-1" {...PAINTED_SHEET_MATERIAL} color={INNER_SHEET_COLOR} />
        </mesh>
        <Burr drive={PEB_DRIVE} layerBottom={INNER_BOTTOM_DEPTH} y={INNER_BASE_Y + ribHeight - 0.2} />
      </group>

      {geometry.girt && layout.girt && (
        <mesh geometry={geometry.girt} position-z={layout.girt.z}>
          <ContextMaterial {...GALVANIZED_STEEL_MATERIAL} />
        </mesh>
      )}
      {layout.stitches.map((z, index) => (
        <InstalledScrew key={z} drive={PEB_DRIVE} z={z} spin={1.1 + index * 2.3} />
      ))}

      <DrivenScrew drive={PEB_DRIVE} />
      <HighlightRing y={LAP_TOP + 0.35} radius={PEB_SCREW.washer!.diameter / 2 + 1.6} />
    </>
  );
}
