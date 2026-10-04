"use server";

import { headers } from "next/headers";
import { processSubmission, type SupabaseConfig } from "@/features/contact/service";
import type { InquiryFormState } from "@/features/contact/types";

function readConfig(): SupabaseConfig | null {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, INQUIRY_IP_SALT } = process.env;
  return SUPABASE_URL && SUPABASE_ANON_KEY && INQUIRY_IP_SALT
    ? { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY, ipSalt: INQUIRY_IP_SALT }
    : null;
}

function pathOf(referer: string | null) {
  try {
    return referer ? new URL(referer).pathname.slice(0, 200) : null;
  } catch {
    return null;
  }
}

/** Server Action behind the contact form: validates, then stores the inquiry in Supabase. */
export async function submitInquiry(_previous: InquiryFormState, formData: FormData): Promise<InquiryFormState> {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || null;
  return processSubmission(formData, { source: pathOf(requestHeaders.get("referer")), ip }, readConfig());
}
