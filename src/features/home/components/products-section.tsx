import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Card } from "@/components/ui/card";
import { CardGrid } from "@/components/ui/card-grid";
import { SectionHeader } from "@/components/ui/section-header";
import { productsContent } from "@/data/home";
import { productCategories, productSpecifications } from "@/data/products";
import { SampleRequestLink } from "@/features/contact/components/sample-request-link";

export function ProductsSection() {
  return (
    <Section id="products" aria-labelledby="products-title">
      <Container>
        <SectionHeader
          id="products-title"
          title={productsContent.title}
          description={productsContent.description}
        />
        <CardGrid>
          {[...productCategories, ...productSpecifications].map((category, index) => (
            <li key={category.slug} className="flex">
              <Card index={index} title={category.name} description={category.description} />
            </li>
          ))}
          <li className="flex">
            <div data-contact-context="sample-pack" className="surface-ink flex w-full flex-col justify-between gap-10 rounded-card p-6 shadow-card sm:p-7">
              <span aria-hidden="true" className="eyebrow text-ink-accent">
                Sample Pack
              </span>
              <div className="flex flex-col gap-4">
                <SampleRequestLink
                  href={productsContent.cta.href}
                  className="group flex items-end justify-between gap-4 text-lg font-semibold tracking-[-0.01em]"
                >
                  {productsContent.cta.label}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="size-5 shrink-0 transition-transform duration-300 ease-standard group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M2 8h12M9 3l5 5-5 5" />
                  </svg>
                </SampleRequestLink>
                {productsContent.datasheet && (
                  <a
                    href={productsContent.datasheet.href}
                    download
                    className="text-sm text-ink-muted underline underline-offset-4 transition-colors hover:text-ink-foreground"
                  >
                    {productsContent.datasheet.label}
                  </a>
                )}
              </div>
            </div>
          </li>
        </CardGrid>
      </Container>
    </Section>
  );
}
