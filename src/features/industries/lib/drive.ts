import type { SdsSpec } from "@/features/experience/three/specs";
import { clamp01, lerp, smoothstep, type StoryWindow, windowProgress } from "@/features/industries/lib/story";

/**
 * One stage of driving the screw: over `window`, the tip goes from the previous stage's depth to
 * `to` (mm below the fixing surface). `turns` are visible rotations; "pitch" means the thread is
 * engaged, so the screw advances exactly one pitch per turn.
 */
export type DriveStage = {
  window: StoryWindow;
  to: number;
  turns: number | "pitch";
  /** "in" eases into the first touch; "out" eases into the final seat. */
  ease?: "in" | "out";
};

export type ScrewDrive = {
  spec: SdsSpec;
  /** y of the fixing surface (top of the first layer) in the scene's fixing frame. */
  surfaceY: number;
  /** Where the screw waits before the approach: sideways offset, height of the tip above the surface, lean. */
  hover: { x: number; lift: number; tilt: number };
  /** Tip clearance above the surface once the approach ends. */
  gap: number;
  /** Hover → above the fixing point, and the lean straightening. */
  approach: StoryWindow;
  align: StoryWindow;
  /** From contact to seated; the first stage starts at -gap. */
  stages: readonly DriveStage[];
};

export type ScrewPose = {
  x: number;
  /** y of the head's underside. */
  headY: number;
  tilt: number;
  /** Radians about the screw axis; negative = driving in (right-hand thread). */
  spin: number;
  /** Tip depth below the fixing surface (negative = above it). */
  depth: number;
  epdmThickness: number;
};

/** Eased progress through one stage, as the drive applies it (also drives parts that move with it). */
export function stageAmount(t: number, stage: DriveStage) {
  const raw = windowProgress(t, stage.window);
  return stage.ease === "in" ? smoothstep(raw) : stage.ease === "out" ? 1 - (1 - raw) * (1 - raw) : raw;
}

/** Screw pose from story progress — pure, so scrolling back replays it exactly. */
export function screwPoseAt(t: number, drive: ScrewDrive): ScrewPose {
  const { spec, surfaceY, hover, gap } = drive;
  let depth = -gap;
  let from = -gap;
  let turns = 0;
  for (const stage of drive.stages) {
    const raw = windowProgress(t, stage.window);
    const amount = stageAmount(t, stage);
    const stageTurns = stage.turns === "pitch" ? (stage.to - from) / spec.pitch : stage.turns;
    if (raw > 0) depth = lerp(from, stage.to, amount);
    turns += stageTurns * (stage.ease === "in" ? raw * raw : amount);
    from = stage.to;
  }

  const approach = smoothstep(windowProgress(t, drive.approach));
  const align = smoothstep(windowProgress(t, drive.align));
  const contactStart = drive.stages[0].window[0];
  const hoverHeadY = lerp(surfaceY + hover.lift, surfaceY + gap, approach) + spec.length;
  const headY = t < contactStart ? hoverHeadY : surfaceY - depth + spec.length;

  const washer = spec.washer;
  const epdmThickness = washer
    ? Math.min(Math.max(headY - washer.steelThickness - surfaceY, washer.epdmMinThickness), washer.epdmThickness)
    : 0;

  return {
    x: lerp(hover.x, 0, approach),
    headY,
    tilt: hover.tilt * (1 - align),
    spin: -turns * Math.PI * 2,
    depth: t < contactStart ? -(headY - spec.length - surfaceY) : depth,
    epdmThickness,
  };
}

/** Depth of the tip once the screw is fully seated (the last stage's end). */
export const seatedDepth = (drive: ScrewDrive) => drive.stages[drive.stages.length - 1].to;

/** Head underside y once seated. */
export const seatedHeadY = (drive: ScrewDrive) => drive.surfaceY - seatedDepth(drive) + drive.spec.length;

/** Head top y once seated (the target of the dive-through transition). */
export const seatedHeadTopY = (drive: ScrewDrive) =>
  seatedHeadY(drive) + drive.spec.flangeThickness + drive.spec.headHeight;

/** 0 → 1 as the drill point breaks out of the underside of a layer whose bottom is at `layerBottomDepth`. */
export const breakthrough = (depth: number, layerBottomDepth: number, spec: SdsSpec) =>
  clamp01((depth - layerBottomDepth) / spec.tipLength);
