import { ExtrudeGeometry, Path, Shape } from "three";

/**
 * Cold-formed steel profiles for application scenes, in millimetres. Parts are extruded from 2D
 * profiles and can be built already cut at a section plane: the cut then shows as the extrusion's
 * own solid end face (ExtrudeGeometry group 0), which gives clean cutaways without clipping planes.
 */

export type TrapezoidalSheet = {
  /** Distance between rib (crest) centres. */
  ribPitch: number;
  /** Crest top above valley top. */
  ribHeight: number;
  crestWidth: number;
  /** Horizontal run of each sloped web. */
  webRun: number;
  thickness: number;
};

/**
 * Sheet cross-section in the x–y plane between `from` and `to`, with a crest centred on x = 0 and
 * the valley underside at y = `base`. The bottom face follows the top face offset vertically,
 * which keeps flats exact and thins the webs slightly — fine at visualization scale.
 */
/** Height of the sheet's top surface at x, for a valley underside at y = `base`. */
export function sheetTopY(sheet: TrapezoidalSheet, x: number, base: number) {
  const { ribPitch, ribHeight, crestWidth, webRun, thickness } = sheet;
  const offset = Math.abs(x - Math.round(x / ribPitch) * ribPitch);
  const crestEdge = crestWidth / 2;
  const rise = offset <= crestEdge ? 1 : offset >= crestEdge + webRun ? 0 : 1 - (offset - crestEdge) / webRun;
  return base + thickness + rise * ribHeight;
}

export function trapezoidalSheetShape(sheet: TrapezoidalSheet, from: number, to: number, base: number) {
  const { ribPitch, crestWidth, webRun, thickness } = sheet;
  const top = (x: number) => sheetTopY(sheet, x, base);

  const breaks = new Set([from, to]);
  for (let k = Math.floor(from / ribPitch) - 1; k <= Math.ceil(to / ribPitch) + 1; k++) {
    for (const edge of [crestWidth / 2, crestWidth / 2 + webRun]) {
      for (const x of [k * ribPitch - edge, k * ribPitch + edge]) if (x > from && x < to) breaks.add(x);
    }
  }
  const xs = [...breaks].sort((a, b) => a - b);

  const shape = new Shape();
  xs.forEach((x, index) => (index === 0 ? shape.moveTo(x, top(x)) : shape.lineTo(x, top(x))));
  [...xs].reverse().forEach((x) => shape.lineTo(x, top(x) - thickness));
  shape.closePath();
  return shape;
}

export type CPurlin = {
  depth: number;
  flangeWidth: number;
  lip: number;
  thickness: number;
};

/**
 * C-purlin cross-section in the z–y plane (top flange's top face at y = 0, flanges centred on
 * z = 0, web at the back, lips at the front). `part` selects the whole profile or the half behind
 * / in front of the section plane z = 0.
 */
export function cPurlinShapes(purlin: CPurlin, part: "full" | "back" | "front") {
  const { depth, flangeWidth, lip, thickness: t } = purlin;
  const back = -flangeWidth / 2;
  const front = flangeWidth / 2;

  if (part === "full") {
    return [
      polygonShape([
        [back, 0], [front, 0], [front, -lip], [front - t, -lip], [front - t, -t], [back + t, -t],
        [back + t, -depth + t], [front - t, -depth + t], [front - t, -depth + lip], [front, -depth + lip],
        [front, -depth], [back, -depth],
      ]),
    ];
  }
  if (part === "back") {
    return [
      polygonShape([
        [back, 0], [0, 0], [0, -t], [back + t, -t], [back + t, -depth + t], [0, -depth + t], [0, -depth], [back, -depth],
      ]),
    ];
  }
  return [
    polygonShape([[0, 0], [front, 0], [front, -lip], [front - t, -lip], [front - t, -t], [0, -t]]),
    polygonShape([[0, -depth + t], [front - t, -depth + t], [front - t, -depth + lip], [front, -depth + lip], [front, -depth], [0, -depth]]),
  ];
}

/** Closed profile through the given points. */
export function polygonShape(points: readonly (readonly [number, number])[]) {
  const shape = new Shape();
  points.forEach(([u, v], index) => (index === 0 ? shape.moveTo(u, v) : shape.lineTo(u, v)));
  shape.closePath();
  return shape;
}

/** Rectangle from (u0, v0) to (u1, v1); with `wall`, a hollow section of that wall thickness. */
export function rectangleShape(u0: number, v0: number, u1: number, v1: number, wall?: number) {
  const shape = polygonShape([[u0, v0], [u1, v0], [u1, v1], [u0, v1]]);
  if (wall) {
    const hole = new Path();
    hole.moveTo(u0 + wall, v0 + wall);
    hole.lineTo(u0 + wall, v1 - wall);
    hole.lineTo(u1 - wall, v1 - wall);
    hole.lineTo(u1 - wall, v0 + wall);
    hole.closePath();
    shape.holes.push(hole);
  }
  return shape;
}

/** Extrudes an x–y profile along z, from `from` to `to`. */
export function extrudeAlongZ(shapes: Shape | Shape[], from: number, to: number) {
  const geometry = new ExtrudeGeometry(shapes, { depth: to - from, bevelEnabled: false, curveSegments: 1 });
  geometry.translate(0, 0, from);
  return geometry;
}

/** Extrudes a z–y profile along x, centred on x = 0. */
export function extrudeAlongX(shapes: Shape | Shape[], length: number) {
  const geometry = new ExtrudeGeometry(shapes, { depth: length, bevelEnabled: false, curveSegments: 1 });
  // Profile x → world z, extrusion z → world x.
  geometry.rotateY(-Math.PI / 2);
  geometry.translate(length / 2, 0, 0);
  return geometry;
}
