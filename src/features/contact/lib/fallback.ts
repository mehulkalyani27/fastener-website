import type { InquiryValues } from "@/features/contact/types";

const MAX_MESSAGE = 1200;

/** The visitor's inquiry as a WhatsApp message, for when it could not be sent through the form. */
export function fallbackMessage({ name, message, email }: InquiryValues) {
  const text = message.length > MAX_MESSAGE ? `${message.slice(0, MAX_MESSAGE)}…` : message;
  return [`Hello Metacore Fasteners, this is ${name}.`, "", text, ...(email ? ["", `Email: ${email}`] : [])].join("\n");
}
