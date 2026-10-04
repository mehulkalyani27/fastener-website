import { sectionPath, sectionRoutes } from "@/data/sections";
import type { NavItem, SocialLink } from "@/types/content";

export const siteConfig = {
  name: "Metacore Fasteners",
  tagline: "Premium Hex Head Self-Drilling Screws for Fast & Secure Metal Fastening",
  description:
    "Metacore Fasteners manufactures ST 5.5 (#12) Hex Head Self-Drilling Screws (SDS) in lengths from 19 mm to 65 mm for roofing, pre-engineered buildings and industrial fastening.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
} as const;

export const contactInfo = {
  address: ["Plot No. 12, Ground Floor, Radha Madhav Estate,", "Degam, Vapi, Gujarat – 396191"],
  email: "metacorefasteners@gmail.com",
  phone: "+91 9824341915",
  hours: ["Monday – Saturday: 8:30 AM – 6:30 PM (IST)", "Sunday: Closed"],
} as const;

const phoneDigits = contactInfo.phone.replace(/\D/g, "");

export const whatsappLink = (message: string) => `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;

export const phoneLinks = {
  call: `tel:+${phoneDigits}`,
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
  { label: "LinkedIn", href: "https://www.linkedin.com/company/metacore-fasteners/" },
];
