import type { CPurlin, TrapezoidalSheet } from "@/features/experience/three/profiles";
import { ROOFING_SDS_VISUAL } from "@/features/experience/three/specs";
import type { ScrewDrive } from "@/features/industries/lib/drive";
import { axialShot, CLEARANCE, type IndustrySceneConfig, overHead, seatedHeadTop } from "@/features/industries/lib/scene";
import { smoothstep, type Tier, windowProgress } from "@/features/industries/lib/story";

/*
 * Scene 1 — Metal Roofing & Cladding: a trapezoidal sheet crest-fixed to a C-purlin.
 * Fixing frame (mm): origin on the purlin's top face on the screw axis, cut plane z = 0.
 * All dimensions are WORKING VISUALIZATION VALUES, not product data.
 */

export const ROOFING_TIMELINE = {
  establish: [0, 0.12],
  approach: [0.12, 0.28],
  contact: [0.28, 0.34],
  drillSheet: [0.34, 0.4],
  cavity: [0.4, 0.46],
  drillPurlin: [0.46, 0.56],
  tap: [0.56, 0.66],
  seat: [0.66, 0.7],
  result: [0.7, 0.84],
  dive: [0.84, 1],
} as const;

export const ROOFING_SHEET: TrapezoidalSheet = {
  ribPitch: 250,
  ribHeight: 35,
  crestWidth: 40,
  webRun: 30,
  // Exaggerated from a typical ~0.5 mm so the cut face reads on screen.
  thickness: 1.2,
};
export const ROOFING_PURLIN: CPurlin = { depth: 150, flangeWidth: 60, lip: 15, thickness: 2.5 };
export const ROOFING_SCREW = ROOFING_SDS_VISUAL;

export const SHEET_BASE_Y = CLEARANCE;
export const CREST_TOP = SHEET_BASE_Y + ROOFING_SHEET.thickness + ROOFING_SHEET.ribHeight;
export const CREST_UNDERSIDE = CREST_TOP - ROOFING_SHEET.thickness;

const washer = ROOFING_SCREW.washer!;
const PURLIN_THROUGH = CREST_TOP + ROOFING_PURLIN.thickness + ROOFING_SCREW.drillPointLength + ROOFING_SCREW.tipLength;

export const ROOFING_DRIVE: ScrewDrive = {
  spec: ROOFING_SCREW,
  surfaceY: CREST_TOP,
  hover: { x: 70, lift: 150, tilt: (14 * Math.PI) / 180 },
  gap: 20,
  approach: ROOFING_TIMELINE.approach,
  align: [0.17, ROOFING_TIMELINE.approach[1]],
  stages: [
    { window: ROOFING_TIMELINE.contact, to: 0, turns: 0.5, ease: "in" },
    { window: ROOFING_TIMELINE.drillSheet, to: ROOFING_SHEET.thickness + ROOFING_SCREW.tipLength, turns: 2 },
    { window: ROOFING_TIMELINE.cavity, to: CREST_TOP, turns: 3 },
    // Threads only engage once the fluted drill point is fully through the flange.
    { window: ROOFING_TIMELINE.drillPurlin, to: PURLIN_THROUGH, turns: 3 },
    { window: ROOFING_TIMELINE.tap, to: ROOFING_SCREW.length - washer.steelThickness - washer.epdmThickness, turns: "pitch" },
    { window: ROOFING_TIMELINE.seat, to: ROOFING_SCREW.length - washer.steelThickness - washer.epdmMinThickness, turns: "pitch", ease: "out" },
  ],
};

type RoofingLayout = {
  sheetFrom: number;
  sheetTo: number;
  /** Sheet extent behind the cut plane (z < 0). */
  backFrom: number;
  /** Portion in front of the cut plane, removed during the approach; null = always cut. */
  frontTo: number | null;
  purlinLength: number;
  secondPurlinZ: number | null;
  contextCrests: readonly number[];
};

/** Per tier: desktop has full context; tablet one installed screw; mobile only the fixing. */
export const ROOFING_LAYOUT: Record<Tier, RoofingLayout> = {
  desktop: { sheetFrom: -375, sheetTo: 375, backFrom: -1150, frontTo: 260, purlinLength: 900, secondPurlinZ: -900, contextCrests: [-250, 0, 250] },
  tablet: { sheetFrom: -375, sheetTo: 375, backFrom: -1150, frontTo: 260, purlinLength: 900, secondPurlinZ: -900, contextCrests: [0] },
  mobile: { sheetFrom: -125, sheetTo: 125, backFrom: -300, frontTo: null, purlinLength: 300, secondPurlinZ: null, contextCrests: [] },
};

