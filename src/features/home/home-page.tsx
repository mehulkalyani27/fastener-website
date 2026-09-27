import { AboutSection } from "@/features/home/components/about-section";
import { CapabilitiesSection } from "@/features/home/components/capabilities-section";
import { ContactSection } from "@/features/home/components/contact-section";
import { CtaSection } from "@/features/home/components/cta-section";
import { HeroSection } from "@/features/home/components/hero-section";
import { IndustriesSection } from "@/features/home/components/industries-section";
import { ProductsSection } from "@/features/home/components/products-section";
import { QualitySection } from "@/features/home/components/quality-section";
import { WhyChooseUsSection } from "@/features/home/components/why-choose-us-section";
import { SectionSync } from "@/features/navigation/components/section-sync";

/** The single-page home, served at "/" and at every section URL (/about, /products, …). */
export function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProductsSection />
      <IndustriesSection />
      <CapabilitiesSection />
      <QualitySection />
      <WhyChooseUsSection />
      <CtaSection />
      <ContactSection />
      <SectionSync />
    </>
  );
}
