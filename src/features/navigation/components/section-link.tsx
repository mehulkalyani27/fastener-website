"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { sectionFromPath } from "@/data/sections";
import { scrollToSection } from "@/features/navigation/lib/section-scroll";

type SectionLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & { href: string };

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/**
 * Link to a clean section URL (/about, /products, …). On the page that holds the section, a plain
 * click scrolls to it and records the path with pushState (replace when already there) — no
 * navigation, no reload, no hash. Elsewhere, or for new tabs, it is an ordinary link to that URL.
 * The link for the section currently in view is marked aria-current="page".
 */
export function SectionLink({ href, onClick, ...props }: SectionLinkProps) {
  const pathname = usePathname();
  const target = sectionFromPath(href);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !target || !isPlainClick(event) || props.target === "_blank") return;
    if (!scrollToSection(target)) return;
    event.preventDefault();
    if (window.location.pathname === href) window.history.replaceState(null, "", href);
    else window.history.pushState(null, "", href);
  };

  return (
    <Link
      href={href}
      aria-current={target && pathname === href ? "page" : undefined}
      onClick={handleClick}
      {...props}
    />
  );
}
