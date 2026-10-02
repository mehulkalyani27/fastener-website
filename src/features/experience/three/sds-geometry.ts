import { type BufferGeometry, ConeGeometry, CylinderGeometry, ExtrudeGeometry, Path, Shape, TubeGeometry } from "three";
import { perfSpan } from "@/features/experience/lib/perf";
import { HelixCurve, hexPrism, merge } from "@/features/experience/three/geometry";
import { type SdsSpec, sdsCoreRadius, sdsThreadedLength } from "@/features/experience/three/specs";

const RADIAL = 40;
const HEAD_BEVEL = 0.3;

/**
 * Fluted drill section: a two-lobed cross-section (the concave waist forms the flutes), extruded
 * along the axis and twisted one turn, so it reads as a drill rather than a plain cylinder.
 * Spans y = 0 down to y = -length.
 */
function drillFlutes(radius: number, length: number) {
  const shape = new Shape();
  const samples = 64;
  for (let index = 0; index <= samples; index++) {
    const angle = (index / samples) * Math.PI * 2;
    const r = radius * (0.5 + 0.5 * Math.pow(Math.abs(Math.cos(angle)), 0.6));
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const geometry = new ExtrudeGeometry(shape, { depth: length, steps: 24, bevelEnabled: false, curveSegments: 8 });
  geometry.rotateX(Math.PI / 2);

  // Twist: rotate each vertex (and its normal) about the axis in proportion to its depth.
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  for (let index = 0; index < position.count; index++) {
    const angle = (-position.getY(index) / length) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = position.getX(index);
    const z = position.getZ(index);
    position.setX(index, x * cos - z * sin);
    position.setZ(index, x * sin + z * cos);
    const nx = normal.getX(index);
    const nz = normal.getZ(index);
    normal.setX(index, nx * cos - nz * sin);
    normal.setZ(index, nx * sin + nz * cos);
  }
  return geometry;
}

/** Flat ring of unit height standing on y = 0, so it can be compressed by scaling y. */
function ring(outerRadius: number, innerRadius: number) {
  const shape = new Shape();
  shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
  const hole = new Path();
  hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geometry = new ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false, curveSegments: 48 });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

export type SdsGeometry = {
  /** Head, flange and threaded shank. */
  body: BufferGeometry;
  /** Drill flutes and tip — separate so a bi-metal screw can use a second material. */
  point: BufferGeometry;
  washerSteel?: BufferGeometry;
  washerEpdm?: BufferGeometry;
};

function createSdsGeometry(spec: SdsSpec): SdsGeometry {
  const core = sdsCoreRadius(spec);
  const threaded = sdsThreadedLength(spec);
  const threadDepth = spec.diameter / 2 - core;

  const flange = new CylinderGeometry(spec.flangeDiameter / 2, spec.flangeDiameter / 2, spec.flangeThickness, RADIAL);
  flange.translate(0, spec.flangeThickness / 2, 0);

  const head = hexPrism(spec.headAcrossFlats / Math.sqrt(3), spec.headHeight - HEAD_BEVEL * 2, undefined, HEAD_BEVEL);
  head.translate(0, spec.flangeThickness, 0);

  const shank = new CylinderGeometry(core, core, threaded, RADIAL);
  shank.translate(0, -threaded / 2, 0);

  // Thread from just under the flange to the start of the drill point.
  const threadStart = 0.8;
  const threadLength = threaded - threadStart;
  const turns = threadLength / spec.pitch;
  const thread = new TubeGeometry(new HelixCurve(core, threadLength, turns), Math.round(turns * 32), threadDepth, 8, false);
  thread.translate(0, -threadStart, 0);

  const flutes = drillFlutes(core * 1.02, spec.drillPointLength);
  flutes.translate(0, -threaded, 0);

  const tip = new ConeGeometry(core * 1.02, spec.tipLength, RADIAL);
  tip.rotateX(Math.PI);
  tip.translate(0, -threaded - spec.drillPointLength - spec.tipLength / 2, 0);

  const washer = spec.washer;
  const bore = spec.diameter / 2 + 0.15;
  return {
    body: merge([flange, head, shank, thread]),
    point: merge([flutes, tip]),
    washerSteel: washer ? ring(washer.diameter / 2, bore) : undefined,
    washerEpdm: washer ? ring(washer.diameter / 2, bore) : undefined,
  };
}

const sdsCache = new Map<string, SdsGeometry>();

/** One shared geometry set per spec. */
export function getSdsGeometry(spec: SdsSpec) {
  const key = JSON.stringify(spec);
  let geometry = sdsCache.get(key);
  if (!geometry) {
    geometry = perfSpan("shared", `geometry-build:sds-${spec.length}mm`, () => createSdsGeometry(spec));
    sdsCache.set(key, geometry);
  }
  return geometry;
}

