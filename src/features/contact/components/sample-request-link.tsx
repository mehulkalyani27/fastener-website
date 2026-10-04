"use client";

import type { ComponentPropsWithoutRef } from "react";
import { contactContent } from "@/data/home";
import { setInquiryIntent } from "@/features/contact/lib/inquiry-intent";
import { SectionLink } from "@/features/navigation/components/section-link";

/** Link to the contact form that opens it as a sample-pack request. */
export function SampleRequestLink(props: ComponentPropsWithoutRef<typeof SectionLink>) {
  return <SectionLink {...props} onClick={() => setInquiryIntent(contactContent.samplePackMessage)} />;
}
