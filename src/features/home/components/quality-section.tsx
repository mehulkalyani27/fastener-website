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
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:max-w-3xl">
            {qualityContent.certifications.map((certification, index) => (
              <li
                key={`${certification}-${index}`}
                className="flex min-h-20 items-center justify-center rounded-card border border-dashed border-muted/40 bg-background px-4 text-center text-sm text-muted"
              >
                {certification}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
