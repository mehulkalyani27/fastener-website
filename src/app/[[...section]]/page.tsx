import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isSectionSlug, sectionRoutes } from "@/data/sections";
import { siteConfig } from "@/data/site";
import { HomePage } from "@/features/home/home-page";

// Clean section URLs (/about, /products, …) are the same single page, pre-rendered once per path;
// anything else 404s. SectionSync positions the page at the section on load.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ section: [] }, ...sectionRoutes.map(({ slug }) => ({ section: [slug] }))];
}

function sectionOf(section: string[] | undefined) {
  if (!section?.length) return null;
  const [slug] = section;
  if (section.length > 1 || !isSectionSlug(slug)) notFound();
  return sectionRoutes.find((route) => route.slug === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/[[...section]]">): Promise<Metadata> {
  const route = sectionOf((await params).section);
  if (!route) return {};
  const path = `/${route.slug}`;
  return {
    description: route.description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.title,
      title: siteConfig.title,
      description: route.description,
      url: path,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }],
    },
  };
}

export default async function Page({ params }: PageProps<"/[[...section]]">) {
  sectionOf((await params).section);
  return <HomePage />;
}
