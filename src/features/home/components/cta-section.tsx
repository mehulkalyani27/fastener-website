import { Container } from "@/components/layout/container";
import { LogoMark } from "@/components/layout/logo";
import { Section } from "@/components/layout/section";
import { ctaContent } from "@/data/home";

export function CtaSection() {
  return (
    <Section tone="ink" aria-labelledby="cta-title" className="relative isolate overflow-hidden">
      <LogoMark className="pointer-events-none absolute top-1/2 -right-16 -z-10 h-[130%] w-auto -translate-y-1/2 text-ink-foreground opacity-[0.04] sm:right-0" />
      <Container className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h2 id="cta-title" className="text-heading font-semibold">
            {ctaContent.title}
          </h2>
        </div>
      </Container>
    </Section>
  );
}
