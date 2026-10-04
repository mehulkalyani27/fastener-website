/** The Metacore mark in a 200 × 208 box (public/metacore-horizontal-navy.svg), as M/L/H/V/Z paths. */
export const LOGO_MARK_SIZE = { width: 200, height: 208 } as const;

export const LOGO_MARK_PATHS = [
  "M0,0 L82.2,61.8 L60,78.6 L30,56 V208 H0 Z",
  "M191.4,0 H200 V31.4 L91,112.1 V208 H61 V96.6 Z",
  "M200,62 L170,84.2 V208 H200 Z",
  "M142,105 V142 L61,202 V165.3 Z",
] as const;
