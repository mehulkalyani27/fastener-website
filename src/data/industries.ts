import type { Industry, IndustryStoryChapter } from "@/types/content";

export const industries: Industry[] = [
  {
    slug: "metal-roofing-cladding",
    name: "Metal Roofing & Cladding",
    description: "Securing trapezoidal profile sheets and sandwich panels to purlins.",
  },
  {
    slug: "pre-engineered-buildings",
    name: "Pre-Engineered Buildings (PEB)",
    description: "Structural steel framing, girt-to-flange connections, and side-lap joints.",
  },
  {
    slug: "hvac-ductwork",
    name: "HVAC & Ductwork",
    description: "Heavy-duty sheet metal duct assembly and bracket mounting.",
  },
  {
    slug: "solar-structural-framing",
    name: "Solar & Structural Framing",
    description: "Mounting solar panel rails to aluminum/steel sub-structures.",
  },
  {
    slug: "industrial-machinery-enclosures",
    name: "Industrial Machinery & Enclosures",
    description: "Fastening heavy gauge steel covers and structural plates.",
  },
];

/**
 * Text for the 3D application story, one chapter per industry. Describes what the visualization
 * shows; product specifications are deliberately not stated here until confirmed.
 */
export const industryStories: IndustryStoryChapter[] = [
  {
    slug: "metal-roofing-cladding",
    application: "Roof sheet fixed to a steel purlin",
    why: "One continuous operation drills the sheet, taps into the purlin and seats the sealing washer on the crest.",
    captions: {
      setup: "Roof sheet on a steel purlin",
      contact: "Screw aligned on the crest",
      drillSheet: "Drilling through the sheet",
      cavity: "Crossing the rib",
      drillPurlin: "Drilling into the purlin",
      tap: "Tapping the thread",
      seat: "Seating the washer",
      fixed: "Fixed — washer on the crest",
    },
  },
  {
    slug: "pre-engineered-buildings",
    application: "Side lap between two cladding sheets",
    why: "Drills both lapped sheets in one pass, then pulls them tight and seals the joint under the washer.",
    captions: {
      setup: "Two sheets lapped on a crest",
      contact: "Screw on the lapped crest",
      drillOuter: "Drilling the outer sheet",
      drillInner: "Drilling the inner sheet",
      tap: "Tapping the thread",
      clamp: "Pulling the lap tight",
      fixed: "Stitched — lap closed and sealed",
    },
  },
  {
    slug: "hvac-ductwork",
    application: "Hanger bracket fixed to a duct wall",
    why: "Drills the bracket and the duct wall in one pass and clamps them together — no pilot hole needed.",
    captions: {
      setup: "Hanger bracket on a duct",
      contact: "Screw on the bracket",
      drillBracket: "Drilling the bracket",
      drillDuct: "Drilling the duct wall",
      tap: "Tapping the thread",
      clamp: "Clamping bracket to duct",
      fixed: "Fixed — bracket clamped",
    },
  },
  {
    slug: "solar-structural-framing",
    application: "Rail foot fixed to a steel purlin",
    why: "Drills the aluminium foot and the steel purlin in one pass, then taps the thread and seats the head.",
    captions: {
      setup: "Rail foot on a steel purlin",
      contact: "Screw on the foot",
      drillFoot: "Drilling the aluminium foot",
      drillPurlin: "Drilling the purlin",
      tap: "Tapping the thread",
      seat: "Seating the head",
      fixed: "Fixed — foot secured",
    },
  },
  {
    slug: "industrial-machinery-enclosures",
    application: "Steel cover plate fixed to a frame",
    why: "The drill point is longer than the steel it cuts, so the hole is finished before the thread engages.",
    captions: {
      setup: "Cover plate on a steel frame",
      drillLength: "Drill point longer than the steel",
      contact: "Screw on the plate",
      drillPlate: "Drilling the plate",
      drillFrame: "Drilling the frame",
      tap: "Tapping the thread",
      seat: "Seating the head",
      fixed: "Fixed — plate secured",
    },
  },
];
