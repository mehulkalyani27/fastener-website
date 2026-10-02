import type { ProductCategory } from "@/types/content";

export const stockedLengths = [19, 25, 35, 45, 50, 65] as const;

export const screwDiameters = ["ST 4.2 / #8", "ST 4.8 / #10", "ST 5.5 / #12", "ST 6.3 / #14"] as const;

const first = stockedLengths[0];
const last = stockedLengths[stockedLengths.length - 1];
const lengthsList = `${stockedLengths.slice(0, -1).join(", ")} and ${last} mm`;

export const productCategories: ProductCategory[] = [
  {
    slug: "size-range",
    name: "Size Range",
    description: `Lengths from ${first} mm to ${last} mm. Diameters: ${screwDiameters.join(", ")}.`,
  },
  {
    slug: "stocked-lengths",
    name: "Stocked Lengths",
    description: `Ready inventory in ${lengthsList} for fast dispatch.`,
  },
  {
    slug: "head-type",
    name: "Head Type",
    description: "Hex Flange / Hex Washer Head with optional EPDM sealing washers.",
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
