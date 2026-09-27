import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Card } from "@/components/ui/card";
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
        <ul className="grid-auto-fit mt-10 grid gap-6">
          {industries.map((industry) => (
            <li key={industry.slug} className="flex">
              <Card title={industry.name} description={industry.description}>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
                  {industry.applications.map((application) => (
                    <li key={application}>{application}</li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
