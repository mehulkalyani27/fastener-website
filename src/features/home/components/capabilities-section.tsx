import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Card } from "@/components/ui/card";
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
        <ul className="grid-auto-fit mt-10 grid gap-6">
          {capabilitiesContent.items.map((item) => (
            <li key={item.title} className="flex">
              <Card title={item.title} description={item.description} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
