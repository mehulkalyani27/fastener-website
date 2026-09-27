import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/data/site";
import { ExperienceLayer } from "@/features/experience/components/experience-layer";
import { SkipLink } from "@/features/navigation/components/skip-link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#1f2440",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={siteConfig.locale} className={inter.variable}>
      <body>
        <SkipLink
          targetId="main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-control focus:bg-background focus:px-4 focus:py-2 focus:shadow-raised"
        />
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter />
        <ExperienceLayer />
      </body>
    </html>
  );
}
