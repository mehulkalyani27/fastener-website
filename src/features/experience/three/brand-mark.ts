import { Shape, ShapeGeometry } from "three";
import { LOGO_MARK_PATHS, LOGO_MARK_SIZE } from "@/components/layout/logo-mark-paths";

/** Points of an M/L/H/V/Z path (the only commands the logo uses). */
function points(path: string) {
  const result: [number, number][] = [];
  let x = 0;
  let y = 0;
  for (const [, command, args] of path.matchAll(/([MLHV])([^MLHVZ]*)/g)) {
    const [a, b] = args.match(/-?\d*\.?\d+/g)!.map(Number);
    if (command === "H") x = a;
    else if (command === "V") y = a;
    else [x, y] = [a, b];
    result.push([x, y]);
  }
  return result;
}

/** The Metacore logo mark as a flat shape in the xz plane facing +y, `width` wide, centred on the origin (up is -z). */
export function brandMark(width: number) {
  const scale = width / LOGO_MARK_SIZE.width;
  const shapes = LOGO_MARK_PATHS.map((path) => {
    const shape = new Shape();
    points(path).forEach(([x, y], index) => {
      const px = (x - LOGO_MARK_SIZE.width / 2) * scale;
      const py = (LOGO_MARK_SIZE.height / 2 - y) * scale;
      if (index === 0) shape.moveTo(px, py);
      else shape.lineTo(px, py);
    });
    return shape;
  });
  const geometry = new ShapeGeometry(shapes);
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}
