import { Container } from "@/components/layout/container";
import { heroContent } from "@/data/home";
import { HeroVisual } from "@/features/experience/components/hero-visual";

/**
 * Two compositions (see the `split` variant):
 * - stacked (phones, portrait tablets): a visual band sized from the screen height, with the
 *   copy directly below it (content height, no full-screen stretch);
 * - split (laptop+, landscape): full-bleed visual, copy in the left ~half of the grid, bolt
 *   centered on the grid's right column.
 */
export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-title"
      className="surface-ink relative isolate overflow-hidden [--hero-visual:clamp(10rem,32svh,24rem)] sm:[--hero-visual:clamp(16rem,40svh,30rem)]"
    >
      <HeroVisual />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[var(--hero-visual)] bg-linear-to-b from-transparent from-70% to-ink split:h-full split:bg-linear-to-r split:from-ink split:from-20% split:via-ink/50 split:via-45% split:to-transparent"
      />

      <Container className="relative z-10 flex flex-col pt-[var(--hero-visual)] pb-section split:min-h-[calc(100svh-var(--spacing-header))] split:justify-center split:py-section">
        <div className="max-w-xl sm:max-w-2xl split:max-w-[min(42rem,52%)]">
          <p className="eyebrow text-ink-accent">{heroContent.eyebrow}</p>
          <h1 id="hero-title" className="mt-4 text-display font-bold short:text-[2rem] sm:mt-5">
            {heroContent.title}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted short:mt-3 sm:mt-6 sm:text-lg">
            {heroContent.description}
          </p>
        </div>
      </Container>
    </section>
  );
}
