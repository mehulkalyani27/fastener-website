/**
 * Fastener dimensions in model units. Kept free of three.js so layout code (e.g. the Thread
 * section's composition maths) can use them without pulling 3D code into the main bundle.
 */
export type BoltSpec = {
  headRadius: number;
  headHeight: number;
  bevel: number;
  shankRadius: number;
  /** Underside of the head to the start of the tip. */
  length: number;
  threadLength: number;
  pitch: number;
};

export const BOLT: BoltSpec = {
  headRadius: 0.62,
  headHeight: 0.42,
  bevel: 0.05,
  shankRadius: 0.34,
  length: 2.6,
  threadLength: 1.7,
  pitch: 0.11,
};

/** Slender bolt for the Thread section (same head, thread and pitch; longer shank). */
export const LONG_BOLT: BoltSpec = { ...BOLT, length: 9, threadLength: 6.8 };

export const TIP_HEIGHT = 0.08;

export const headTop = (spec: BoltSpec) => spec.headHeight + spec.bevel * 2;

/** Offset along y that centers a bolt (head top to tip) on the origin. */
export const boltCenterOffset = (spec: BoltSpec) => -(headTop(spec) - spec.length - TIP_HEIGHT) / 2;

/** Hex nut matching BOLT's head; the hole leaves the thread crests buried in the nut. */
export const NUT = {
  bodyHeight: 0.3,
  holeRadius: BOLT.shankRadius * 0.9,
  /** Half the width across corners, bevel included. */
  halfWidth: BOLT.headRadius + BOLT.bevel,
  height: 0.3 + BOLT.bevel * 2,
};
