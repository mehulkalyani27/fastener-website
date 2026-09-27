import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Card } from "@/components/ui/card";
import { CardGrid } from "@/components/ui/card-grid";
import { SectionHeader } from "@/components/ui/section-header";
import { productsContent } from "@/data/home";
import { productCategories } from "@/data/products";
import { SectionLink } from "@/features/navigation/components/section-link";

export function ProductsSection() {
  return (
    <Section id="products" aria-labelledby="products-title">
      <Container>
        <SectionHeader
          id="products-title"
          title={productsContent.title}
          description={productsContent.description}
        />
        <CardGrid columns={4}>
          {productCategories.map((category, index) => (
            <li key={category.slug} className="flex">
              <Card index={index} title={category.name} description={category.description} />
            </li>
          ))}
          <li className="flex">
            <SectionLink
              href={productsContent.cta.href}
              className="surface-ink group flex w-full flex-col justify-between gap-10 rounded-card p-6 shadow-card transition-[background-color,box-shadow] duration-300 ease-standard hover:bg-primary-hover hover:shadow-raised sm:p-7"
            >
              <span aria-hidden="true" className="eyebrow text-ink-accent">
                Enquire
              </span>
              <span className="flex items-end justify-between gap-4 text-lg font-semibold tracking-[-0.01em]">
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
              </span>
            </SectionLink>
          </li>
        </CardGrid>
      </Container>
    </Section>
  );
}
