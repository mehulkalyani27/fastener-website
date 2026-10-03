import { siteConfig } from "@/data/site";
import type { ContentItem, ThreadPanel } from "@/types/content";

export const heroContent = {
  eyebrow: "Hex Head Self-Drilling Screw Specialist",
  title: "High-Performance Hex SDS Screws (19 mm to 65 mm)",
  description:
    `${siteConfig.name} manufactures high-tensile Hex Washer Head Self-Drilling Screws engineered for fast, reliable steel-to-steel and roofing installations.`,
} satisfies Record<string, string>;

export const threadedContent: { title: string; panels: ThreadPanel[] } = {
  title: "Engineered to drill, tap, and seal in a single operation.",
  panels: [
    { label: "Thread", word: "Precision", line: "It starts with a single thread.", side: "right", row: "top" },
    { label: "Hold", word: "Connection", line: "Everything worth building is held together.", side: "left", row: "bottom" },
    { label: "Load", word: "Strength", line: "Small parts. Serious loads.", side: "right", row: "bottom" },
  ],
};

export const aboutContent = {
  title: `About ${siteConfig.name}`,
  introduction: [
    `${siteConfig.name} specializes in the manufacturing and supply of high-performance Hex Washer Head Self-Drilling Screws (SDS). Designed for high-speed installation without pre-drilling, our fasteners deliver exceptional drillability, pull-out strength, and corrosion resistance.`,
    "Focused exclusively on precision Hex Head SDS, we collaborate with roofing contractors, pre-engineered building (PEB) fabricators, and industrial manufacturers to deliver defect-free fasteners engineered to DIN 7504 K standards.",
  ],
  facts: [
    { title: "Specialization", description: "Hex Head SDS" },
    { title: "Headquarters", description: "Vapi, Gujarat, India" },
    { title: "Business Type", description: "Specialized Manufacturer & Supplier" },
  ] satisfies ContentItem[],
  capabilities: [
    "High-speed cold-forging and thread-rolling for consistent drill point alignment",
    "Standard lengths strictly stocked in 19 mm, 25 mm, 35 mm, 45 mm, 50 mm, and 65 mm",
    "Multi-layer corrosion protection including Class 3, Zinc Electroplating, and Ruspert coatings",
    "Integrated bonded EPDM washer assemblies for leak-proof roofing applications",
    "Large-scale batch production with flexible minimum order quantities (MOQs)",
  ],
};

export const productsContent = {
  title: "Products",
  description:
    "Hex Head Self-Drilling Screws (SDS) in lengths from 19 mm to 65 mm, engineered for fast installation without pre-drilling.",
  cta: { label: "Enquire About Products", href: "/contact" },
};

export const industriesContent = {
  title: "Industries & Applications",
  description:
    "Where Metacore Hex Head SDS are used: roofing, steel buildings, HVAC, solar and industrial manufacturing.",
};

export const capabilitiesContent = {
  title: "Capabilities & Services",
  description: "Support across the supply process, from sourcing to delivery.",
  items: [
    {
      title: "Manufacturing & Sourcing",
      description:
        "Dedicated cold-heading, point-forming, and thread-rolling machinery for Hex SDS production.",
    },
    {
      title: "Custom Variations",
      description:
        "Options for customized drill flute lengths (Drill Point #3, #4, #5) depending on steel thickness (up to 12.5mm).",
    },
    {
      title: "Finishes & Coatings",
      description:
        "Electro-zinc coating, organic Ruspert finish (1000–1500 hrs salt spray test), and Class 3 weather barrier coatings.",
    },
    {
      title: "Packaging & Delivery",
      description:
        "Standard box packs (500 / 1000 pcs), bulk carton packs, and custom labeling for distributors.",
    },
    {
      title: "Technical Support",
      description:
        "Guidance on drill speeds (RPM), driving torque limits, and thickness capacities to prevent flute clogging or head breakage.",
    },
    {
      title: "Stocking Arrangements",
      description: "Ready inventory across all standard lengths (19 mm – 65 mm) for fast dispatches.",
    },
  ] satisfies ContentItem[],
};

export const qualityContent = {
  title: "Quality & Standards",
  commitment:
    "Zero-defect policy focused on drill-point sharpness, thread engagement, and head stability.",
  processes: [
    {
      title: "Material Verification",
      description:
        "Wire rod chemical analysis and grain structure testing for proper heat-treatment response.",
    },
    {
      title: "Inspection & Testing",
      description:
        "Drilling speed tests (penetration time under specified RPM/load), hardness gradient checks (core vs. case hardness), torque-to-yield testing, and salt-spray corrosion chamber testing.",
    },
    {
      title: "Standards",
      description: "DIN 7504 K, ISO 15480, ASTM C1513, BS standards.",
    },
    {
      title: "Documentation",
      description:
        "EN 10204 3.1 Test Certificates, Salt Spray Test Reports, Dimensional Inspection Certificates.",
    },
  ] satisfies ContentItem[],
  /** The one certificate we hold, split from "ISO 9001:2015 Quality Management System". */
  certification: {
    label: "Certification",
    standard: "ISO 9001:2015",
    name: "Quality Management System",
    note: "The internationally recognised standard for quality management systems, built on consistent, documented processes.",
  },
};

export const whyChooseUsContent = {
  title: `Why Choose ${siteConfig.name}`,
  items: [
    {
      title: "Quality",
      description: "Fully hardened points engineered to drill and tap without pilot holes or dulling.",
    },
    {
      title: "Reliability",
      description:
        "Weather-resistant EPDM washers and high salt-spray coatings eliminate leaks and rust failures.",
    },
    {
      title: "Focused Range",
      description:
        "Standardized 19 mm to 65 mm range engineered specifically for light to heavy steel applications.",
    },
    {
      title: "Customisation",
      description: "Available in varied drill points (#3 to #5), special lengths, and protective finishes.",
    },
    {
      title: "Delivery & Lead Times",
      description: "High stock availability for standard sizes guarantees swift order turnaround.",
    },
    {
      title: "Customer Support",
      description: "On-site drilling trials, torque recommendations, and technical support.",
    },
  ] satisfies ContentItem[],
};

export const ctaContent = {
  title: "Request a bulk quote or sample pack for your 19 mm – 65 mm Hex SDS requirements today.",
};

export const contactContent = {
  title: "Get in Touch",
  description:
    "Tell us the screw size, coating and quantity you need, or ask for a sample pack, and our team will get back to you.",
  submitLabel: "Send Inquiry",
};
