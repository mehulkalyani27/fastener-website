"use client";

import { type ReactNode, useEffect, useState } from "react";
import { contactContent, whatsappMessages } from "@/data/home";
import { contactInfo, phoneLinks, whatsappLink } from "@/data/site";
import { PhoneIcon, WhatsAppIcon } from "@/features/contact/components/contact-icons";
import { type ContactContext, contactContext } from "@/features/contact/lib/contact-context";

const HEX = "14,1 25.3,7.5 25.3,20.5 14,27 2.7,20.5 2.7,7.5";
const HEX_INNER = "14,4 22.7,9 22.7,19 14,24 5.3,19 5.3,9";
type HexLinkProps = {
  href: string;
  /** Accessible name. */
  label: string;
  /** Text shown beside the hex on hover and focus. */
  tip: string;
  fill: string;
  icon: ReactNode;
  external?: boolean;
};

/** A hexagonal link that turns a notch (like a nut being seated) on hover and focus. */
function HexLink({ href, label, tip, fill, icon, external }: HexLinkProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={label}
      className="group relative flex size-14 items-center justify-center text-white drop-shadow-[0_8px_16px_rgb(31_36_64/0.3)] transition-transform duration-200 ease-standard active:scale-95"
    >
      <svg
        viewBox="0 0 28 28"
        aria-hidden="true"
        className="absolute inset-0 size-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-focus-visible:rotate-30 pointer-fine:group-hover:rotate-30"
      >
        <polygon points={HEX} fill={fill} stroke={fill} strokeWidth="2" strokeLinejoin="round" />
        <polygon points={HEX_INNER} fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="0.75" />
      </svg>
      {icon}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-full mr-3 -translate-y-1/2 rounded-full bg-primary px-4 py-2 text-sm font-semibold whitespace-nowrap text-primary-foreground opacity-0 shadow-raised transition-opacity duration-200 ease-standard group-focus-visible:opacity-100 pointer-fine:group-hover:opacity-100"
      >
        {tip}
      </span>
    </a>
  );
}

const whatsappIcon = <WhatsAppIcon className="relative size-7" />;
const phoneIcon = <PhoneIcon className="relative size-6" />;

/**
 * WhatsApp and Call as two hex-nut shaped links in the corner. The WhatsApp message follows what the
 * visitor is looking at. Both step aside over the Contact section and footer, which carry the same links.
 */
export function ContactLauncher() {
  const [hidden, setHidden] = useState(false);
  const [context, setContext] = useState<ContactContext>("home");

  useEffect(() => {
    const targets = [document.getElementById("contact"), document.querySelector("footer")];
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const { target, isIntersecting } of entries) {
        if (isIntersecting) visible.add(target);
        else visible.delete(target);
      }
      setHidden(visible.size > 0);
    });
    targets.forEach((target) => target && observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setContext(contactContext());
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  return (
    <div
      inert={hidden}
      className={`fixed right-4 bottom-4 z-30 flex flex-col gap-3 transition-[opacity,translate] duration-300 ease-standard sm:bottom-24 sm:pointer-coarse:bottom-4 print:hidden ${
        hidden ? "pointer-events-none translate-y-3 opacity-0" : ""
      }`}
    >
      <HexLink
        href={whatsappLink(whatsappMessages[context])}
        external
        label={`${contactContent.whatsappLabel}: ${contactInfo.phone}`}
        tip={contactContent.whatsappLabel}
        fill="var(--color-whatsapp)"
        icon={whatsappIcon}
      />
      <HexLink
        href={phoneLinks.call}
        label={`${contactContent.callLabel}: ${contactInfo.phone}`}
        tip={contactContent.callLabel}
        fill="var(--color-primary)"
        icon={phoneIcon}
      />
    </div>
  );
}
