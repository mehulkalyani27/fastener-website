import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Card } from "@/components/ui/card";
import { CardGrid } from "@/components/ui/card-grid";
import { SectionHeader } from "@/components/ui/section-header";
import { qualityContent } from "@/data/home";

export function QualitySection() {
  return (
    <Section id="quality" tone="surface" aria-labelledby="quality-title">
      <Container>
        <SectionHeader
          id="quality-title"
          title={qualityContent.title}
          description={qualityContent.commitment}
        />
        <CardGrid columns={4}>
          {qualityContent.processes.map((process, index) => (
            <li key={process.title} className="flex">
              <Card index={index} title={process.title} description={process.description} />
            </li>
          ))}
        </CardGrid>

        <figure
          data-reveal
          aria-labelledby="certification-label"
          className="surface-ink mt-block rounded-card p-8 shadow-raised sm:p-10 lg:p-12"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
              <svg
                aria-hidden="true"
                viewBox="0 0 64 64"
                className="size-16 shrink-0 text-ink-foreground sm:size-20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
              >
                <path d="M32 3 57 17.5v29L32 61 7 46.5v-29z" />
                <path d="M21 33l8 8 15-17" />
              </svg>
              <div>
                <p id="certification-label" className="eyebrow text-ink-accent">
                  {qualityContent.certification.label}
                </p>
                <p className="mt-3 text-heading font-semibold">{qualityContent.certification.standard}</p>
                <p className="mt-1 text-lg text-ink-muted">{qualityContent.certification.name}</p>
              </div>
            </div>
            <figcaption className="max-w-md leading-relaxed text-ink-muted lg:border-l lg:border-ink-border lg:pl-10">
              {qualityContent.certification.note}
            </figcaption>
          </div>
        </figure>
      </Container>
    </Section>
  );
}
