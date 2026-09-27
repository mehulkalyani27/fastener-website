import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { whyChooseUsContent } from "@/data/home";

export function WhyChooseUsSection() {
  return (
    <Section id="why-choose-us" aria-labelledby="why-choose-us-title">
      <Container>
        <SectionHeader id="why-choose-us-title" title={whyChooseUsContent.title} />
        <ul className="grid-auto-fit mt-10 grid gap-6">
          {whyChooseUsContent.items.map((item) => (
            <li key={item.title} className="flex">
              <Card title={item.title} description={item.description} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
