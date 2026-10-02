import { sectionPath, sectionRoutes } from "@/data/sections";
import type { NavItem, SocialLink } from "@/types/content";

export const siteConfig = {
  name: "Metacore Fasteners",
  tagline: "Premium Hex Head Self-Drilling Screws for Fast & Secure Metal Fastening",
  description:
    "Metacore Fasteners manufactures Hex Head Self-Drilling Screws (SDS) in lengths from 19 mm to 65 mm for roofing, pre-engineered buildings and industrial fastening.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
} as const;

export const contactInfo = {
  address: ["Plot No. 123, GIDC Industrial Estate, Phase II", "Vapi, Gujarat 396195", "India"],
  email: "info@sds-metacore.com",
  phone: "+91 9824341915",
  hours: ["Monday – Saturday: 8:30 AM – 6:30 PM (IST)", "Sunday: Closed"],
} as const;

export const mainNavigation: NavItem[] = [
  { label: "Home", href: sectionPath("home") },
  ...sectionRoutes.map(({ slug, label }) => ({ label, href: sectionPath(slug) })),
];

export const primaryCta: NavItem = {
  label: "Request a Quote",
  href: sectionPath("contact"),
};

export const socialLinks: SocialLink[] = [
  { label: "LinkedIn", href: "https://linkedin.com/company/metacore-fasteners" },
  { label: "Facebook", href: "https://facebook.com/metacorefasteners" },
  { label: "Instagram", href: "https://instagram.com/metacorefasteners" },
];
