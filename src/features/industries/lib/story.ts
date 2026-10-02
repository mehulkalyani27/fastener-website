/**
 * Scroll-story primitives for application scenes. Everything is a pure function of one scroll
 * progress (0 → 1), so scrolling back replays the exact same states.
 */

export type StoryWindow = readonly [number, number];
export type Vec3 = readonly [number, number, number];

/** Composition tier: sets context detail and camera framing per viewport class. */
export type Tier = "desktop" | "tablet" | "mobile";

export const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
export const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
export const smoothstep = (value: number) => value * value * (3 - 2 * value);
const smootherstep = (value: number) => value * value * value * (value * (value * 6 - 15) + 10);

/** 0 before the window, 1 after it, linear inside. */
export const windowProgress = (t: number, [start, end]: StoryWindow) => clamp01((t - start) / (end - start));

/** Opacity for an element that fades in over `enter` (and out over `exit`, if given). */
export function fade(t: number, enter: StoryWindow, exit?: StoryWindow) {
  const shown = smoothstep(windowProgress(t, enter));
  return exit ? Math.min(shown, 1 - smoothstep(windowProgress(t, exit))) : shown;
}

/**
 * A camera stop: what it looks at, and where it sits around that point (azimuth in degrees around
 * the scene's vertical, 0 = straight in front of the cut face, + = to the right; elevation in
 * degrees above horizontal). `distance` is in mm, or the [width, height] in mm to fit in the frame,
 * so the same shot holds on any canvas shape.
 */
export type CameraKeyframe = {
  at: number;
  target: Vec3;
  distance: number | readonly [number, number];
  azimuth: number;
  elevation: number;
};

/** Vertical field of view (degrees) and aspect ratio of the canvas. */
export type CameraView = { fov: number; aspect: number };

function distanceFor(distance: CameraKeyframe["distance"], { fov, aspect }: CameraView) {
  if (typeof distance === "number") return distance;
  const [width, height] = distance;
  return Math.max(height, width / aspect) / (2 * Math.tan((fov * Math.PI) / 360));
}

/**
 * Camera pose at a progress: eases (smootherstep) between the surrounding keyframes, blending
 * target, distance and angles separately so moves stay controlled — no overshoot, no orbit spin.
 */
export function cameraAt(keyframes: readonly CameraKeyframe[], t: number, view: CameraView) {
  let index = keyframes.findIndex((keyframe) => keyframe.at > t);
  if (index === -1) index = keyframes.length - 1;
  const to = keyframes[index];
  const from = keyframes[Math.max(index - 1, 0)];
  const amount = to === from ? 1 : smootherstep(windowProgress(t, [from.at, to.at]));

  const target: Vec3 = [
    lerp(from.target[0], to.target[0], amount),
    lerp(from.target[1], to.target[1], amount),
    lerp(from.target[2], to.target[2], amount),
  ];
  const distance = lerp(distanceFor(from.distance, view), distanceFor(to.distance, view), amount);
  const azimuth = (lerp(from.azimuth, to.azimuth, amount) * Math.PI) / 180;
  const elevation = (lerp(from.elevation, to.elevation, amount) * Math.PI) / 180;
  const position: Vec3 = [
    target[0] + distance * Math.cos(elevation) * Math.sin(azimuth),
    target[1] + distance * Math.sin(elevation),
    target[2] + distance * Math.cos(elevation) * Math.cos(azimuth),
  ];
  return { position, target };
}

/** Splits the story progress into equal chapters: which one is showing, and progress within it. */
export function chapterAt(progress: number, count: number) {
  const scaled = clamp01(progress) * count;
  const index = Math.min(Math.floor(scaled), count - 1);
  return { index, t: scaled - index };
}

/** Progress within one chapter (0 before it, 1 after it). */
export const chapterProgress = (progress: number, index: number, count: number) =>
  clamp01(clamp01(progress) * count - index);
