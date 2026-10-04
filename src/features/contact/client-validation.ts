import type { InquiryField, InquiryValues } from "@/features/contact/types";
import { validateInquiry } from "@/features/contact/validation";

export type InquiryErrors = Partial<Record<InquiryField, string>>;

export const CONTACT_REQUIRED_MESSAGE = "Please enter a phone number or an email address.";

/**
 * The form's checks before anything is sent: name and message are required, and so is at least one
 * of phone and email. Formats and lengths come from `validateInquiry`; an empty phone or email is
 * only an error when the other is empty too. The "phone or email" error is reported on `email`.
 */
export function validateInquiryFields(input: InquiryValues): InquiryErrors {
  const result = validateInquiry(input);
  const errors: InquiryErrors = result.ok ? {} : { ...result.fieldErrors };
  const { name, phone, email, message } = result.ok ? result.value : result.values;

  if (!name) errors.name = "Please enter your name.";
  if (!message) errors.message = "Please enter your message.";

  if (!phone) delete errors.phone;
  if (!email) delete errors.email;
  if (!phone && !email) errors.email = CONTACT_REQUIRED_MESSAGE;

  return errors;
}
