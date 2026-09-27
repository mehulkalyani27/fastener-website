import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/ui/section-header";
import { aboutContent } from "@/data/home";

export function AboutSection() {
  return (
    <Section id="about" tone="surface" aria-labelledby="about-title">
      <Container className="grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHeader id="about-title" title={aboutContent.title} />
          <div className="mt-6 space-y-4 text-muted">
            {aboutContent.introduction.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <dl className="mt-8 grid gap-6 sm:grid-cols-3">
            {aboutContent.facts.map((fact) => (
              <div key={fact.title}>
                <dt className="text-sm text-muted">{fact.title}</dt>
                <dd className="mt-1 font-semibold">{fact.description}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-semibold">What we offer</h3>
          <ul className="mt-4 space-y-3">
            {aboutContent.capabilities.map((capability) => (
              <li key={capability} className="rounded-md border border-border bg-background p-4">
                {capability}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
