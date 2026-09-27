import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ButtonLink } from "@/components/ui/button-link";
import { ctaContent } from "@/data/home";

export function CtaSection() {
  return (
    <Section aria-labelledby="cta-title" className="bg-primary text-primary-foreground">
      <Container className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 id="cta-title" className="text-heading font-semibold">
            {ctaContent.title}
          </h2>
          <p className="mt-4 text-lg opacity-90">{ctaContent.description}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <ButtonLink href={ctaContent.primaryCta.href} variant="secondary">
            {ctaContent.primaryCta.label}
          </ButtonLink>
          <ButtonLink
            href={ctaContent.secondaryCta.href}
            className="border border-primary-foreground"
          >
            {ctaContent.secondaryCta.label}
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
