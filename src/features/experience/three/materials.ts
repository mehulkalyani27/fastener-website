export const STEEL_MATERIAL = {
  color: "#c7cbd1",
  metalness: 1,
  roughness: 0.26,
  clearcoat: 0.35,
  clearcoatRoughness: 0.2,
  envMapIntensity: 1.15,
} as const;

/*
 * Engineering-visualization palette for application scenes on the light section background:
 * context parts stay matte and neutral so the screw is the only polished metal.
 */
export const PAINTED_SHEET_MATERIAL = { color: "#6f7890", metalness: 0.25, roughness: 0.55 } as const;
export const GALVANIZED_STEEL_MATERIAL = { color: "#9aa1ad", metalness: 0.7, roughness: 0.42 } as const;
/** Cut faces of sectioned parts, lighter so the cross-section reads at a glance. */
export const SECTION_FACE_MATERIAL = { color: "#e4e7ee", metalness: 0, roughness: 0.75 } as const;
export const EPDM_MATERIAL = { color: "#17181d", metalness: 0, roughness: 0.85 } as const;
/** Visualization of a silver organic coating finish (e.g. Class 3 / Ruspert look) — not a colour spec. */
export const COATED_SCREW_MATERIAL = { ...STEEL_MATERIAL, color: "#cdd0d6", roughness: 0.3 } as const;
export const ALUMINIUM_MATERIAL = { color: "#b8bec8", metalness: 0.6, roughness: 0.38 } as const;
export const POWDER_COATED_MATERIAL = { color: "#7d8594", metalness: 0.2, roughness: 0.6 } as const;
export const SOLAR_GLASS_MATERIAL = { color: "#1e2a44", metalness: 0.3, roughness: 0.18 } as const;
