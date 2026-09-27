import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Card } from "@/components/ui/card";
import { CardGrid } from "@/components/ui/card-grid";
import { SectionHeader } from "@/components/ui/section-header";
import { industriesContent } from "@/data/home";
import { industries } from "@/data/industries";

export function IndustriesSection() {
  return (
    <Section id="industries" tone="surface" aria-labelledby="industries-title">
      <Container>
        <SectionHeader
          id="industries-title"
          title={industriesContent.title}
          description={industriesContent.description}
        />
        <CardGrid>
          {industries.map((industry) => (
            <li key={industry.slug} className="flex">
              <Card title={industry.name} description={industry.description}>
                <ul aria-label="Example applications" className="mt-auto flex flex-wrap gap-2 pt-6">
                  {industry.applications.map((application) => (
                    <li
                      key={application}
                      className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted"
                    >
                      {application}
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </CardGrid>
      </Container>
    </Section>
  );
}
