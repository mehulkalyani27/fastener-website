import type { ProductCategory } from "@/types/content";

export const productCategories: ProductCategory[] = [
  {
    slug: "bolts",
    name: "Bolts",
    description:
      "Externally threaded fasteners used with nuts to join components in structural and mechanical assemblies.",
  },
  {
    slug: "nuts",
    name: "Nuts",
    description:
      "Internally threaded fasteners that pair with bolts and studs to secure assemblies.",
  },
  {
    slug: "screws",
    name: "Screws",
    description:
      "Threaded fasteners for fixing into tapped holes or directly into materials such as wood, metal and plastic.",
  },
  {
    slug: "washers",
    name: "Washers",
    description:
      "Components that distribute load, protect surfaces and help maintain joint integrity.",
  },
  {
    slug: "threaded-rods",
    name: "Threaded Rods",
    description:
      "Continuously threaded rods for anchoring, suspension and extended fastening applications.",
  },
  {
    slug: "anchors",
    name: "Anchors",
    description:
      "Fasteners designed to secure fixtures into concrete, masonry and other base materials.",
  },
  {
    slug: "custom-fasteners",
    name: "Custom Fasteners",
    description:
      "Fasteners made to customer drawings, specifications or application requirements.",
  },
];
