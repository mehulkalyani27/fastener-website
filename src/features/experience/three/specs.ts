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

/**
 * Hex washer head self-drilling screw, in millimetres, axis along y with the head's underside at
 * y = 0 and the point towards -y.
 */
export type SdsSpec = {
  /** Thread major diameter. */
  diameter: number;
  /** Underside of the head to the tip. */
  length: number;
  /** Thread advance per turn. */
  pitch: number;
  headAcrossFlats: number;
  headHeight: number;
  flangeDiameter: number;
  flangeThickness: number;
  /** Fluted drill section between the thread and the tip cone. */
  drillPointLength: number;
  tipLength: number;
  /** Bonded sealing washer: a steel backing ring over an EPDM ring. */
  washer?: { diameter: number; steelThickness: number; epdmThickness: number; epdmMinThickness: number };
};

/**
 * WORKING VISUALIZATION VALUES for the roofing scene, taken from the storyboard — not confirmed
 * product data. Replace with the product datasheet (DIN 7504 K dimensions, pitch, drill point,
 * washer) before presenting any of these as specifications.
 */
export const ROOFING_SDS_VISUAL: SdsSpec = {
  diameter: 5.5,
  length: 65,
  pitch: 1.8,
  headAcrossFlats: 8,
  headHeight: 5.5,
  flangeDiameter: 11.5,
  flangeThickness: 1.2,
  drillPointLength: 9,
  tipLength: 2.5,
  washer: { diameter: 16, steelThickness: 1, epdmThickness: 2.5, epdmMinThickness: 1.8 },
};

/** Radius of the screw's core (thread root); the helix tube adds the thread depth on top. */
export const sdsCoreRadius = (spec: SdsSpec) => spec.diameter * 0.36;

/** Length of the threaded section, from under the head to the start of the drill point. */
export const sdsThreadedLength = (spec: SdsSpec) => spec.length - spec.drillPointLength - spec.tipLength;

/*
 * WORKING VISUALIZATION VALUES for the other application scenes (storyboard assumptions, not
 * product data). All share the 8 mm hex head so the story can pass from one screw head to the next.
 */
const SDS_HEAD = { headAcrossFlats: 8, headHeight: 5.5, flangeDiameter: 11.5, flangeThickness: 1.2 };
const BONDED_WASHER = { diameter: 16, steelThickness: 1, epdmThickness: 2.5, epdmMinThickness: 1.8 };

/** Side-lap stitching screw with a bonded washer. */
export const STITCH_SDS_VISUAL: SdsSpec = {
  ...SDS_HEAD, diameter: 4.8, length: 25, pitch: 1.6, drillPointLength: 5, tipLength: 2, washer: BONDED_WASHER,
};
/** Short screw for sheet-metal brackets, no washer. */
export const BRACKET_SDS_VISUAL: SdsSpec = {
  ...SDS_HEAD, diameter: 4.8, length: 19, pitch: 1.6, drillPointLength: 5, tipLength: 2,
};
/** Bi-metal screw: stainless body, hardened drill point (two materials in the scene). */
export const BIMETAL_SDS_VISUAL: SdsSpec = {
  ...SDS_HEAD, diameter: 5.5, length: 35, pitch: 1.8, drillPointLength: 8, tipLength: 2.5,
};
/** Long drill point for thick steel. */
export const HEAVY_SDS_VISUAL: SdsSpec = {
  ...SDS_HEAD, diameter: 5.5, length: 45, pitch: 1.8, drillPointLength: 14, tipLength: 2.5,
};
