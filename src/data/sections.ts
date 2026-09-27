/**
 * Page sections reachable by clean URL, in page order. The slug is both the section's element id
 * and its path segment (/about, /products, …). Content not listed here belongs to the URL of the
 * listed section it sits in or follows (the Thread experience lives inside About; Capabilities
 * follows Industries).
 */
export const sectionRoutes = [
  { slug: "about", label: "About" },
  { slug: "products", label: "Products" },
  { slug: "industries", label: "Industries" },
  { slug: "quality", label: "Quality" },
  { slug: "contact", label: "Contact" },
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
