"use client";

import type { ThreeElements } from "@react-three/fiber";
import { type Ref, useMemo } from "react";
import type { Group, Mesh } from "three";
import { COATED_SCREW_MATERIAL, EPDM_MATERIAL, STEEL_MATERIAL } from "@/features/experience/three/materials";
import { getSdsGeometry } from "@/features/experience/three/sds-geometry";
import type { SdsSpec } from "@/features/experience/three/specs";

type SdsScrewProps = ThreeElements["group"] & {
  spec: SdsSpec;
  /** Material props for the screw body (finish). */
  finish?: ThreeElements["meshPhysicalMaterial"];
  /** Drill point material, when it differs from the body (e.g. a hardened point). */
  pointFinish?: ThreeElements["meshPhysicalMaterial"];
  /** Rotation about the screw axis (static screws); animated screws drive `spinRef` instead. */
  spin?: number;
  spinRef?: Ref<Group>;
  /** Compressed EPDM thickness (static screws); animated screws drive `epdmRef` instead. */
  epdmThickness?: number;
  epdmRef?: Ref<Mesh>;
};

/**
 * Hex washer head self-drilling screw. The group's origin is the head's underside on the screw
 * axis; the shank points down -y. The bonded washer hangs under the head: its steel ring is fixed
 * to the head, the EPDM ring below it is scaled in y to compress (see epdmPose).
 */
export function SdsScrew({
  spec,
  finish = COATED_SCREW_MATERIAL,
  pointFinish = finish,
  spin = 0,
  spinRef,
  epdmThickness,
  epdmRef,
  ...group
}: SdsScrewProps) {
  const geometry = useMemo(() => getSdsGeometry(spec), [spec]);
  const washer = spec.washer;
  const epdm = washer ? epdmPose(spec, epdmThickness ?? washer.epdmThickness) : null;

  return (
    <group {...group}>
      <group ref={spinRef} rotation-y={spin}>
        <mesh geometry={geometry.body}>
          <meshPhysicalMaterial {...finish} />
        </mesh>
        <mesh geometry={geometry.point}>
          <meshPhysicalMaterial {...pointFinish} />
        </mesh>
      </group>
      {washer && geometry.washerSteel && geometry.washerEpdm && epdm && (
        <>
          <mesh geometry={geometry.washerSteel} position-y={-washer.steelThickness} scale-y={washer.steelThickness}>
            <meshPhysicalMaterial {...STEEL_MATERIAL} roughness={0.35} />
          </mesh>
          <mesh ref={epdmRef} geometry={geometry.washerEpdm} position-y={epdm.y} scale={epdm.scale}>
            <meshStandardMaterial {...EPDM_MATERIAL} />
          </mesh>
        </>
      )}
    </group>
  );
}

/**
 * EPDM ring pose for a given thickness: its top stays against the steel ring, and it widens as it
 * compresses so its volume stays roughly constant (a gentle bulge, not a deformation effect).
 */
export function epdmPose(spec: SdsSpec, thickness: number) {
  const washer = spec.washer!;
  const bulge = Math.sqrt(washer.epdmThickness / thickness);
  return {
    y: -washer.steelThickness - thickness,
    scale: [bulge, thickness, bulge] as [number, number, number],
  };
}
