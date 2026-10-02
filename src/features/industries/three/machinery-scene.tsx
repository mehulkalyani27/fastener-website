"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { BoxGeometry, type Group, type MeshBasicMaterial } from "three";
import { cached, merge } from "@/features/experience/three/geometry";
import {
  GALVANIZED_STEEL_MATERIAL,
  POWDER_COATED_MATERIAL,
  SECTION_FACE_MATERIAL,
} from "@/features/experience/three/materials";
import { extrudeAlongZ, polygonShape, rectangleShape } from "@/features/experience/three/profiles";
import { screwPoseAt } from "@/features/industries/lib/drive";
import type { Tier } from "@/features/industries/lib/story";
import {
  COVER_PLATE,
  dimensionOpacity,
  FRAME_ANGLE,
  MACHINERY_DRIVE,
  MACHINERY_LAYOUT,
  MACHINERY_SCREW,
  PLATE_BASE_Y,
  PLATE_TOP_Y,
  STACK_THICKNESS,
} from "@/features/industries/scenes/machinery";
import {
  ACCENT,
  Burr,
  ContextMaterial,
  DrivenScrew,
  HighlightRing,
  InstalledScrew,
  useChapterTime,
  useTierGeometry,
} from "@/features/industries/three/parts";

/** Angle under a fixing at x = `at`, its vertical leg on the outer edge (`side` -1 = left, 1 = right). */
function angleShape(at: number, side: -1 | 1) {
  const { leg, thickness: t } = FRAME_ANGLE;
  const half = leg / 2;
  const outer = at + side * half;
  const inner = outer - side * t;
  return polygonShape([
    [at - side * half, 0],
    [outer, 0],
    [outer, -leg],
    [inner, -leg],
    [inner, -t],
    [at - side * half, -t],
  ]);
}

function buildGeometry(tier: Tier) {
  const layout = MACHINERY_LAYOUT[tier];
  return {
    plate: extrudeAlongZ(rectangleShape(COVER_PLATE.from, PLATE_BASE_Y, layout.plateTo, PLATE_TOP_Y), layout.backFrom, 0),
    angle: extrudeAlongZ(angleShape(0, -1), layout.backFrom, 0),
    farAngle: layout.farAngleX !== null ? extrudeAlongZ(angleShape(layout.farAngleX, 1), layout.backFrom, 0) : null,
  };
}

/** Dimension line with end ticks, hanging down `length` from its origin. */
const markGeometry = (length: number) =>
  cached(`dimension-${length}`, () => {
    const bar = new BoxGeometry(0.35, length, 0.1).translate(0, -length / 2, 0);
    const ticks = [0, -length].map((y) => new BoxGeometry(2.4, 0.35, 0.1).translate(0, y, 0));
    return merge([bar, ...ticks]);
  });

type DimensionMarkProps = { x: number; top: number; length: number; followsScrew?: boolean };

/** Compares the drill point with the steel it must get through, while the screw settles. */
function DimensionMark({ x, top, length, followsScrew = false }: DimensionMarkProps) {
  const time = useChapterTime();
  const group = useRef<Group>(null);
  const material = useRef<MeshBasicMaterial>(null);
  useFrame(() => {
    const t = time();
    const opacity = dimensionOpacity(t);
    if (material.current) material.current.opacity = opacity;
    if (!group.current) return;
    group.current.visible = opacity > 0.001;
    if (followsScrew) group.current.position.y = screwPoseAt(t, MACHINERY_DRIVE).headY - MACHINERY_SCREW.length + length;
  });
  return (
    <group ref={group} position={[x, top, 0.2]} visible={false}>
      <mesh geometry={markGeometry(length)}>
        <meshBasicMaterial ref={material} color={ACCENT} transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Scene 5 (last): thick cover plate fixed to a frame angle; ends on a view of the whole enclosure. */
export function MachineryScene({ tier }: { tier: Tier }) {
  const layout = MACHINERY_LAYOUT[tier];
  const geometry = useTierGeometry(buildGeometry, tier);
  const drillLength = MACHINERY_SCREW.drillPointLength + MACHINERY_SCREW.tipLength;
  const fixings = layout.farAngleX !== null ? [0, layout.farAngleX] : [0];

  return (
    <>
      <mesh geometry={geometry.plate}>
        <meshStandardMaterial attach="material-0" {...SECTION_FACE_MATERIAL} />
        <ContextMaterial attach="material-1" {...POWDER_COATED_MATERIAL} />
      </mesh>
      {[geometry.angle, geometry.farAngle].map(
        (angle, index) =>
          angle && (
            <mesh key={index} geometry={angle}>
              <meshStandardMaterial attach="material-0" {...SECTION_FACE_MATERIAL} />
              <ContextMaterial attach="material-1" {...GALVANIZED_STEEL_MATERIAL} />
            </mesh>
          ),
      )}
      {fixings.flatMap((x, row) =>
        layout.installedZ.map((z, index) => (
          <InstalledScrew key={`${x}:${z}`} drive={MACHINERY_DRIVE} x={x} z={z} spin={0.4 + row * 1.3 + index * 2.1} />
        )),
      )}

      <DimensionMark x={9} top={PLATE_TOP_Y} length={STACK_THICKNESS} />
      <DimensionMark x={5} top={0} length={drillLength} followsScrew />

      <DrivenScrew drive={MACHINERY_DRIVE} />
      <Burr drive={MACHINERY_DRIVE} layerBottom={STACK_THICKNESS} y={-FRAME_ANGLE.thickness - 0.2} />
      <HighlightRing y={PLATE_TOP_Y + 0.35} radius={MACHINERY_SCREW.flangeDiameter / 2 + 1.6} hold />
    </>
  );
}
