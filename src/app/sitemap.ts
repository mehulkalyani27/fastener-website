import type { MetadataRoute } from "next";
import { sectionRoutes } from "@/data/sections";
import { siteConfig } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: siteConfig.url, lastModified },
    ...sectionRoutes.map(({ slug }) => ({ url: new URL(`/${slug}`, siteConfig.url).toString(), lastModified })),
  ];
}
