/**
 * Self-drilling screw dimensions. Kept free of three.js so layout code (e.g. the Thread section's
 * composition maths) can use them without pulling 3D code into the main bundle.
 */

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
  /**
   * Shape of the drill flutes (default: a shallow, single-turn drill). `depth` is the radius at
   * the flute floor as a share of the full radius (smaller = deeper flutes), `turns` the twist over
   * the drill section, `radius` the drill's radius as a share of the thread's core radius.
   */
  drillFlutes?: { depth: number; turns: number; radius: number };
  /** Bonded sealing washer: a steel backing ring over an EPDM ring. */
  washer?: { diameter: number; steelThickness: number; epdmThickness: number; epdmMinThickness: number };
};

/**
 * The roofing screw. Confirmed product data: ST 5.5 diameter, 65 mm length, 8 mm across flats,
 * 14 TPI (1.814 mm pitch) and a 16 mm bonded washer. Flange diameter, head height and drill-point
 * dimensions are still WORKING VISUALIZATION VALUES.
 */
export const ROOFING_SDS_VISUAL: SdsSpec = {
  diameter: 5.5,
  length: 65,
  pitch: 1.814,
  headAcrossFlats: 8,
  headHeight: 5.5,
  flangeDiameter: 11.5,
  flangeThickness: 1.2,
  drillPointLength: 9,
  tipLength: 2.5,
  washer: { diameter: 16, steelThickness: 1, epdmThickness: 2.5, epdmMinThickness: 1.8 },
};

/**
 * The screw shown wherever the site presents a fastener on its own (hero, Thread): the roofing
 * screw made 30% shorter (65 → 45.5 mm), with a black EPDM sealing washer directly under the flange
 * (no steel backing ring) and a long, deeply fluted Tek-style drill point. WORKING VISUALIZATION
 * VALUES, like the others.
 */
export const SHOWCASE_SDS_VISUAL: SdsSpec = {
  ...ROOFING_SDS_VISUAL,
  length: 45.5,
  drillPointLength: 14,
  tipLength: 3,
  washer: { diameter: 16, steelThickness: 0, epdmThickness: 2.5, epdmMinThickness: 1.8 },
  drillFlutes: { depth: 0.3, turns: 1.6, radius: 1.12 },
};

/** Height of the head's top above the underside of the flange. */
export const sdsHeadTopHeight = (spec: SdsSpec) => spec.flangeThickness + spec.headHeight;

/** Radius of the hex head's corners (the head is a regular hexagon, `headAcrossFlats` wide). */
export const sdsHexRadius = (spec: SdsSpec) => spec.headAcrossFlats / Math.sqrt(3);

/** Radius of the screw's core (thread root); the helix tube adds the thread depth on top. */
export const sdsCoreRadius = (spec: SdsSpec) => spec.diameter * 0.36;

/** Length of the threaded section, from under the head to the start of the drill point. */
export const sdsThreadedLength = (spec: SdsSpec) => spec.length - spec.drillPointLength - spec.tipLength;

/*
 * The other application scenes: every one is ST 5.5 at 14 TPI with the 8 mm hex head, so the story
 * can pass from one screw head to the next. Lengths and drill-point dimensions are WORKING
 * VISUALIZATION VALUES.
 */
const SDS_HEAD = { headAcrossFlats: 8, headHeight: 5.5, flangeDiameter: 11.5, flangeThickness: 1.2 };
const BONDED_WASHER = { diameter: 16, steelThickness: 1, epdmThickness: 2.5, epdmMinThickness: 1.8 };

/** Side-lap stitching screw with a bonded washer. */
export const STITCH_SDS_VISUAL: SdsSpec = {
  ...SDS_HEAD, diameter: 5.5, length: 25, pitch: 1.814, drillPointLength: 5, tipLength: 2, washer: BONDED_WASHER,
};
/** Short screw for sheet-metal brackets, no washer. */
export const BRACKET_SDS_VISUAL: SdsSpec = {
  ...SDS_HEAD, diameter: 5.5, length: 19, pitch: 1.814, drillPointLength: 5, tipLength: 2,
};
/** Bi-metal screw: stainless body, hardened drill point (two materials in the scene). */
export const BIMETAL_SDS_VISUAL: SdsSpec = {
  ...SDS_HEAD, diameter: 5.5, length: 35, pitch: 1.814, drillPointLength: 8, tipLength: 2.5,
};
/** Long drill point for thick steel. */
export const HEAVY_SDS_VISUAL: SdsSpec = {
  ...SDS_HEAD, diameter: 5.5, length: 45, pitch: 1.814, drillPointLength: 14, tipLength: 2.5,
};
