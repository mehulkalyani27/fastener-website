import { type BufferGeometry, Curve, ExtrudeGeometry, Path, Shape, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { perfSpan } from "@/features/experience/lib/perf";

const DEFAULT_BEVEL = 0.05;

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
export function hexPrism(radius: number, height: number, holeRadius?: number, bevel = DEFAULT_BEVEL) {
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
