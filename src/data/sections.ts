/**
 * Page sections reachable by clean URL, in page order. The slug is both the section's element id
 * and its path segment (/about, /products, …). Content not listed here belongs to the URL of the
 * listed section it sits in or follows (the Thread experience lives inside About; Capabilities
 * follows Industries).
 */
export const sectionRoutes = [
  {
    slug: "about",
    label: "About",
    description: "Metacore Fasteners, a manufacturer of ST 5.5 Hex Head Self-Drilling Screws in Vapi, Gujarat.",
  },
  {
    slug: "products",
    label: "Products",
    description: "ST 5.5 (#12) Hex Head Self-Drilling Screws in 19 mm to 65 mm lengths, with EPDM washers and a choice of coatings.",
  },
  {
    slug: "industries",
    label: "Industries",
    description: "Self-drilling screws for roofing, pre-engineered buildings, HVAC, solar framing and industrial machinery.",
  },
  {
    slug: "quality",
    label: "Quality",
    description: "The materials, hardness and coatings behind Metacore Fasteners' self-drilling screws.",
  },
  {
    slug: "contact",
    label: "Contact",
    description: "Request a quote or sample pack, or call or WhatsApp Metacore Fasteners in Vapi, Gujarat.",
  },
] as const;

export type SectionSlug = (typeof sectionRoutes)[number]["slug"];
/** "home" is the top of the page (the hero), served at "/". */
export type SectionTarget = SectionSlug | "home";

export const sectionPath = (target: SectionTarget) => (target === "home" ? "/" : `/${target}`);

export function isSectionSlug(value: string): value is SectionSlug {
  return sectionRoutes.some((route) => route.slug === value);
}

/** The section a path addresses, or null if the path is not a section URL. */
export function sectionFromPath(pathname: string): SectionTarget | null {
  const segment = pathname.replace(/\/+$/, "").slice(1);
  if (segment === "") return "home";
  return isSectionSlug(segment) ? segment : null;
}
