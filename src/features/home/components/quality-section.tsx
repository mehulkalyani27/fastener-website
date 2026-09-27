import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Card } from "@/components/ui/card";
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
        <ul className="grid-auto-fit mt-10 grid gap-6">
          {qualityContent.processes.map((process) => (
            <li key={process.title} className="flex">
              <Card title={process.title} description={process.description} />
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <h3 className="text-lg font-semibold">{qualityContent.certificationsTitle}</h3>
          <ul className="mt-4 flex flex-wrap gap-4">
            {qualityContent.certifications.map((certification, index) => (
              <li
                key={`${certification}-${index}`}
                className="rounded-md border border-dashed border-border bg-background px-5 py-3 text-sm text-muted"
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
