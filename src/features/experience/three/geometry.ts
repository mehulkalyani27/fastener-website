import {
  type BufferGeometry,
  CylinderGeometry,
  Curve,
  ExtrudeGeometry,
  Path,
  Shape,
  TubeGeometry,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { perfSpan } from "@/features/experience/lib/perf";
import { BOLT, type BoltSpec, boltCenterOffset, LONG_BOLT, NUT, TIP_HEIGHT } from "@/features/experience/three/specs";

/** Vertical offset that centers the hero bolt (head top to tip) on the origin. */
export const BOLT_CENTER_OFFSET = boltCenterOffset(BOLT);

export class HelixCurve extends Curve<Vector3> {
  radius: number;
  length: number;
  turns: number;

  constructor(radius: number, length: number, turns: number) {
    super();
    this.radius = radius;
    this.length = length;
    this.turns = turns;
  }

  getPoint(t: number, target = new Vector3()) {
    const angle = t * this.turns * Math.PI * 2;
    return target.set(
      Math.cos(angle) * this.radius,
      -t * this.length,
      Math.sin(angle) * this.radius,
    );
  }
}

function hexagon(radius: number, holeRadius?: number) {
  const shape = new Shape();
  for (let i = 0; i <= 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  if (holeRadius) {
    const hole = new Path();
    hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  return shape;
}

/** Hex prism standing on y = 0 (bevels included), axis along y. */
export function hexPrism(radius: number, height: number, holeRadius?: number, bevel = BOLT.bevel) {
  const geometry = new ExtrudeGeometry(hexagon(radius, holeRadius), {
    depth: height,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 32,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, bevel, 0);
  return geometry;
}

export function merge(parts: BufferGeometry[]) {
  const merged = mergeGeometries(parts.map((part) => (part.index ? part.toNonIndexed() : part)));
  parts.forEach((part) => part.dispose());
  return merged;
}

/** Bolt with the underside of its head at y = 0 and the shank extending down -y. */
function createBoltGeometry(spec: BoltSpec) {
  const { shankRadius, length, threadLength, pitch } = spec;
  const coreRadius = shankRadius * 0.86;
  const plainLength = length - threadLength;

  const shank = new CylinderGeometry(shankRadius, shankRadius, plainLength, 48);
  shank.translate(0, -plainLength / 2, 0);

  const core = new CylinderGeometry(coreRadius, coreRadius, threadLength, 48);
  core.translate(0, -plainLength - threadLength / 2, 0);

  const turns = threadLength / pitch;
  const thread = new TubeGeometry(
    new HelixCurve(coreRadius, threadLength, turns),
    Math.round(turns * 40),
    pitch * 0.42,
    8,
    false,
  );
  thread.translate(0, -plainLength, 0);

  const tip = new CylinderGeometry(coreRadius, coreRadius * 0.7, TIP_HEIGHT, 48);
  tip.translate(0, -length - TIP_HEIGHT / 2, 0);

  return merge([hexPrism(spec.headRadius, spec.headHeight), shank, core, thread, tip]);
}

const cache = new Map<string, BufferGeometry>();

/** Builds a geometry once per key and reuses it (geometries here are shared, never disposed). */
export function cached(key: string, build: () => BufferGeometry) {
  let geometry = cache.get(key);
  if (!geometry) {
    geometry = perfSpan("shared", `geometry-build:${key}`, build);
    cache.set(key, geometry);
  }
  return geometry;
}

export const getBoltGeometry = () => cached("bolt", () => createBoltGeometry(BOLT));

export const getLongBoltGeometry = () => cached("long-bolt", () => createBoltGeometry(LONG_BOLT));

/** Nut with its top face at y = 0. */
export const getNutGeometry = () =>
  cached("nut", () => {
    const geometry = hexPrism(BOLT.headRadius, NUT.bodyHeight, NUT.holeRadius);
    geometry.translate(0, -NUT.height, 0);
    return geometry;
  });
