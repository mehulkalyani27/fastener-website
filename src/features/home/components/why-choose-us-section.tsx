import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/ui/section-header";
import { whyChooseUsContent } from "@/data/home";
import { formatIndex } from "@/lib/format";

export function WhyChooseUsSection() {
  return (
    <Section id="why-choose-us" aria-labelledby="why-choose-us-title">
      <Container>
        <SectionHeader id="why-choose-us-title" title={whyChooseUsContent.title} />
        <ul className="mt-block grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUsContent.items.map((item, index) => (
            <li key={item.title} data-reveal className="border-t-2 border-primary pt-6">
              <span aria-hidden="true" className="text-xs font-semibold tracking-[0.2em] text-muted tabular-nums">
                {formatIndex(index)}
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-[-0.015em]">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{item.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
