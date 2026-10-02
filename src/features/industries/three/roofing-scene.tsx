"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, MeshStandardMaterial } from "three";
import {
  GALVANIZED_STEEL_MATERIAL,
  PAINTED_SHEET_MATERIAL,
  SECTION_FACE_MATERIAL,
} from "@/features/experience/three/materials";
import {
  cPurlinShapes,
  extrudeAlongX,
  extrudeAlongZ,
  trapezoidalSheetShape,
} from "@/features/experience/three/profiles";
import type { Tier } from "@/features/industries/lib/story";
import {
  CREST_TOP,
  CREST_UNDERSIDE,
  ROOFING_DRIVE,
  ROOFING_LAYOUT,
  ROOFING_PURLIN,
  ROOFING_SCREW,
  ROOFING_SHEET,
  roofingReveal,
  SHEET_BASE_Y,
} from "@/features/industries/scenes/roofing";
import {
  Burr,
  ContextMaterial,
  DrivenScrew,
  HighlightRing,
  InstalledScrew,
  SectionFace,
  useChapterTime,
  useTierGeometry,
} from "@/features/industries/three/parts";

function buildGeometry(tier: Tier) {
  const layout = ROOFING_LAYOUT[tier];
  const sheetShape = trapezoidalSheetShape(ROOFING_SHEET, layout.sheetFrom, layout.sheetTo, SHEET_BASE_Y);
  return {
    sheetBack: extrudeAlongZ(sheetShape, layout.backFrom, 0),
    sheetFront: layout.frontTo ? extrudeAlongZ(sheetShape, 0, layout.frontTo) : null,
    purlinBack: extrudeAlongX(cPurlinShapes(ROOFING_PURLIN, "back"), layout.purlinLength),
    purlinFront: layout.frontTo ? extrudeAlongX(cPurlinShapes(ROOFING_PURLIN, "front"), layout.purlinLength) : null,
    purlinFull:
      layout.secondPurlinZ !== null ? extrudeAlongX(cPurlinShapes(ROOFING_PURLIN, "full"), layout.purlinLength) : null,
  };
}

/**
 * Scene 1: roof sheet crest-fixed to a C-purlin, shown as an engineering cutaway. Every moving
 * part reads its state from scroll progress each frame; nothing is time-based.
 */
export function RoofingScene({ tier }: { tier: Tier }) {
  const layout = ROOFING_LAYOUT[tier];
  const geometry = useTierGeometry(buildGeometry, tier);
  const time = useChapterTime();
  const front = useRef<Group>(null);
  const frontMaterials = useRef<(MeshStandardMaterial | null)[]>([]);

  useFrame(() => {
    const reveal = roofingReveal(time());
    if (front.current) {
      front.current.position.z = reveal.offset;
      front.current.visible = reveal.opacity > 0.001;
    }
    frontMaterials.current.forEach((material) => {
      if (!material) return;
      material.opacity = reveal.opacity;
      material.depthWrite = reveal.opacity > 0.99;
    });
  });

  const { thickness: t, depth } = ROOFING_PURLIN;

  return (
    <>
      {/* Behind the section plane: always present. Sheet end caps (group 0) show as the cut face. */}
      <mesh geometry={geometry.sheetBack}>
        <meshStandardMaterial attach="material-0" {...SECTION_FACE_MATERIAL} />
        <ContextMaterial attach="material-1" {...PAINTED_SHEET_MATERIAL} />
      </mesh>
      <mesh geometry={geometry.purlinBack}>
        <ContextMaterial {...GALVANIZED_STEEL_MATERIAL} />
      </mesh>
      {[-t / 2, -depth + t / 2].map((y) => (
        <SectionFace key={y} y={y} width={layout.purlinLength} height={t} />
      ))}

      {/* In front of the section plane: slides away during the approach (desktop and tablet). */}
      {geometry.sheetFront && geometry.purlinFront && (
        <group ref={front}>
          <mesh geometry={geometry.sheetFront}>
            <meshStandardMaterial attach="material-0" ref={(material) => {
              frontMaterials.current[0] = material;
            }} {...SECTION_FACE_MATERIAL} transparent />
            <meshStandardMaterial attach="material-1" ref={(material) => {
              frontMaterials.current[1] = material;
            }} {...PAINTED_SHEET_MATERIAL} transparent />
          </mesh>
          <mesh geometry={geometry.purlinFront}>
            <meshStandardMaterial ref={(material) => {
              frontMaterials.current[2] = material;
            }} {...GALVANIZED_STEEL_MATERIAL} transparent />
          </mesh>
        </group>
      )}

      {/* Context: a second purlin up the slope with screws already installed on its crests. */}
      {geometry.purlinFull && layout.secondPurlinZ !== null && (
        <group position-z={layout.secondPurlinZ}>
          <mesh geometry={geometry.purlinFull}>
            <ContextMaterial {...GALVANIZED_STEEL_MATERIAL} />
          </mesh>
          {layout.contextCrests.map((x, index) => (
            <InstalledScrew key={x} drive={ROOFING_DRIVE} x={x} z={0} spin={0.7 + index * 1.9} />
          ))}
        </group>
      )}

      <DrivenScrew drive={ROOFING_DRIVE} />

      {/* Exit burrs where the drill point breaks through the crest and the purlin flange. */}
      <Burr drive={ROOFING_DRIVE} layerBottom={ROOFING_SHEET.thickness} y={CREST_UNDERSIDE - 0.2} />
      <Burr drive={ROOFING_DRIVE} layerBottom={CREST_TOP + t} y={-t - 0.2} />

      <HighlightRing y={CREST_TOP + 0.35} radius={ROOFING_SCREW.washer!.diameter / 2 + 1.6} />
    </>
  );
}
