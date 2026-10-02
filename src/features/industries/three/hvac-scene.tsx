"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { BufferGeometry, Group } from "three";
import { cached, hexPrism } from "@/features/experience/three/geometry";
import {
  GALVANIZED_STEEL_MATERIAL,
  SECTION_FACE_MATERIAL,
  ZINC_SCREW_MATERIAL,
} from "@/features/experience/three/materials";
import { extrudeAlongZ, polygonShape, rectangleShape } from "@/features/experience/three/profiles";
import type { Tier } from "@/features/industries/lib/story";
import {
  BRACKET,
  BRACKET_BACK_Y,
  BRACKET_FACE_Y,
  DUCT,
  DUCT_FACE_Y,
  DUCT_INSIDE_DEPTH,
  HANGER_ROD,
  HVAC_CLAMP,
  HVAC_DRIVE,
  HVAC_LAYOUT,
  HVAC_SCREW,
  hvacClosure,
} from "@/features/industries/scenes/hvac";
import {
  Burr,
  ContextMaterial,
  DrivenScrew,
  HighlightRing,
  InstalledScrew,
  useChapterTime,
  useTierGeometry,
} from "@/features/industries/three/parts";

const NUT = { acrossFlats: 13, height: 6.5, bevel: 0.3 };
const JOINT_FLANGE = { reach: 22, thickness: 8 };

const bracketShape = () =>
  polygonShape([
    [BRACKET.from, BRACKET_BACK_Y],
    [BRACKET.to, BRACKET_BACK_Y],
    [BRACKET.to, BRACKET_BACK_Y + BRACKET.outstand],
    [BRACKET.to - BRACKET.thickness, BRACKET_BACK_Y + BRACKET.outstand],
    [BRACKET.to - BRACKET.thickness, BRACKET_FACE_Y],
    [BRACKET.from, BRACKET_FACE_Y],
  ]);

function buildGeometry(tier: Tier) {
  const layout = HVAC_LAYOUT[tier];
  const x0 = DUCT.top - DUCT.height;
  const { reach, thickness } = JOINT_FLANGE;
  return {
    duct: extrudeAlongZ(rectangleShape(x0, -DUCT.width, DUCT.top, 0, DUCT.wall), layout.backFrom, 0),
    joint:
      layout.jointZ !== null
        ? extrudeAlongZ(
            rectangleShape(x0 - reach, -DUCT.width - reach, DUCT.top + reach, reach, reach - 0.05),
            layout.jointZ - thickness / 2,
            layout.jointZ + thickness / 2,
          )
        : null,
    bracketCut: extrudeAlongZ(bracketShape(), -BRACKET.halfWidth, 0),
    bracketFull: layout.secondHangerZ !== null ? extrudeAlongZ(bracketShape(), -BRACKET.halfWidth, BRACKET.halfWidth) : null,
  };
}

const nutGeometry = () =>
  cached("hanger-nut", () =>
    hexPrism(NUT.acrossFlats / Math.sqrt(3), NUT.height - NUT.bevel * 2, HANGER_ROD.radius + 0.1, NUT.bevel),
  );

/** Threaded hanger rod through the bracket's outstanding leg, held by a nut on each side. */
function HangerRod({ z }: { z: number }) {
  const { radius, y, from, to } = HANGER_ROD;
  const leg = BRACKET.to;
  return (
    <group position={[0, y, z]}>
      <mesh position-x={(from + to) / 2} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[radius, radius, to - from, 24]} />
        <ContextMaterial {...GALVANIZED_STEEL_MATERIAL} />
      </mesh>
      {[leg + 0.05, leg - BRACKET.thickness - 0.05 - NUT.height].map((x) => (
        <mesh key={x} geometry={nutGeometry()} position-x={x} rotation-z={-Math.PI / 2}>
          <ContextMaterial {...GALVANIZED_STEEL_MATERIAL} />
        </mesh>
      ))}
    </group>
  );
}

function Bracket({ geometry }: { geometry: BufferGeometry }) {
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial attach="material-0" {...SECTION_FACE_MATERIAL} />
      <ContextMaterial attach="material-1" {...GALVANIZED_STEEL_MATERIAL} />
    </mesh>
  );
}

/**
 * Scene 3: hanger bracket screwed to the side wall of a duct (fixing frame on its side: +x is up).
 * The screw drills bracket and duct wall, then pulls the duct wall against the bracket.
 */
export function HvacScene({ tier }: { tier: Tier }) {
  const layout = HVAC_LAYOUT[tier];
  const geometry = useTierGeometry(buildGeometry, tier);
  const time = useChapterTime();
  const duct = useRef<Group>(null);

  useFrame(() => {
    if (duct.current) duct.current.position.y = hvacClosure(time());
  });

  return (
    <>
      {/* The duct (sectioned across its length) is pulled against the bracket as the screw clamps. */}
      <group ref={duct}>
        <group position-y={DUCT_FACE_Y}>
          <mesh geometry={geometry.duct}>
            <meshStandardMaterial attach="material-0" {...SECTION_FACE_MATERIAL} />
            <ContextMaterial attach="material-1" {...GALVANIZED_STEEL_MATERIAL} />
          </mesh>
          {geometry.joint && (
            <mesh geometry={geometry.joint}>
              <ContextMaterial {...GALVANIZED_STEEL_MATERIAL} />
            </mesh>
          )}
        </group>
        <Burr drive={HVAC_DRIVE} layerBottom={DUCT_INSIDE_DEPTH} y={DUCT_FACE_Y - DUCT.wall - 0.2} />
      </group>

      <Bracket geometry={geometry.bracketCut} />
      <HangerRod z={HANGER_ROD.z} />
      <Burr drive={HVAC_DRIVE} layerBottom={BRACKET.thickness} y={BRACKET_BACK_Y - 0.2} flattenedBy={HVAC_CLAMP} />

      {/* Context: the next hanger along the duct, already fixed. */}
      {geometry.bracketFull && layout.secondHangerZ !== null && (
        <group position-z={layout.secondHangerZ}>
          <Bracket geometry={geometry.bracketFull} />
          <HangerRod z={0} />
          <InstalledScrew drive={HVAC_DRIVE} z={0} spin={2.4} finish={ZINC_SCREW_MATERIAL} />
        </group>
      )}

      <DrivenScrew drive={HVAC_DRIVE} finish={ZINC_SCREW_MATERIAL} />
      <HighlightRing y={BRACKET_FACE_Y + 0.35} radius={HVAC_SCREW.flangeDiameter / 2 + 1.6} />
    </>
  );
}
