"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button-link";
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
        className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm font-semibold"
      >
        {open ? "Close" : "Menu"}
      </button>

      <nav
        id="mobile-navigation"
        aria-label="Mobile"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-border bg-background"
      >
        <ul className="mx-auto flex max-w-content flex-col px-gutter py-4">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={close}
                className="block py-3 text-base font-medium hover:text-primary"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="pt-3">
            <ButtonLink href={cta.href} onClick={close} className="w-full">
              {cta.label}
            </ButtonLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}
