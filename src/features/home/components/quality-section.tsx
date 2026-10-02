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

        <div className="mt-block border-t border-foreground/10 pt-10">
          <h3 className="eyebrow text-muted">{qualityContent.certificationsTitle}</h3>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:max-w-3xl lg:grid-cols-3">
            {qualityContent.certifications.map((certification, index) => (
              <li
                key={`${certification}-${index}`}
                className="flex min-h-20 items-center gap-3 rounded-card border border-border bg-background px-5 py-4 text-sm font-medium shadow-card"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 12 12"
                  className="size-3.5 shrink-0 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M6 .8 10.5 3.4v5.2L6 11.2 1.5 8.6V3.4z" />
                </svg>
                {certification}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
