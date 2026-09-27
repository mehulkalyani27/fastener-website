import Link from "next/link";
import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ButtonLink } from "@/components/ui/button-link";
import { mainNavigation, primaryCta, siteConfig } from "@/data/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <Container className="relative flex h-header items-center justify-between gap-6">
        <Link href="/" className="text-lg font-bold">
          {siteConfig.name}
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {mainNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm font-medium hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ButtonLink href={primaryCta.href} className="hidden lg:inline-flex">
          {primaryCta.label}
        </ButtonLink>

        <MobileNav items={mainNavigation} cta={primaryCta} />
      </Container>
    </header>
  );
}
