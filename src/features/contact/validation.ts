import type { InquiryField, InquiryValues } from "@/features/contact/types";

/** Limits shared by the form attributes, the server check and (as constraints) the database. */
export const INQUIRY_LIMITS = {
  name: { min: 2, max: 100 },
  phone: { min: 7, max: 20 },
  email: { min: 5, max: 254 },
  message: { min: 10, max: 2000 },
} as const;

const PHONE_CHARACTERS = /^[0-9+()\-.\s]+$/;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

/** One line: control characters removed, whitespace collapsed. */
const singleLine = (value: string) => value.replace(CONTROL_CHARACTERS, "").replace(/\s+/g, " ").trim();

const multiLine = (value: string) =>
  value.replace(/\r\n?/g, "\n").replace(CONTROL_CHARACTERS, "").replace(/\n{3,}/g, "\n\n").trim();

/** Length in characters as the database counts them (an emoji is one character, not two UTF-16 units). */
const length = (value: string) => Array.from(value).length;

export type ValidationResult =
  | { ok: true; value: InquiryValues }
  | { ok: false; fieldErrors: Partial<Record<InquiryField, string>>; values: InquiryValues };

const text = (entry: FormDataEntryValue | null | undefined) => (typeof entry === "string" ? entry : "");

/** Cleans and checks the submitted fields. The database repeats these limits as constraints. */
export function validateInquiry(input: Partial<Record<InquiryField, FormDataEntryValue | null>>): ValidationResult {
  const values: InquiryValues = {
    name: singleLine(text(input.name)),
    phone: singleLine(text(input.phone)),
    email: singleLine(text(input.email)),
    message: multiLine(text(input.message)),
  };
  const errors: Partial<Record<InquiryField, string>> = {};
  const { name, phone, email, message } = INQUIRY_LIMITS;

  if (length(values.name) < name.min) errors.name = `Please enter your name (at least ${name.min} characters).`;
  else if (length(values.name) > name.max) errors.name = `Please keep your name under ${name.max} characters.`;

  const digits = values.phone.replace(/\D/g, "").length;
  if (!PHONE_CHARACTERS.test(values.phone) || digits < phone.min || length(values.phone) > phone.max) {
    errors.phone = "Please enter a valid phone number, with country code if outside India.";
  }

  if (!EMAIL_SHAPE.test(values.email) || length(values.email) < email.min || length(values.email) > email.max) {
    errors.email = "Please enter a valid email address.";
  }

  if (length(values.message) < message.min) errors.message = `Please tell us a little more (at least ${message.min} characters).`;
  else if (length(values.message) > message.max) errors.message = `Please keep your message under ${message.max} characters.`;

  return Object.keys(errors).length > 0 ? { ok: false, fieldErrors: errors, values } : { ok: true, value: values };
}
