import Link from "next/link";
import { Container } from "@/components/layout/container";
import { productCategories } from "@/data/products";
import { contactInfo, mainNavigation, siteConfig, socialLinks } from "@/data/site";

const headingClass = "text-sm font-semibold uppercase tracking-wide";
const listClass = "mt-4 space-y-2 text-sm text-muted";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="grid-auto-fit grid gap-10 py-12">
        <div>
          <p className="text-lg font-bold">{siteConfig.name}</p>
          <p className="mt-3 text-sm text-muted">{siteConfig.tagline}</p>
        </div>

        <nav aria-labelledby="footer-navigation">
          <h2 id="footer-navigation" className={headingClass}>
            Quick Links
          </h2>
          <ul className={listClass}>
            {mainNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
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
                <Link href="/#products" className="hover:text-foreground">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={headingClass}>Contact</h2>
          <address className={`${listClass} not-italic`}>
            {contactInfo.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="block">{contactInfo.email}</span>
            <span className="block">{contactInfo.phone}</span>
          </address>
        </div>

        <div>
          <h2 className={headingClass}>Follow Us</h2>
          <ul className={listClass}>
            {socialLinks.map((social) => (
              <li key={social.label}>
                {social.href ? (
                  <a href={social.href} className="hover:text-foreground">
                    {social.label}
                  </a>
                ) : (
                  social.label
                )}
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="py-6 text-sm text-muted">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
