import type { ContentItem, NavItem } from "@/types/content";

export const heroContent = {
  eyebrow: "Fastener Manufacturing & Supply",
  title: "Reliable fasteners for industrial and commercial applications",
  description:
    "[Company Name] supplies a range of standard and custom fasteners to support manufacturing, construction and maintenance requirements.",
  primaryCta: { label: "Request a Quote", href: "/#contact" },
  secondaryCta: { label: "View Products", href: "/#products" },
  visualLabel: "[Hero Image / Product Visual]",
} satisfies Record<string, string | NavItem>;

export const aboutContent = {
  title: "About [Company Name]",
  introduction: [
    "[Company Name] is a fastener [manufacturer / supplier / distributor] serving customers across a range of industries. [Add a short company introduction here.]",
    "[Describe the company's experience, expertise and approach to working with customers.]",
  ],
  facts: [
    { title: "Experience", description: "[Years of Experience]" },
    { title: "Headquarters", description: "[Company Location]" },
    { title: "Business Type", description: "[Manufacturer / Supplier / Distributor]" },
  ] satisfies ContentItem[],
  capabilities: [
    "Standard and custom fastener supply",
    "Support for a range of materials and finishes",
    "Assistance with technical and sourcing requirements",
    "[Additional Capability]",
  ],
};

export const productsContent = {
  title: "Products",
  description:
    "An overview of fastener categories. [Replace or extend these categories to reflect the actual product range.]",
  cta: { label: "Enquire About Products", href: "/#contact" },
};

export const industriesContent = {
  title: "Industries & Applications",
  description:
    "Fasteners are used across many sectors. [Update this list with the industries the company serves.]",
};

export const capabilitiesContent = {
  title: "Capabilities & Services",
  description: "Support across the supply process, from sourcing to delivery.",
  items: [
    {
      title: "Manufacturing & Sourcing",
      description: "[Describe manufacturing processes and/or sourcing capabilities.]",
    },
    {
      title: "Custom Requirements",
      description:
        "Fasteners produced or sourced to customer drawings and specifications. [Add details.]",
    },
    {
      title: "Finishing & Coating",
      description: "[List available finishes, such as plating or coating options.]",
    },
    {
      title: "Packaging & Logistics",
      description: "[Describe packaging options, delivery methods and service regions.]",
    },
    {
      title: "Technical Support",
      description: "[Describe support offered for product selection and application needs.]",
    },
    {
      title: "Inventory & Supply Programs",
      description: "[Describe stocking, scheduled delivery or supply arrangements, if offered.]",
    },
  ] satisfies ContentItem[],
};

export const qualityContent = {
  title: "Quality & Standards",
  commitment:
    "[Describe the company's quality commitment and how quality is managed across production and supply.]",
  processes: [
    {
      title: "Material Verification",
      description: "[Describe how incoming materials are checked.]",
    },
    {
      title: "Inspection & Testing",
      description: "[Describe inspection and testing carried out on products.]",
    },
    {
      title: "Standards",
      description: "[List applicable material and product standards, e.g. [Standard].]",
    },
    {
      title: "Documentation & Traceability",
      description: "[Describe available documentation, such as test reports or certificates.]",
    },
  ] satisfies ContentItem[],
  certificationsTitle: "Certifications",
  certifications: ["[Certification]", "[Certification]", "[Certification]"],
};

export const whyChooseUsContent = {
  title: "Why Choose [Company Name]",
  items: [
    { title: "Quality", description: "[Describe the company's approach to quality.]" },
    { title: "Reliability", description: "[Describe consistency of supply and service.]" },
    { title: "Product Range", description: "[Describe the breadth of the product range.]" },
    { title: "Customization", description: "[Describe support for custom requirements.]" },
    { title: "Delivery", description: "[Describe delivery capabilities and lead times.]" },
    { title: "Customer Support", description: "[Describe how customers are supported.]" },
  ] satisfies ContentItem[],
};

export const ctaContent = {
  title: "Discuss your fastener requirements",
  description:
    "Share your requirements, drawings or quantities and our team will get back to you.",
  primaryCta: { label: "Request a Quote", href: "/#contact" },
  secondaryCta: { label: "Send an Inquiry", href: "/#contact" },
};

export const contactContent = {
  title: "Contact Us",
  description: "Get in touch to discuss products, pricing or custom requirements.",
  inquiryLabel: "Email Your Inquiry",
};
