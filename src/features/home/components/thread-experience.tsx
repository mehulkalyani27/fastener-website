import { threadedContent } from "@/data/home";
import { ThreadedStory } from "@/features/experience/components/threaded-visual";

/** Scroll-driven fastener story inside the About section: titles enter right → left → right. */
export function ThreadExperience() {
  return (
    <section aria-labelledby="thread-title" className="surface-ink relative isolate overflow-clip">
      <h3 id="thread-title" className="sr-only">
        {threadedContent.title}
      </h3>
      <ThreadedStory panels={threadedContent.panels} />
    </section>
  );
}
