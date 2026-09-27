import type { NavItem, SocialLink } from "@/types/content";

export const siteConfig = {
  name: "[Company Name]",
  tagline: "[Company Tagline]",
  description:
    "[Company Name] supplies fasteners for industrial, construction and manufacturing applications.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
} as const;

export const contactInfo = {
  address: ["[Company Address Line 1]", "[City, State, Postal Code]", "[Country]"],
  email: "[Contact Email]",
  phone: "[Phone Number]",
  hours: "[Business Hours]",
} as const;

export const mainNavigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Products", href: "/#products" },
  { label: "Industries", href: "/#industries" },
  { label: "Quality", href: "/#quality" },
  { label: "Contact", href: "/#contact" },
];

export const primaryCta: NavItem = {
  label: "Request a Quote",
  href: "/#contact",
};

export const socialLinks: SocialLink[] = [
  { label: "[LinkedIn]" },
  { label: "[Facebook]" },
  { label: "[Instagram]" },
  { label: "[YouTube]" },
];
