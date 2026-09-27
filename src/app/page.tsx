import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { siteConfig } from "@/data/site";

export default function Home() {
  return (
    <Section>
      <Container>
        <h1 className="text-display font-semibold">{siteConfig.name}</h1>
        <p className="mt-4 max-w-prose text-muted">
          This site is currently under development.
        </p>
      </Container>
    </Section>
  );
}
