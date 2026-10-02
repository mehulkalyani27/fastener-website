import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Card } from "@/components/ui/card";
import { balancedItemClass, CardGrid } from "@/components/ui/card-grid";
import { SectionHeader } from "@/components/ui/section-header";
import { industriesContent } from "@/data/home";
import { industries, industryStories } from "@/data/industries";
import { IndustryStory } from "@/features/industries/components/industry-story";

/**
 * Each industry is told as a chapter of one pinned 3D story. Without 3D, the industries are shown
 * as cards.
 */
export function IndustriesSection() {
  const chapters = industryStories.map((story) => ({
    ...story,
    industry: industries.find((industry) => industry.slug === story.slug)!.name,
  }));

  return (
    <Section id="industries" tone="surface" aria-labelledby="industries-title">
      <Container>
        <SectionHeader
          id="industries-title"
          title={industriesContent.title}
          description={industriesContent.description}
        />
      </Container>
      <IndustryStory
        chapters={chapters}
        fallback={
          <Container>
            <CardGrid columns="balanced">
              {industries.map((industry, index) => (
                <li key={industry.slug} className={`flex ${balancedItemClass(index, industries.length)}`}>
                  <Card index={index} title={industry.name} description={industry.description} />
                </li>
              ))}
            </CardGrid>
          </Container>
        }
      />
    </Section>
  );
}
