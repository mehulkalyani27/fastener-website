import { CONTACT_REQUIRED_MESSAGE, validateInquiry } from "@/features/contact/validation";
import type { InquiryField, InquiryValues } from "@/features/contact/types";

export { CONTACT_REQUIRED_MESSAGE };

export type InquiryErrors = Partial<Record<InquiryField, string>>;

/** The server's rules (`validateInquiry`), with plainer messages for the fields left empty. */
export function validateInquiryFields(input: InquiryValues): InquiryErrors {
  const result = validateInquiry(input);
  const errors: InquiryErrors = result.ok ? {} : { ...result.fieldErrors };
  const { name, message } = result.ok ? result.value : result.values;

  if (!name) errors.name = "Please enter your name.";
  if (!message) errors.message = "Please enter your message.";
  return errors;
}
