import type { CPurlin } from "@/features/experience/three/profiles";
import { BIMETAL_SDS_VISUAL } from "@/features/experience/three/specs";
import {
  allTiers,
  axialShot,
  chapterDrive,
  CLEARANCE,
  hoverHeadTop,
  type IndustrySceneConfig,
  overHead,
  seatedHeadTop,
} from "@/features/industries/lib/scene";
import type { Tier } from "@/features/industries/lib/story";

/*
 * Scene 4 — Solar & Structural Framing: an aluminium L-foot for a panel rail fixed to a steel
 * C-purlin. Fixing frame (mm): origin on the purlin's top face on the screw axis, cut plane z = 0.
 * All dimensions are WORKING VISUALIZATION VALUES, not product data.
 */

export const SOLAR_PURLIN: CPurlin = { depth: 150, flangeWidth: 60, lip: 15, thickness: 2.5 };
/** Foot profile in z–y: base plate on the purlin, upright leg at the back carrying the rail. */
export const L_FOOT = { base: 5, from: -35, to: 25, leg: 5, legTop: 78, width: 50 };
/** Rail: hollow section running along x behind the foot's leg. */
export const RAIL = { from: -75.05, to: -35.05, bottom: 40, top: 80, wall: 2 };
export const PANEL = { thickness: 35, back: -1000, front: -20 };
export const SOLAR_SCREW = BIMETAL_SDS_VISUAL;

export const FOOT_BASE_Y = CLEARANCE;
export const FOOT_TOP_Y = FOOT_BASE_Y + L_FOOT.base;

const TIP = SOLAR_SCREW.drillPointLength + SOLAR_SCREW.tipLength;
const LAND = 0.6;
export const PURLIN_BOTTOM_DEPTH = L_FOOT.base + CLEARANCE + SOLAR_PURLIN.thickness;

export const SOLAR_DRIVE = chapterDrive(SOLAR_SCREW, FOOT_TOP_Y, [
  { window: [0.32, 0.42], to: L_FOOT.base + SOLAR_SCREW.tipLength, turns: 2 },
  { window: [0.42, 0.54], to: PURLIN_BOTTOM_DEPTH + TIP, turns: 3 },
  { window: [0.54, 0.68], to: SOLAR_SCREW.length - LAND, turns: "pitch" },
  { window: [0.68, 0.72], to: SOLAR_SCREW.length, turns: "pitch", ease: "out" },
]);

type SolarLayout = { purlinLength: number; railLength: number; panel: boolean };

export const SOLAR_LAYOUT: Record<Tier, SolarLayout> = {
  desktop: { purlinLength: 1100, railLength: 1400, panel: true },
  tablet: { purlinLength: 1100, railLength: 1400, panel: true },
  mobile: { purlinLength: 360, railLength: 420, panel: false },
};

const S = FOOT_TOP_Y;
const HOVER = hoverHeadTop(SOLAR_DRIVE);
const SEATED = seatedHeadTop(SOLAR_DRIVE);

export const SOLAR_SCENE: IndustrySceneConfig = {
  slug: "solar-structural-framing",
  captions: [
    { key: "setup", window: [0, 0.26] },
    { key: "contact", window: [0.26, 0.32] },
    { key: "drillFoot", window: [0.32, 0.42] },
    { key: "drillPurlin", window: [0.42, 0.54] },
    { key: "tap", window: [0.54, 0.68] },
    { key: "seat", window: [0.68, 0.72] },
    { key: "fixed", window: [0.72, 1] },
  ],
  why: [0.72, 0.8],
  up: [0, 1, 0],
  drive: SOLAR_DRIVE,
  camera: allTiers([
    axialShot(0, HOVER, 26),
    overHead(0.05, HOVER, 26),
    { at: 0.14, target: [0, 36, -14], distance: [150, 124], azimuth: 28, elevation: 14 },
    { at: 0.26, target: [0, 24, 0], distance: [104, 84], azimuth: 22, elevation: 12 },
    { at: 0.54, target: [0, 8, 0], distance: [82, 66], azimuth: 14, elevation: 8 },
    { at: 0.72, target: [0, -8, 0], distance: [72, 60], azimuth: 14, elevation: 8 },
    { at: 0.8, target: [0, S, 0], distance: [56, 44], azimuth: 32, elevation: 26 },
    { at: 0.86, target: [0, S, 0], distance: [56, 44], azimuth: 32, elevation: 26 },
    overHead(0.93, SEATED, 32),
    axialShot(1, SEATED, 32),
  ]),
};
