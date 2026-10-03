import type { ProductCategory } from "@/types/content";

export const stockedLengths = [19, 25, 35, 45, 50, 65] as const;

const lengthsList = `${stockedLengths.slice(0, -1).join(" mm, ")} mm, and ${stockedLengths[stockedLengths.length - 1]} mm`;

export const productCategories: ProductCategory[] = [
  {
    slug: "size-range",
    name: "Size Range",
    description: `Diameter: ST 5.5 (#12 gauge) exclusively. Stocked Lengths: ${lengthsList}.`,
  },
  {
    slug: "stocked-lengths",
    name: "Stocked Lengths",
    description: "Ready inventory across every stocked length for fast dispatch.",
  },
  {
    slug: "head-type",
    name: "Head Type",
    description: "Hex Washer Head, 8 mm (5/16\") across flats (A.F.), 14 TPI, with integrated 16 mm / 19 mm EPDM bonded washers.",
  },
  {
    slug: "materials",
    name: "Materials & Hardness",
    description:
      "Case-hardened Carbon Steel C1022, Stainless Steel AISI 410, Bi-Metal (304/316 SS body with hardened steel tip).",
  },
  {
    slug: "finishes",
    name: "Finishes & Coatings",
    description: "Yellow/Clear Zinc Plated, Ruspert / Silver Slide Coating, Class 3 / Class 4 Armor Coatings.",
  },
];

export const productSpecifications: ProductCategory[] = [
  {
    slug: "drill-points",
    name: "Drill Point Capacity",
    description:
      "ST 5.5 with a #3 point for standard purlin and roofing steel up to 4.5 mm; #4 and #5 points for heavy-duty steel up to 12.5 mm.",
  },
  {
    slug: "installation",
    name: "Installation Guidance",
    description:
      "Drive at 1,500–2,200 RPM and stay within the maximum recommended seating torque to avoid damaging the EPDM washer.",
  },
  {
    slug: "packaging",
    name: "Packaging",
    description: "19 mm – 25 mm: 1,000 pcs per box. 35 mm – 50 mm: 500 pcs per box. 65 mm: 250–300 pcs per box.",
  },
];
