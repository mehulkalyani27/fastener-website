import type { CPurlin, TrapezoidalSheet } from "@/features/experience/three/profiles";
import { STITCH_SDS_VISUAL } from "@/features/experience/three/specs";
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
 * Scene 2 — Pre-Engineered Buildings: the side lap of two cladding sheets stitched on the lapped
 * crest. Fixing frame (mm): origin under the inner sheet on the screw axis, cut plane z = 0.
 * All dimensions are WORKING VISUALIZATION VALUES, not product data.
 */

export const PEB_SHEET: TrapezoidalSheet = {
  ribPitch: 200,
  ribHeight: 30,
  crestWidth: 30,
  webRun: 25,
  // Exaggerated from a typical ~0.5 mm so the cut face reads on screen.
  thickness: 1,
};
export const PEB_GIRT: CPurlin = { depth: 150, flangeWidth: 60, lip: 15, thickness: 2 };
export const PEB_SCREW = STITCH_SDS_VISUAL;

/** Gap between the lapped crests before the screw pulls them together. */
export const LAP_GAP = 2;
export const INNER_BASE_Y = CLEARANCE;
const INNER_CREST_TOP = INNER_BASE_Y + PEB_SHEET.thickness + PEB_SHEET.ribHeight;
/** The outer sheet's lapped crest rests `LAP_GAP` above the inner one. */
export const OUTER_BASE_Y = INNER_CREST_TOP + LAP_GAP - PEB_SHEET.ribHeight;
export const LAP_TOP = OUTER_BASE_Y + PEB_SHEET.thickness + PEB_SHEET.ribHeight;
/** Depth of the inner sheet's underside below the lap top, before it is pulled up. */
export const INNER_BOTTOM_DEPTH = 2 * PEB_SHEET.thickness + LAP_GAP;

const washer = PEB_SCREW.washer!;
const TIP = PEB_SCREW.drillPointLength + PEB_SCREW.tipLength;
const SEATED_DEPTH = PEB_SCREW.length - washer.steelThickness - washer.epdmMinThickness;
const TOUCH_DEPTH = PEB_SCREW.length - washer.steelThickness - washer.epdmThickness;

/** Washer touches, then the thread in the inner sheet pulls it up while the washer compresses. */
export const PEB_CLAMP: DriveStage = {
  window: [0.64, 0.72],
  to: SEATED_DEPTH,
  // Relative to the inner sheet the screw still advances one pitch per turn.
  turns: (SEATED_DEPTH - TOUCH_DEPTH + LAP_GAP - CLEARANCE) / PEB_SCREW.pitch,
  ease: "out",
};

export const PEB_DRIVE = chapterDrive(PEB_SCREW, LAP_TOP, [
  { window: [0.32, 0.4], to: PEB_SHEET.thickness + PEB_SCREW.tipLength, turns: 2 },
  { window: [0.4, 0.5], to: INNER_BOTTOM_DEPTH + TIP, turns: 4 },
  { window: [0.5, 0.64], to: TOUCH_DEPTH, turns: "pitch" },
  PEB_CLAMP,
]);

/** How far the inner sheet has been pulled up towards the outer one. */
export const pebLapClosure = (t: number) => stageAmount(t, PEB_CLAMP) * (LAP_GAP - CLEARANCE);

type PebLayout = {
  outer: readonly [number, number];
  inner: readonly [number, number];
  backFrom: number;
  girt: { z: number; length: number } | null;
  /** Stitching screws already installed along the lap. */
  stitches: readonly number[];
};

export const PEB_LAYOUT: Record<Tier, PebLayout> = {
  desktop: { outer: [-55, 300], inner: [-300, 55], backFrom: -900, girt: { z: -520, length: 600 }, stitches: [-280, -640] },
  tablet: { outer: [-55, 300], inner: [-300, 55], backFrom: -900, girt: { z: -520, length: 600 }, stitches: [-280] },
  mobile: { outer: [-55, 150], inner: [-150, 55], backFrom: -320, girt: null, stitches: [] },
};

const S = LAP_TOP;
const HOVER = hoverHeadTop(PEB_DRIVE);
const SEATED = seatedHeadTop(PEB_DRIVE);

export const PEB_SCENE: IndustrySceneConfig = {
  slug: "pre-engineered-buildings",
  captions: [
    { key: "setup", window: [0, 0.26] },
    { key: "contact", window: [0.26, 0.32] },
    { key: "drillOuter", window: [0.32, 0.4] },
    { key: "drillInner", window: [0.4, 0.5] },
    { key: "tap", window: [0.5, 0.64] },
    { key: "clamp", window: PEB_CLAMP.window },
    { key: "fixed", window: [0.72, 1] },
  ],
  why: [0.72, 0.8],
  up: [0, 1, 0],
  drive: PEB_DRIVE,
  camera: allTiers([
    axialShot(0, HOVER, 24),
    overHead(0.05, HOVER, 24),
    { at: 0.14, target: [0, 46, 0], distance: [150, 118], azimuth: 24, elevation: 14 },
    { at: 0.26, target: [0, S + 4, 0], distance: [112, 84], azimuth: 18, elevation: 10 },
    { at: 0.5, target: [0, S - 2, 0], distance: [86, 64], azimuth: 12, elevation: 6 },
    { at: 0.72, target: [0, S - 4, 0], distance: [70, 54], azimuth: 14, elevation: 8 },
    { at: 0.8, target: [0, S, 0], distance: [58, 44], azimuth: 30, elevation: 24 },
    { at: 0.86, target: [0, S, 0], distance: [58, 44], azimuth: 30, elevation: 24 },
    overHead(0.93, SEATED, 30),
    axialShot(1, SEATED, 30),
  ]),
};
