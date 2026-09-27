import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ButtonLink } from "@/components/ui/button-link";
import { heroContent } from "@/data/home";

export function HeroSection() {
  return (
    <Section aria-labelledby="hero-title">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {heroContent.eyebrow}
          </p>
          <h1 id="hero-title" className="mt-4 text-display font-bold">
            {heroContent.title}
          </h1>
          <p className="mt-6 max-w-prose text-lg text-muted">{heroContent.description}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href={heroContent.primaryCta.href}>
              {heroContent.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={heroContent.secondaryCta.href} variant="secondary">
              {heroContent.secondaryCta.label}
            </ButtonLink>
          </div>
        </div>

        <div className="flex aspect-4/3 items-center justify-center rounded-lg border border-dashed border-border bg-surface p-6 text-center text-sm text-muted">
          {heroContent.visualLabel}
        </div>
      </Container>
    </Section>
  );
}
