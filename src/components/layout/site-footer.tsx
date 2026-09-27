import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { productCategories } from "@/data/products";
import { sectionPath } from "@/data/sections";
import { contactInfo, mainNavigation, siteConfig, socialLinks } from "@/data/site";
import { SectionLink } from "@/features/navigation/components/section-link";

const headingClass = "eyebrow text-ink-accent";
const listClass = "mt-5 space-y-1 text-sm text-ink-muted";
const linkClass = "inline-block py-1 transition-colors hover:text-ink-foreground";

export function SiteFooter() {
  return (
    <footer className="surface-ink">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-12 py-16 sm:py-20 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr_1fr] lg:gap-x-10">
        <div className="col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-muted">{siteConfig.tagline}</p>
        </div>

        <nav aria-labelledby="footer-navigation">
          <h2 id="footer-navigation" className={headingClass}>
            Quick Links
          </h2>
          <ul className={listClass}>
            {mainNavigation.map((item) => (
              <li key={item.href}>
                <SectionLink href={item.href} className={linkClass}>
                  {item.label}
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-products">
          <h2 id="footer-products" className={headingClass}>
            Products
          </h2>
          <ul className={listClass}>
            {productCategories.map((category) => (
              <li key={category.slug}>
                <SectionLink href={sectionPath("products")} className={linkClass}>
                  {category.name}
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 sm:col-span-1">
          <h2 className={headingClass}>Contact</h2>
          <address className={`${listClass} break-words not-italic`}>
            {contactInfo.address.map((line) => (
              <span key={line} className="block py-1">
                {line}
              </span>
            ))}
            <span className="block py-1">{contactInfo.email}</span>
            <span className="block py-1">{contactInfo.phone}</span>
          </address>
        </div>

        <div>
          <h2 className={headingClass}>Follow Us</h2>
          <ul className={listClass}>
            {socialLinks.map((social) => (
              <li key={social.label}>
                {social.href ? (
                  <a href={social.href} className={linkClass}>
                    {social.label}
                  </a>
                ) : (
                  <span className="inline-block py-1">{social.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-ink-border">
        <Container className="py-6 text-xs tracking-wide text-ink-muted sm:text-sm">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
