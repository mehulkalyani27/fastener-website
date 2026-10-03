"use client";

import {
  ALUMINIUM_MATERIAL,
  GALVANIZED_STEEL_MATERIAL,
  SECTION_FACE_MATERIAL,
  SOLAR_GLASS_MATERIAL,
} from "@/features/experience/three/materials";
import { cPurlinShapes, extrudeAlongX, polygonShape, rectangleShape } from "@/features/experience/three/profiles";
import type { Tier } from "@/features/industries/lib/story";
import {
  FOOT_BASE_Y,
  FOOT_TOP_Y,
  L_FOOT,
  PANEL,
  PURLIN_BOTTOM_DEPTH,
  RAIL,
  SOLAR_DRIVE,
  SOLAR_LAYOUT,
  SOLAR_PURLIN,
  SOLAR_SCREW,
} from "@/features/industries/scenes/solar";
import {
  Burr,
  ContextMaterial,
  DrivenScrew,
  HighlightRing,
  SectionFace,
  useTierGeometry,
} from "@/features/industries/three/parts";

// Profiles below are in the z–y plane, extruded along x.
const footShape = () => {
  const { from, leg, legTop } = L_FOOT;
  return polygonShape([
    [from, FOOT_BASE_Y],
    [0, FOOT_BASE_Y],
    [0, FOOT_TOP_Y],
    [from + leg, FOOT_TOP_Y],
    [from + leg, legTop],
    [from, legTop],
  ]);
};

function buildGeometry(tier: Tier) {
  const layout = SOLAR_LAYOUT[tier];
  return {
    purlin: extrudeAlongX(cPurlinShapes(SOLAR_PURLIN, "back"), layout.purlinLength),
    foot: extrudeAlongX(footShape(), L_FOOT.width),
    rail: extrudeAlongX(rectangleShape(RAIL.from, RAIL.bottom, RAIL.to, RAIL.top, RAIL.wall), layout.railLength),
  };
}

/** Scene 4: aluminium rail foot fixed to a steel purlin, carrying the panel rail. */
export function SolarScene({ tier }: { tier: Tier }) {
  const layout = SOLAR_LAYOUT[tier];
  const geometry = useTierGeometry(buildGeometry, tier);
  const { thickness: t, depth } = SOLAR_PURLIN;
  const panelDepth = PANEL.front - PANEL.back;

  return (
    <>
      <mesh geometry={geometry.purlin}>
        <ContextMaterial {...GALVANIZED_STEEL_MATERIAL} />
      </mesh>
      {[-t / 2, -depth + t / 2].map((y) => (
        <SectionFace key={y} y={y} width={layout.purlinLength} height={t} />
      ))}

      <mesh geometry={geometry.foot}>
        <ContextMaterial {...ALUMINIUM_MATERIAL} />
      </mesh>
      <SectionFace y={FOOT_BASE_Y + L_FOOT.base / 2} width={L_FOOT.width} height={L_FOOT.base} />

      <mesh geometry={geometry.rail}>
        <meshStandardMaterial attach="material-0" {...SECTION_FACE_MATERIAL} />
        <ContextMaterial attach="material-1" {...ALUMINIUM_MATERIAL} />
      </mesh>
      {layout.panel && (
        <group position={[0, RAIL.top + 0.05 + PANEL.thickness / 2, PANEL.back + panelDepth / 2]}>
          <mesh>
            <boxGeometry args={[layout.railLength, PANEL.thickness, panelDepth]} />
            <ContextMaterial {...ALUMINIUM_MATERIAL} />
          </mesh>
          <mesh position-y={PANEL.thickness / 2 + 0.05} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[layout.railLength - 20, panelDepth - 20]} />
            <ContextMaterial {...SOLAR_GLASS_MATERIAL} />
          </mesh>
        </group>
      )}

      <DrivenScrew drive={SOLAR_DRIVE} />
      <Burr drive={SOLAR_DRIVE} layerBottom={PURLIN_BOTTOM_DEPTH} y={-t - 0.2} />
      <HighlightRing y={FOOT_TOP_Y + 0.35} radius={SOLAR_SCREW.flangeDiameter / 2 + 1.6} />
    </>
  );
}
