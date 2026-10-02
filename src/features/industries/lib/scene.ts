import type { SdsSpec } from "@/features/experience/three/specs";
import { type DriveStage, type ScrewDrive, seatedHeadTopY } from "@/features/industries/lib/drive";
import {
  type CameraKeyframe,
  fade,
  smoothstep,
  type StoryWindow,
  type Tier,
  type Vec3,
  windowProgress,
} from "@/features/industries/lib/story";

/**
 * What every application scene provides. Scenes are modelled in a "fixing frame" (mm): screw axis
 * vertical (+y towards the head), fixing point on the axis, cutaway plane z = 0 facing +z. `up` is
 * the real-world vertical in that frame, used as the camera's up (a duct side wall is fixed sideways).
 * Timings are in chapter progress (0 → 1).
 */
export type IndustrySceneConfig = {
  slug: string;
  captions: readonly { key: string; window: StoryWindow }[];
  why: StoryWindow;
  up: Vec3;
  drive: ScrewDrive;
  camera: Record<Tier, readonly CameraKeyframe[]>;
};

export const CAMERA_FOV: Record<Tier, number> = { desktop: 28, tablet: 30, mobile: 32 };

/** Gap between touching faces so they never flicker. */
export const CLEARANCE = 0.05;

/** Timeline shared by the chapters after the first: out of the previous head, settle, drive, result, into the head. */
export const CHAPTER = {
  reveal: [0, 0.14],
  settle: [0.14, 0.26],
  contact: [0.26, 0.32],
  result: [0.72, 0.84],
  dive: [0.84, 1],
} as const satisfies Record<string, StoryWindow>;

/** A chapter's screw: waits aligned above the fixing point, settles, touches, then runs `stages`. */
export function chapterDrive(spec: SdsSpec, surfaceY: number, stages: readonly DriveStage[]): ScrewDrive {
  return {
    spec,
    surfaceY,
    hover: { x: 0, lift: 30, tilt: 0 },
    gap: 6,
    approach: CHAPTER.settle,
    align: CHAPTER.settle,
    stages: [{ window: CHAPTER.contact, to: 0, turns: 0.5, ease: "in" }, ...stages],
  };
}

/**
 * Chapter transition: each chapter ends looking straight down its screw from so close that only the
 * flat top of the hex head is in frame, and the next one starts the same way on its own screw. All
 * screws share the head, so the change of scene happens on an identical image.
 */
export const AXIAL_DISTANCE = 7;
export const AXIAL_ELEVATION = 88;

export const axialShot = (at: number, headTop: Vec3, azimuth: number): CameraKeyframe => ({
  at,
  target: headTop,
  distance: AXIAL_DISTANCE,
  azimuth,
  elevation: AXIAL_ELEVATION,
});

/** Just above the head, turning onto its axis: between a working view and the axial shot. */
export const overHead = (at: number, headTop: Vec3, azimuth: number): CameraKeyframe => ({
  at,
  target: headTop,
  distance: 40,
  azimuth,
  elevation: 70,
});

const headTopOffset = (spec: SdsSpec) => spec.flangeThickness + spec.headHeight;

/** Head top of the screw waiting before the approach. */
export const hoverHeadTop = (drive: ScrewDrive): Vec3 => [
  drive.hover.x,
  drive.surfaceY + drive.hover.lift + drive.spec.length + headTopOffset(drive.spec),
  0,
];

export const seatedHeadTop = (drive: ScrewDrive): Vec3 => [0, seatedHeadTopY(drive), 0];

/**
 * Same shots on every tier (fitted distances adapt them to the canvas). Phones fit a narrower
 * slice, since a tall canvas showing the full width would leave the screw small.
 */
export function allTiers(keyframes: readonly CameraKeyframe[], mobileWidth = 0.75): Record<Tier, readonly CameraKeyframe[]> {
  const mobile = keyframes.map((keyframe) =>
    typeof keyframe.distance === "number"
      ? keyframe
      : { ...keyframe, distance: [keyframe.distance[0] * mobileWidth, keyframe.distance[1]] as const },
  );
  return { desktop: keyframes, tablet: keyframes, mobile };
}

/** How far context parts ease toward the background while the screw works (0 → 0.2 → 0). */
export const contextDim = (t: number) =>
  0.2 * (smoothstep(windowProgress(t, [0.28, 0.36])) - smoothstep(windowProgress(t, [0.72, 0.8])));

/** Accent ring around the seated screw: gone before the dive, or held to the end (last chapter). */
export const highlightOpacity = (t: number, hold: boolean) =>
  hold ? fade(t, [0.72, 0.8]) : fade(t, [0.72, 0.8], [0.84, 0.88]);
