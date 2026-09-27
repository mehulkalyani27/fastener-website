import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Card } from "@/components/ui/card";
import { CardGrid } from "@/components/ui/card-grid";
import { SectionHeader } from "@/components/ui/section-header";
import { capabilitiesContent } from "@/data/home";

export function CapabilitiesSection() {
  return (
    <Section id="capabilities" aria-labelledby="capabilities-title">
      <Container>
        <SectionHeader
          id="capabilities-title"
          title={capabilitiesContent.title}
          description={capabilitiesContent.description}
        />
        <CardGrid>
          {capabilitiesContent.items.map((item, index) => (
            <li key={item.title} className="flex">
              <Card index={index} title={item.title} description={item.description} />
            </li>
          ))}
        </CardGrid>
      </Container>
    </Section>
  );
}
