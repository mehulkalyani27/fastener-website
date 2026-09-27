import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { productsContent } from "@/data/home";
import { productCategories } from "@/data/products";

export function ProductsSection() {
  return (
    <Section id="products" aria-labelledby="products-title">
      <Container>
        <SectionHeader
          id="products-title"
          title={productsContent.title}
          description={productsContent.description}
        />
        <ul className="grid-auto-fit mt-10 grid gap-6">
          {productCategories.map((category) => (
            <li key={category.slug} className="flex">
              <Card title={category.name} description={category.description} />
            </li>
          ))}
        </ul>
        <ButtonLink href={productsContent.cta.href} className="mt-10">
          {productsContent.cta.label}
        </ButtonLink>
      </Container>
    </Section>
  );
}
