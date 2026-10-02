import { Container } from "@/components/layout/container";
import { threadedContent } from "@/data/home";
import { ThreadedStory } from "@/features/experience/components/threaded-visual";

/** Scroll-driven fastener story inside the About section: titles enter right → left → right. */
export function ThreadExperience() {
  return (
    <section aria-labelledby="thread-title" className="surface-ink relative isolate overflow-clip">
      <Container className="pt-section pb-8">
        <h3 id="thread-title" className="max-w-3xl text-heading font-semibold">
          {threadedContent.title}
        </h3>
      </Container>
      <ThreadedStory panels={threadedContent.panels} />
    </section>
  );
}