const F = CREST_TOP;
const H = seatedHeadTop(ROOFING_DRIVE);

export const ROOFING_SCENE: IndustrySceneConfig = {
  slug: "metal-roofing-cladding",
  captions: [
    { key: "setup", window: [0, ROOFING_TIMELINE.approach[1]] },
    { key: "contact", window: ROOFING_TIMELINE.contact },
    { key: "drillSheet", window: ROOFING_TIMELINE.drillSheet },
    { key: "cavity", window: ROOFING_TIMELINE.cavity },
    { key: "drillPurlin", window: ROOFING_TIMELINE.drillPurlin },
    { key: "tap", window: ROOFING_TIMELINE.tap },
    { key: "seat", window: ROOFING_TIMELINE.seat },
    { key: "fixed", window: [ROOFING_TIMELINE.result[0], 1] },
  ],
  why: [0.72, 0.8],
  up: [0, 1, 0],
  drive: ROOFING_DRIVE,
  camera: {
    desktop: [
      { at: 0, target: [0, 10, -330], distance: 1500, azimuth: 34, elevation: 30 },
      { at: 0.12, target: [0, 10, -320], distance: 1440, azimuth: 32, elevation: 29 },
      { at: 0.28, target: [0, F + 30, 0], distance: 380, azimuth: 22, elevation: 16 },
      { at: 0.34, target: [0, F + 18, 0], distance: 300, azimuth: 16, elevation: 10 },
      { at: 0.56, target: [0, 20, 0], distance: 200, azimuth: 11, elevation: 5 },
      { at: 0.7, target: [0, 12, 0], distance: 195, azimuth: 13, elevation: 7 },
      { at: 0.8, target: [0, F + 2, 0], distance: 125, azimuth: 30, elevation: 24 },
      { at: 0.86, target: [0, F + 2, 0], distance: 125, azimuth: 30, elevation: 24 },
      overHead(0.93, H, 30),
      axialShot(1, H, 30),
    ],
    tablet: [
      { at: 0, target: [0, 12, -200], distance: 1000, azimuth: 30, elevation: 28 },
      { at: 0.12, target: [0, 12, -190], distance: 960, azimuth: 28, elevation: 27 },
      { at: 0.28, target: [0, F + 30, 0], distance: 380, azimuth: 20, elevation: 15 },
      { at: 0.34, target: [0, F + 18, 0], distance: 300, azimuth: 15, elevation: 10 },
      { at: 0.56, target: [0, 20, 0], distance: 205, azimuth: 11, elevation: 5 },
      { at: 0.7, target: [0, 12, 0], distance: 200, azimuth: 12, elevation: 7 },
      { at: 0.8, target: [0, F + 2, 0], distance: 130, azimuth: 26, elevation: 22 },
      { at: 0.86, target: [0, F + 2, 0], distance: 130, azimuth: 26, elevation: 22 },
      overHead(0.93, H, 26),
      axialShot(1, H, 26),
    ],
    mobile: [
      { at: 0, target: [20, 125, -20], distance: 640, azimuth: 26, elevation: 18 },
      { at: 0.12, target: [18, 120, -15], distance: 610, azimuth: 24, elevation: 17 },
      { at: 0.28, target: [0, F + 30, 0], distance: 430, azimuth: 18, elevation: 13 },
      { at: 0.34, target: [0, F + 18, 0], distance: 320, azimuth: 14, elevation: 10 },
      { at: 0.56, target: [0, 20, 0], distance: 245, azimuth: 10, elevation: 5 },
      { at: 0.7, target: [0, 12, 0], distance: 240, azimuth: 11, elevation: 7 },
      { at: 0.8, target: [0, F + 2, 0], distance: 150, azimuth: 22, elevation: 22 },
      { at: 0.86, target: [0, F + 2, 0], distance: 150, azimuth: 22, elevation: 22 },
      overHead(0.93, H, 22),
      axialShot(1, H, 22),
    ],
  },
};

/** Front (z > 0) pieces slide toward the camera and fade, opening the cutaway. */
export const roofingReveal = (t: number) => ({
  offset: smoothstep(windowProgress(t, [0.17, ROOFING_TIMELINE.approach[1]])) * 220,
  opacity: 1 - smoothstep(windowProgress(t, [0.2, ROOFING_TIMELINE.approach[1]])),
});

