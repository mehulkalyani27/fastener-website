import type { IndustrySceneConfig } from "@/features/industries/lib/scene";
import { HVAC_SCENE } from "@/features/industries/scenes/hvac";
import { MACHINERY_SCENE } from "@/features/industries/scenes/machinery";
import { PEB_SCENE } from "@/features/industries/scenes/peb";
import { ROOFING_SCENE } from "@/features/industries/scenes/roofing";
import { SOLAR_SCENE } from "@/features/industries/scenes/solar";

/** Chapters of the Industries story, in order. The last one ends the story instead of diving on. */
export const INDUSTRY_SCENES: readonly IndustrySceneConfig[] = [
  ROOFING_SCENE,
  PEB_SCENE,
  HVAC_SCENE,
  SOLAR_SCENE,
  MACHINERY_SCENE,
];

export const CHAPTER_COUNT = INDUSTRY_SCENES.length;
