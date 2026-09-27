export const STEEL_MATERIAL = {
  color: "#c7cbd1",
  metalness: 1,
  roughness: 0.26,
  clearcoat: 0.35,
  clearcoatRoughness: 0.2,
  envMapIntensity: 1.15,
} as const;

/** Steel with a thin-film layer that shifts hue at glancing angles, like heat-tinted metal. */
export const HEAT_TINTED_STEEL_MATERIAL = {
  ...STEEL_MATERIAL,
  roughness: 0.22,
  iridescence: 0.45,
  iridescenceIOR: 1.6,
  iridescenceThicknessRange: [140, 420] as [number, number],
} as const;
