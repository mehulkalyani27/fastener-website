import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { QuoteButton } from "@/components/ui/quote-button";
import { mainNavigation, primaryCta } from "@/data/site";
import { SectionLink } from "@/features/navigation/components/section-link";

export function SiteHeader() {
  return (
    <header data-site-header className="surface-ink sticky top-0 z-40 border-b border-ink-border">
      <Container className="relative flex h-header items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-6 xl:gap-9">
            {mainNavigation.map((item) => (
              <li key={item.href}>
                <SectionLink
                  href={item.href}
                  className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-bottom bg-no-repeat py-1 text-sm font-medium text-ink-muted transition-[background-size,color] duration-300 ease-standard hover:bg-[length:100%_1px] hover:text-ink-foreground aria-[current=page]:bg-[length:100%_1px] aria-[current=page]:text-ink-foreground"
                >
                  {item.label}
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Wrapper owns visibility: QuoteButton sets its own display, which would override `hidden`. */}
        <div className="hidden lg:block">
          <QuoteButton href={primaryCta.href} size="sm">
            {primaryCta.label}
          </QuoteButton>
        </div>

        <MobileNav items={mainNavigation} cta={primaryCta} />
      </Container>
    </header>
  );
}
