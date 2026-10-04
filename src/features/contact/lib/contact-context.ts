import { whatsappMessages } from "@/data/home";
import { activeSection } from "@/features/navigation/lib/section-scroll";

export type ContactContext = keyof typeof whatsappMessages;

/** Share of the viewport, centred, in which a [data-contact-context] block counts as what the visitor is looking at. */
const BAND = [0.3, 0.7] as const;

/** A marked block in view (the sample-pack card, the quote banner), otherwise the section being read. */
export function contactContext(): ContactContext {
  const top = window.innerHeight * BAND[0];
  const bottom = window.innerHeight * BAND[1];
  for (const element of document.querySelectorAll<HTMLElement>("[data-contact-context]")) {
    const rect = element.getBoundingClientRect();
    if (rect.top < bottom && rect.bottom > top) return element.dataset.contactContext as ContactContext;
  }
  return activeSection();
}
