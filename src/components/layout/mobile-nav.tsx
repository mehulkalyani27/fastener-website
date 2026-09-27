"use client";

import { useEffect, useState } from "react";
import { QuoteButton } from "@/components/ui/quote-button";
import { SectionLink } from "@/features/navigation/components/section-link";
import type { NavItem } from "@/types/content";

type MobileNavProps = {
  items: NavItem[];
  cta: NavItem;
};

export function MobileNav({ items, cta }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-2.5 rounded-control border border-ink-border px-4 text-sm font-semibold"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
          {open ? <path d="M3 3l10 10M13 3L3 13" /> : <path d="M2 5h12M2 11h12" />}
        </svg>
        {open ? "Close" : "Menu"}
      </button>

      <nav
        id="mobile-navigation"
        aria-label="Mobile"
        hidden={!open}
        className="surface-ink absolute inset-x-0 top-full max-h-[calc(100svh-var(--spacing-header))] overflow-y-auto border-b border-ink-border shadow-raised"
      >
        <ul className="mx-auto flex max-w-content flex-col px-gutter pt-2 pb-6">
          {items.map((item) => (
            <li key={item.href} className="border-b border-ink-border">
              <SectionLink
                href={item.href}
                onClick={close}
                className="block py-4 text-base font-medium text-ink-muted hover:text-ink-foreground aria-[current=page]:text-ink-foreground"
              >
                {item.label}
              </SectionLink>
            </li>
          ))}
          <li className="pt-6">
            <QuoteButton href={cta.href} onClick={close} className="w-full">
              {cta.label}
            </QuoteButton>
          </li>
        </ul>
      </nav>
    </div>
  );
}
