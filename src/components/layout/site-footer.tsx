import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { productCategories } from "@/data/products";
import { sectionPath } from "@/data/sections";
import { contactInfo, mainNavigation, phoneLinks, siteConfig, socialLinks } from "@/data/site";
import { SectionLink } from "@/features/navigation/components/section-link";

// The eyebrow style, with tighter tracking on phones so "PRODUCT RANGE" stays on one line and every
// list starts at the same height. Headings and links never wrap; the columns are sized to fit them.
const headingClass =
  "text-[0.8125rem] font-medium tracking-[0.2em] whitespace-nowrap text-ink-accent uppercase sm:tracking-[0.3em]";
const listClass = "mt-5 space-y-1 text-sm text-ink-muted";
const linkClass = "inline-block py-1 whitespace-nowrap transition-colors hover:text-ink-foreground";
const contactLinkClass = "block py-1 transition-colors hover:text-ink-foreground";

export function SiteFooter() {
  return (
    <footer data-cursor-plain className="surface-ink">
      {/* Column widths are sized so each heading and its longest link fit on one line. Below 360px the
            first column is narrower so "PRODUCT RANGE" and "Materials & Hardness" still fit beside it. */}
      <Container className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-x-4 gap-y-12 py-16 min-[360px]:grid-cols-2 sm:gap-x-6 sm:py-20 lg:grid-cols-[1.5fr_1fr_1.3fr_1.3fr_0.9fr] lg:gap-x-8 xl:gap-x-10">
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
            Product Range
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
            <a href={`mailto:${contactInfo.email}`} className={contactLinkClass}>
              {contactInfo.email}
            </a>
            <a href={phoneLinks.call} className={contactLinkClass}>
              {contactInfo.phone}
            </a>
            {contactInfo.hours.map((line) => (
              <span key={line} className="block py-1">
                {line}
              </span>
            ))}
          </address>
        </div>

        <div>
          <h2 className={headingClass}>Follow Us</h2>
          <ul className={listClass}>
            {socialLinks.map((social) => (
              <li key={social.label}>
                {social.href ? (
                  <a href={social.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
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
