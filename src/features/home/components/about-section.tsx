import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/ui/section-header";
import { aboutContent } from "@/data/home";
import { ThreadExperience } from "@/features/home/components/thread-experience";

export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title">
      <div className="bg-surface py-section">
        <Container className="grid gap-12 lg:grid-cols-[7fr_5fr] lg:gap-20">
          <div>
            <SectionHeader id="about-title" title={aboutContent.title} />
            <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-muted">
              {aboutContent.introduction.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <dl className="mt-block grid gap-6 sm:grid-cols-3">
              {aboutContent.facts.map((fact) => (
                <div key={fact.title} className="border-t border-foreground/15 pt-5">
                  <dt className="text-sm text-muted">{fact.title}</dt>
                  <dd className="mt-2 text-lg font-semibold tracking-[-0.01em] break-words">
                    {fact.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            data-reveal
            className="self-start rounded-card border border-border bg-background p-6 shadow-card sm:p-8"
          >
            <h3 className="eyebrow text-muted">What we offer</h3>
            <ul className="mt-6 divide-y divide-border">
              {aboutContent.capabilities.map((capability) => (
                <li key={capability} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 12 12"
                    className="mt-1.5 size-3 shrink-0 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M6 .8 10.5 3.4v5.2L6 11.2 1.5 8.6V3.4z" />
                  </svg>
                  <span className="font-medium">{capability}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </div>
      <ThreadExperience />
    </section>
  );
}
