import type { Industry } from "@/types/content";

export const industries: Industry[] = [
  {
    slug: "construction",
    name: "Construction & Infrastructure",
    description:
      "Fastening solutions for buildings, structures and civil infrastructure projects.",
    applications: ["Structural steel connections", "Concrete anchoring", "Facade systems"],
  },
  {
    slug: "automotive",
    name: "Automotive",
    description: "Fasteners for vehicle assemblies, components and aftermarket parts.",
    applications: ["Chassis assemblies", "Engine components", "Interior fittings"],
  },
  {
    slug: "industrial-machinery",
    name: "Industrial Machinery",
    description: "Components for equipment manufacturing, maintenance and repair.",
    applications: ["Equipment assembly", "Machine frames", "Maintenance and repair"],
  },
  {
    slug: "electrical",
    name: "Electrical & Electronics",
    description: "Fastening for enclosures, panels and electrical installations.",
    applications: ["Control panels", "Enclosures", "Cable management"],
  },
  {
    slug: "energy",
    name: "Energy",
    description: "Fasteners used across power generation and distribution installations.",
    applications: ["Mounting structures", "Transmission hardware", "Plant equipment"],
  },
  {
    slug: "furniture",
    name: "Furniture & Fixtures",
    description: "Fastening for furniture, fittings and interior installations.",
    applications: ["Furniture assembly", "Shop fittings", "Interior fixtures"],
  },
];
