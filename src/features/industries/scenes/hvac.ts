import { BRACKET_SDS_VISUAL } from "@/features/experience/three/specs";
import { type DriveStage, stageAmount } from "@/features/industries/lib/drive";
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
 * Scene 3 — HVAC & Ductwork: a hanger bracket fixed to the side wall of a rectangular duct. The
 * fixing frame's y axis is horizontal here (out of the duct wall) and +x is up, so the screw is
 * driven sideways; the cut plane z = 0 crosses the duct. Origin on the duct's outer face.
 * All dimensions are WORKING VISUALIZATION VALUES, not product data.
 */

/** Cross-section: height along x (top edge at `top`), width along -y from the outer face. */
export const DUCT = { height: 300, width: 400, wall: 0.9, top: 70 };
/** Angle bracket: leg on the duct along x, outstanding leg at its top end out along +y. */
export const BRACKET = { thickness: 3, from: -20, to: 30, outstand: 42, halfWidth: 25 };
export const HVAC_SCREW = BRACKET_SDS_VISUAL;

/** Gap between bracket and duct before the screw clamps them. */
export const BRACKET_GAP = 1;
export const DUCT_FACE_Y = CLEARANCE;
export const BRACKET_BACK_Y = DUCT_FACE_Y + BRACKET_GAP;
export const BRACKET_FACE_Y = BRACKET_BACK_Y + BRACKET.thickness;
/** Depth of the duct wall's inside face below the bracket face, before clamping. */
export const DUCT_INSIDE_DEPTH = BRACKET.thickness + BRACKET_GAP + DUCT.wall;

const TIP = HVAC_SCREW.drillPointLength + HVAC_SCREW.tipLength;
const LAND = 0.6;

/** The flange lands on the bracket while the thread in the duct wall pulls the duct against it. */
export const HVAC_CLAMP: DriveStage = {
  window: [0.64, 0.72],
  to: HVAC_SCREW.length,
  turns: (LAND + BRACKET_GAP - CLEARANCE) / HVAC_SCREW.pitch,
  ease: "out",
};

export const HVAC_DRIVE = chapterDrive(HVAC_SCREW, BRACKET_FACE_Y, [
  { window: [0.32, 0.42], to: BRACKET.thickness + HVAC_SCREW.tipLength, turns: 2 },
  { window: [0.42, 0.52], to: DUCT_INSIDE_DEPTH + TIP, turns: 3 },
  { window: [0.52, 0.64], to: HVAC_SCREW.length - LAND, turns: "pitch" },
  HVAC_CLAMP,
]);

/** How far the duct wall has been pulled against the bracket. */
export const hvacClosure = (t: number) => stageAmount(t, HVAC_CLAMP) * (BRACKET_GAP - CLEARANCE);

type HvacLayout = {
  backFrom: number;
  /** Transverse duct joint (flanged), and a second hanger further along the duct. */
  jointZ: number | null;
  secondHangerZ: number | null;
};

export const HVAC_LAYOUT: Record<Tier, HvacLayout> = {
  desktop: { backFrom: -1300, jointZ: -560, secondHangerZ: -900 },
  tablet: { backFrom: -1300, jointZ: -560, secondHangerZ: -900 },
  mobile: { backFrom: -400, jointZ: null, secondHangerZ: null },
};

const S = BRACKET_FACE_Y;
const HOVER = hoverHeadTop(HVAC_DRIVE);
const SEATED = seatedHeadTop(HVAC_DRIVE);

// Azimuth turns towards +x (up) here, elevation towards +y (out from the duct).
export const HVAC_SCENE: IndustrySceneConfig = {
  slug: "hvac-ductwork",
  captions: [
    { key: "setup", window: [0, 0.26] },
    { key: "contact", window: [0.26, 0.32] },
    { key: "drillBracket", window: [0.32, 0.42] },
    { key: "drillDuct", window: [0.42, 0.52] },
    { key: "tap", window: [0.52, 0.64] },
    { key: "clamp", window: HVAC_CLAMP.window },
    { key: "fixed", window: [0.72, 1] },
  ],
  why: [0.72, 0.8],
  up: [1, 0, 0],
  drive: HVAC_DRIVE,
  camera: allTiers([
    axialShot(0, HOVER, 22),
    overHead(0.05, HOVER, 22),
    { at: 0.14, target: [12, 26, 0], distance: [124, 104], azimuth: 16, elevation: 16 },
    { at: 0.26, target: [6, 16, 0], distance: [96, 78], azimuth: 13, elevation: 13 },
    { at: 0.52, target: [4, 5, 0], distance: [76, 62], azimuth: 10, elevation: 9 },
    { at: 0.72, target: [2, 0, 0], distance: [64, 52], azimuth: 10, elevation: 10 },
    { at: 0.8, target: [0, S, 0], distance: [54, 42], azimuth: 28, elevation: 30 },
    { at: 0.86, target: [0, S, 0], distance: [54, 42], azimuth: 28, elevation: 30 },
    overHead(0.93, SEATED, 28),
    axialShot(1, SEATED, 28),
  ]),
};
