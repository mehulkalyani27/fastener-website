import { HEAVY_SDS_VISUAL } from "@/features/experience/three/specs";
import {
  allTiers,
  axialShot,
  CHAPTER,
  chapterDrive,
  CLEARANCE,
  hoverHeadTop,
  type IndustrySceneConfig,
  overHead,
} from "@/features/industries/lib/scene";
import { type CameraKeyframe, fade, type Tier } from "@/features/industries/lib/story";

/*
 * Scene 5 — Industrial Machinery & Enclosures: a thick steel cover plate fixed to a frame angle.
 * Fixing frame (mm): origin on the angle's top face on the screw axis, cut plane z = 0.
 * All dimensions are WORKING VISUALIZATION VALUES, not product data.
 */

/** Equal angle: horizontal leg under the plate (top face at y = 0), vertical leg down at its outer edge. */
export const FRAME_ANGLE = { leg: 80, thickness: 6, from: -40 };
export const COVER_PLATE = { thickness: 6, from: -40 };
export const MACHINERY_SCREW = HEAVY_SDS_VISUAL;

export const PLATE_BASE_Y = CLEARANCE;
export const PLATE_TOP_Y = PLATE_BASE_Y + COVER_PLATE.thickness;
/** Everything the drill point has to get through before the thread may engage. */
export const STACK_THICKNESS = COVER_PLATE.thickness + CLEARANCE + FRAME_ANGLE.thickness;

const TIP = MACHINERY_SCREW.drillPointLength + MACHINERY_SCREW.tipLength;
const LAND = 0.6;

export const MACHINERY_DRIVE = chapterDrive(MACHINERY_SCREW, PLATE_TOP_Y, [
  { window: [0.32, 0.4], to: COVER_PLATE.thickness + MACHINERY_SCREW.tipLength, turns: 2 },
  { window: [0.4, 0.54], to: STACK_THICKNESS + TIP, turns: 4 },
  { window: [0.54, 0.68], to: MACHINERY_SCREW.length - LAND, turns: "pitch" },
  { window: [0.68, 0.72], to: MACHINERY_SCREW.length, turns: "pitch", ease: "out" },
]);

/** Dimension marks comparing the drill point with the stack, shown while the screw settles. */
export const dimensionOpacity = (t: number) => fade(t, [0.14, 0.2], [0.3, 0.34]);

type MachineryLayout = {
  plateTo: number;
  backFrom: number;
  /** A second frame angle under the far edge of the plate (fixing x), and installed screws along z. */
  farAngleX: number | null;
  installedZ: readonly number[];
  finale: CameraKeyframe;
};

export const MACHINERY_LAYOUT: Record<Tier, MachineryLayout> = {
  desktop: {
    plateTo: 280,
    backFrom: -520,
    farAngleX: 240,
    installedZ: [-170, -340],
    finale: { at: 1, target: [120, -12, -190], distance: [540, 340], azimuth: 32, elevation: 30 },
  },
  tablet: {
    plateTo: 280,
    backFrom: -520,
    farAngleX: 240,
    installedZ: [-170, -340],
    finale: { at: 1, target: [120, -12, -190], distance: [540, 340], azimuth: 32, elevation: 30 },
  },
  mobile: {
    plateTo: 110,
    backFrom: -260,
    farAngleX: null,
    installedZ: [-170],
    finale: { at: 1, target: [30, -12, -90], distance: [230, 190], azimuth: 30, elevation: 28 },
  },
};

const S = PLATE_TOP_Y;
const HOVER = hoverHeadTop(MACHINERY_DRIVE);

const SHOTS: readonly CameraKeyframe[] = [
  axialShot(0, HOVER, 20),
  overHead(0.05, HOVER, 20),
  { at: CHAPTER.reveal[1], target: [0, 40, 0], distance: [130, 132], azimuth: 20, elevation: 12 },
  { at: CHAPTER.settle[1], target: [0, 28, 0], distance: [92, 92], azimuth: 14, elevation: 8 },
  { at: 0.54, target: [0, 4, 0], distance: [80, 80], azimuth: 12, elevation: 6 },
  { at: 0.72, target: [0, -12, 0], distance: [78, 78], azimuth: 14, elevation: 8 },
  { at: 0.8, target: [0, S, 0], distance: [58, 44], azimuth: 30, elevation: 26 },
  { at: 0.86, target: [0, S, 0], distance: [58, 44], azimuth: 30, elevation: 26 },
];
const TIER_SHOTS = allTiers(SHOTS);

/** Last chapter: ends on a pull-back over the finished enclosure instead of a dive. */
export const MACHINERY_SCENE: IndustrySceneConfig = {
  slug: "industrial-machinery-enclosures",
  captions: [
    { key: "setup", window: [0, 0.14] },
    { key: "drillLength", window: [0.14, 0.26] },
    { key: "contact", window: [0.26, 0.32] },
    { key: "drillPlate", window: [0.32, 0.4] },
    { key: "drillFrame", window: [0.4, 0.54] },
    { key: "tap", window: [0.54, 0.68] },
    { key: "seat", window: [0.68, 0.72] },
    { key: "fixed", window: [0.72, 1] },
  ],
  why: [0.72, 0.8],
  up: [0, 1, 0],
  drive: MACHINERY_DRIVE,
  camera: {
    desktop: [...TIER_SHOTS.desktop, MACHINERY_LAYOUT.desktop.finale],
    tablet: [...TIER_SHOTS.tablet, MACHINERY_LAYOUT.tablet.finale],
    mobile: [...TIER_SHOTS.mobile, MACHINERY_LAYOUT.mobile.finale],
  },
};
